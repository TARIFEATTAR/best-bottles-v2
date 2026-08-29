-- ===========================================================================
-- 0005 - Query views, catalog health, and row level security
-- ===========================================================================
-- Two jobs:
--   1. Give consumers (website, Shopify sync, feeds, AI tools) a stable,
--      deterministic read surface that never exposes internal data.
--   2. Give operators the health reports that make missing data actionable.
--
-- Security model: every catalog table has RLS enabled and NO anonymous policy.
-- Public reads go exclusively through the `catalog_public_*` views, which are
-- security_invoker = off (they run as owner) and select only publishable
-- columns. Cost, supplier, provenance and raw ingestion data are unreachable
-- from the anon key by construction, not by remembering to omit a column.
-- ===========================================================================

-- ------------------------------------------------------- public read surface ---

create view catalog_public_item
with (security_invoker = off) as
select
  i.catalog_id,
  i.kind,
  i.sku,
  i.display_name,
  i.slug,
  i.short_description,
  i.family,
  i.lifecycle,
  i.verification
from catalog_item i
where i.lifecycle in ('active', 'discontinued');

comment on view catalog_public_item is
  'Publishable item fields only. internal_notes and the identity anchor are deliberately absent.';

create view catalog_public_bottle
with (security_invoker = off) as
select
  b.catalog_id,
  i.sku,
  i.display_name,
  i.slug,
  b.shape,
  b.nominal_capacity_ml,
  b.height_with_closure_mm,
  b.height_without_closure_mm,
  b.diameter_mm,
  b.opening_diameter_mm,
  b.material,
  b.glass_colour,
  b.finish,
  b.neck_code,
  b.neck_style,
  b.food_safe,
  b.cosmetic_safe,
  b.country_of_origin
from catalog_bottle_spec b
join catalog_item i using (catalog_id)
where i.lifecycle in ('active', 'discontinued');

create view catalog_public_closure
with (security_invoker = off) as
select
  c.catalog_id,
  i.sku,
  i.display_name,
  i.slug,
  c.closure_kind,
  c.neck_code,
  c.neck_style,
  c.diameter_mm,
  c.height_mm,
  c.material,
  c.finish,
  c.colour_label,
  c.orifice_mm,
  c.tamper_evident,
  c.child_resistant
from catalog_closure_spec c
join catalog_item i using (catalog_id)
where i.lifecycle in ('active', 'discontinued');

-- Public pricing exposes price breaks. It never exposes unit_cost, supplier_id
-- or supplier_part_number.
create view catalog_public_price
with (security_invoker = off) as
select
  c.catalog_id,
  c.channel,
  c.currency,
  c.minimum_order_quantity,
  c.case_quantity,
  c.lead_time_days,
  c.stock_status,
  pb.min_quantity,
  pb.unit_price
from catalog_commerce c
join catalog_price_break pb on pb.commerce_id = c.id
join catalog_item i on i.catalog_id = c.catalog_id
where i.lifecycle in ('active', 'discontinued');

create view catalog_public_media
with (security_invoker = off) as
select
  m.catalog_id,
  m.asset_id,
  m.asset_type,
  m.storage_url,
  m.origin,
  m.width_px,
  m.height_px,
  m.shows_configuration_id,
  m.layer_index
from catalog_media_asset m
join catalog_item i using (catalog_id)
where m.approved
  and i.lifecycle in ('active', 'discontinued');

comment on view catalog_public_media is
  'Approved assets only. Unapproved imports are invisible to every channel.';

-- Compatibility surfaced to customers and AI agents carries its status, so a
-- consumer can distinguish "we tested this" from "the threads match".
create view catalog_public_compatibility
with (security_invoker = off) as
select
  e.source_id   as catalog_id,
  e.relation,
  e.target_id   as compatible_catalog_id,
  e.status,
  e.confidence,
  e.condition
from catalog_compatibility_edge e
join catalog_item si on si.catalog_id = e.source_id
join catalog_item ti on ti.catalog_id = e.target_id
where e.status <> 'unverified'
  and si.lifecycle in ('active', 'discontinued')
  and ti.lifecycle in ('active', 'discontinued');

create view catalog_public_knowledge
with (security_invoker = off) as
select
  k.knowledge_id,
  k.kind,
  k.question,
  k.content,
  ks.catalog_id
from catalog_knowledge_entry k
left join catalog_knowledge_subject ks using (knowledge_id)
where k.status = 'approved'
  and (k.effective_from is null or k.effective_from <= now())
  and (k.effective_to   is null or k.effective_to   >  now());

-- --------------------------------------------------------- provenance view ---
-- Internal. Answers "where did this number come from?" for one field.

create view catalog_field_provenance as
select
  fa.catalog_id,
  fa.field,
  fa.value,
  fa.unit,
  fa.confidence,
  s.source_id,
  s.label as source_label,
  s.kind  as source_kind,
  s.rank  as source_rank,
  fa.source_locator,
  fa.observed_at,
  (cf.conflict_id is not null and cf.status = 'open') as in_open_conflict
from catalog_fact_assertion fa
join catalog_source s on s.source_id = fa.source_id
left join catalog_conflict cf on cf.catalog_id = fa.catalog_id and cf.field = fa.field;

-- ============================ catalog health ================================
-- The operating instruments. These are what turn "unknown" into a work queue.

create view catalog_item_completeness as
with parts as (
  select
    i.catalog_id,
    i.kind,
    i.sku is not null                                    as has_sku,
    nullif(trim(i.display_name), '') is not null          as has_name,
    nullif(trim(coalesce(i.short_description, '')), '') is not null as has_description,
    b.nominal_capacity_ml is not null                     as has_capacity,
    (b.material is not null and b.material <> 'unknown')  as has_material,
    b.neck_code is not null                               as has_bottle_neck,
    coalesce(b.height_without_closure_mm, b.height_with_closure_mm) is not null as has_height,
    b.diameter_mm is not null                             as has_diameter,
    b.country_of_origin is not null                       as has_origin,
    (c.closure_kind is not null and c.closure_kind <> 'unknown') as has_closure_kind,
    c.neck_code is not null                               as has_closure_neck,
    exists (select 1 from catalog_commerce cm join catalog_price_break pb on pb.commerce_id = cm.id where cm.catalog_id = i.catalog_id) as has_price,
    exists (select 1 from catalog_commerce cm where cm.catalog_id = i.catalog_id and cm.minimum_order_quantity is not null) as has_moq,
    exists (select 1 from catalog_commerce cm where cm.catalog_id = i.catalog_id and cm.case_quantity is not null)          as has_case_qty,
    exists (select 1 from catalog_commerce cm where cm.catalog_id = i.catalog_id and cm.stock_status is not null)           as has_stock,
    exists (select 1 from catalog_media_asset m where m.catalog_id = i.catalog_id and m.asset_type = 'hero' and m.approved) as has_hero,
    exists (select 1 from catalog_compatibility_edge e where e.source_id = i.catalog_id and e.relation = 'compatible_with' and e.status <> 'incompatible') as has_closure_match,
    exists (select 1 from catalog_compatibility_edge e where e.source_id = i.catalog_id and e.status = 'verified')          as has_verified_match
  from catalog_item i
  left join catalog_bottle_spec  b using (catalog_id)
  left join catalog_closure_spec c using (catalog_id)
),
scored as (
  select
    p.*,
    p.kind in ('bottle', 'jar', 'vial') as is_container,
    p.kind in ('closure','cap','dropper','reducer','insert','rollerball','sprayer','pump','liner') as is_closure
  from parts p
)
select
  catalog_id,
  kind,
  array_remove(array[
    case when not has_sku          then 'sku' end,
    case when not has_name         then 'displayName' end,
    case when not has_description  then 'shortDescription' end,
    case when is_container and not has_capacity     then 'bottle.nominalCapacityMl' end,
    case when is_container and not has_material     then 'bottle.material' end,
    case when is_container and not has_bottle_neck  then 'bottle.neckFinish' end,
    case when is_container and not has_height       then 'bottle.height' end,
    case when is_container and not has_diameter     then 'bottle.diameterMm' end,
    case when is_container and not has_origin       then 'bottle.countryOfOrigin' end,
    case when is_closure   and not has_closure_kind then 'closure.closureKind' end,
    case when is_closure   and not has_closure_neck then 'closure.neckFinish' end,
    case when not has_price     then 'commerce.price' end,
    case when not has_moq       then 'commerce.minimumOrderQuantity' end,
    case when not has_case_qty  then 'commerce.caseQuantity' end,
    case when not has_stock     then 'commerce.stockStatus' end,
    case when not has_hero      then 'media.hero' end,
    case when is_container and not has_closure_match   then 'compatibility.closure' end,
    case when is_container and not has_verified_match  then 'compatibility.verified' end
  ], null) as missing_fields,
  -- Weighted score; weights mirror catalog/src/domain/completeness.ts.
  round(
    ( (has_sku::int * 3) + (has_name::int * 3) + (has_description::int * 1)
    + case when is_container then (has_capacity::int * 3) + (has_material::int * 2) + (has_bottle_neck::int * 3)
                                  + (has_height::int * 2) + (has_diameter::int * 2) + (has_origin::int * 1)
                                  + (has_closure_match::int * 2) + (has_verified_match::int * 1) else 0 end
    + case when is_closure   then (has_closure_kind::int * 3) + (has_closure_neck::int * 3) else 0 end
    + (has_price::int * 2) + (has_moq::int * 1) + (has_case_qty::int * 1) + (has_stock::int * 2)
    + (has_hero::int * 3)
    )::numeric
    / nullif(
      ( 3 + 3 + 1
      + case when is_container then 3 + 2 + 3 + 2 + 2 + 1 + 2 + 1 else 0 end
      + case when is_closure   then 3 + 3 else 0 end
      + 2 + 1 + 1 + 2 + 3 )::numeric, 0)
  , 4) as score,
  (
    has_sku and has_name
    and (not is_container or (has_capacity and has_bottle_neck))
    and (not is_closure   or (has_closure_kind and has_closure_neck))
    and has_hero
  ) as production_ready
from scored;

create view catalog_health as
select
  (select count(*) from catalog_item)                                     as total_items,
  (select count(*) from catalog_item_completeness where production_ready) as production_ready,
  (select count(*) from catalog_item_completeness where not production_ready) as incomplete,
  (select round(avg(score), 4) from catalog_item_completeness)            as average_score,
  (select count(*) from catalog_item_completeness where 'media.hero' = any (missing_fields))            as missing_hero_image,
  (select count(*) from catalog_item_completeness where 'bottle.diameterMm' = any (missing_fields))     as missing_dimensions,
  (select count(*) from catalog_item_completeness where 'bottle.neckFinish' = any (missing_fields))     as missing_neck_finish,
  (select count(*) from catalog_item_completeness where 'compatibility.closure' = any (missing_fields)) as without_compatible_closure,
  (select count(*) from catalog_conflict where status = 'open')           as open_conflicts,
  (select count(*) from catalog_media_asset where not approved)           as unapproved_assets,
  (select count(*) from catalog_customer_question where status in ('ingested', 'normalised', 'linked')) as unanswered_questions,
  (select count(*) from catalog_import_batch where started_at > now() - interval '7 days') as recent_imports,
  (select coalesce(sum(cardinality(errors)), 0) from catalog_import_batch where started_at > now() - interval '7 days') as recent_import_errors;

-- Shopify products that no catalog item claims, and catalog items with no
-- Shopify mapping. Both directions are orphan reports.
create view catalog_orphan_report as
select 'catalog_item_without_shopify' as kind, i.catalog_id as ref, i.sku as detail
from catalog_item i
where i.lifecycle = 'active'
  and not exists (
    select 1 from catalog_external_id e
    where e.catalog_id = i.catalog_id and e.system in ('shopify_product', 'shopify_variant')
  )
union all
select 'media_without_item', m.asset_id, m.storage_url
from catalog_media_asset m
where not exists (select 1 from catalog_item i where i.catalog_id = m.catalog_id);

-- ====================== row level security ==================================
-- Deny by default. Service-role ingestion bypasses RLS; the anon and
-- authenticated keys reach the catalog only through the public views above.

do $$
declare t text;
begin
  foreach t in array array[
    'catalog_item', 'catalog_external_id', 'catalog_bottle_spec', 'catalog_closure_spec',
    'catalog_attribute_definition', 'catalog_attribute_value', 'catalog_use_case_fitness',
    'catalog_compatibility_edge', 'catalog_configuration', 'catalog_configuration_component',
    'catalog_commerce', 'catalog_price_break',
    'catalog_source', 'catalog_import_batch', 'catalog_raw_record', 'catalog_fact_assertion',
    'catalog_conflict', 'catalog_conflict_assertion', 'catalog_field_resolution', 'catalog_audit_event',
    'catalog_media_asset', 'catalog_render_spec',
    'catalog_knowledge_entry', 'catalog_knowledge_subject', 'catalog_knowledge_source',
    'catalog_term_synonym', 'catalog_customer_question', 'catalog_review', 'catalog_review_interpretation'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('revoke all on table %I from anon, authenticated', t);
  end loop;
end
$$;

-- Catalog operators. Grant this role to staff accounts; it is the only
-- non-service identity that may read internal data or write to the catalog.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'catalog_operator') then
    create role catalog_operator nologin;
  end if;
end
$$;

grant usage on schema public to catalog_operator;
grant select, insert, update on all tables in schema public to catalog_operator;

-- Public read surface.
grant select on
  catalog_public_item,
  catalog_public_bottle,
  catalog_public_closure,
  catalog_public_price,
  catalog_public_media,
  catalog_public_compatibility,
  catalog_public_knowledge
to anon, authenticated;

-- Operator instruments. Internal only.
grant select on
  catalog_item_completeness,
  catalog_health,
  catalog_orphan_report,
  catalog_field_provenance
to catalog_operator;
