-- ===========================================================================
-- Schema guarantee checks.
--
-- These assert that the catalog's rules are enforced by the database, not only
-- by application code. Run against a scratch database that already has
-- catalog/migrations/*.sql applied:
--
--   psql -d catalogtest -v ON_ERROR_STOP=1 -f catalog/tests/schema_guarantees.sql
--
-- Every check raises an exception on failure, so a clean run means every
-- guarantee below holds.
-- ===========================================================================

begin;

create or replace function assert_rejected(stmt text, why text)
returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    return;                       -- rejected as intended
  end;
  raise exception 'GUARANTEE BROKEN: %', why;
end;
$$;

create or replace function assert_accepted(stmt text, why text)
returns void language plpgsql as $$
begin
  execute stmt;
exception when others then
  raise exception 'GUARANTEE BROKEN (should have been allowed): % -- %', why, sqlerrm;
end;
$$;

-- ---------------------------------------------------------------- fixtures ---

insert into catalog_item (catalog_id, kind, sku, display_name, slug, lifecycle, anchor_source, anchor_key) values
  ('BB-BTL-0000000001', 'bottle', 'GBCyl9RollBlkSh', '9 ml cylinder roll-on', '9-ml-cylinder-roll-on', 'active', 'test', 'k1'),
  ('BB-CAP-0000000002', 'cap',    'CP17-415BlkSh',   '17-415 black cap',      '17-415-black-cap',      'active', 'test', 'k2'),
  ('BB-BTL-0000000003', 'bottle', 'GBCyl5RollBlkSh', '5 ml cylinder roll-on', '5-ml-cylinder-roll-on', 'draft',  'test', 'k3');

insert into catalog_bottle_spec (catalog_id, nominal_capacity_ml, neck_style, neck_diameter_mm, neck_series, neck_code, material)
values ('BB-BTL-0000000001', 9, 'gpi', 17, '415', '17-415', 'glass');

insert into catalog_closure_spec (catalog_id, closure_kind, neck_style, neck_diameter_mm, neck_series, neck_code)
values ('BB-CAP-0000000002', 'screw_cap', 'gpi', 17, '415', '17-415');

-- ------------------------------------------------------------- identity ---

select assert_rejected(
  $$insert into catalog_item (catalog_id, kind, display_name, slug, anchor_source, anchor_key)
    values ('bottle-42', 'bottle', 'x', 'x-1', 'test', 'k9')$$,
  'catalog_id must match the BB-KKK-XXXXXXXXXX pattern');

select assert_rejected(
  $$insert into catalog_item (catalog_id, kind, sku, display_name, slug, anchor_source, anchor_key)
    values ('BB-BTL-0000000009', 'bottle', 'GBCyl9RollBlkSh', 'dupe', 'dupe', 'test', 'k10')$$,
  'SKU must be unique across the catalog');

select assert_rejected(
  $$insert into catalog_item (catalog_id, kind, display_name, slug, anchor_source, anchor_key)
    values ('BB-BTL-0000000010', 'bottle', 'x', 'x-2', 'test', 'k1')$$,
  'the identity anchor must be unique - re-importing a row must not mint a second id');

-- ------------------------------------------------------- compatibility ---

select assert_rejected(
  $$insert into catalog_compatibility_edge (relationship_id, source_id, relation, target_id, status, confidence, basis)
    values ('r1', 'BB-BTL-0000000001', 'compatible_with', 'BB-CAP-0000000002', 'verified', 1.0, 'physical test')$$,
  'a verified edge must name who verified it and when');

select assert_rejected(
  $$insert into catalog_compatibility_edge (relationship_id, source_id, relation, target_id, status, confidence, basis)
    values ('r2', 'BB-BTL-0000000001', 'compatible_with', 'BB-CAP-0000000002', 'verified', 1.0, 'rule:neck-finish-match:17-415')$$,
  'a rule may not assert a verified fit - a thread match is evidence, not proof');

select assert_rejected(
  $$insert into catalog_compatibility_edge (relationship_id, source_id, relation, target_id, status, confidence, basis)
    values ('r3', 'BB-BTL-0000000001', 'compatible_with', 'BB-CAP-0000000002', 'likely', 0.95, 'rule:neck-finish-match:17-415')$$,
  'a rule-inferred edge may not exceed 0.60 confidence');

select assert_rejected(
  $$insert into catalog_compatibility_edge (relationship_id, source_id, relation, target_id, status, confidence, basis)
    values ('r4', 'BB-BTL-0000000001', 'compatible_with', 'BB-BTL-0000000001', 'likely', 0.5, 'rule:x')$$,
  'an item may not be compatible with itself');

select assert_rejected(
  $$insert into catalog_compatibility_edge (relationship_id, source_id, relation, target_id, status, confidence, basis)
    values ('r5', 'BB-BTL-0000000001', 'compatible_with', 'BB-CAP-0000000002', 'conditional', 0.5, 'manual')$$,
  'a conditional fit must state its condition');

select assert_accepted(
  $$insert into catalog_compatibility_edge (relationship_id, source_id, relation, target_id, status, confidence, basis)
    values ('r6', 'BB-BTL-0000000001', 'compatible_with', 'BB-CAP-0000000002', 'likely', 0.60, 'rule:neck-finish-match:17-415')$$,
  'a rule-inferred likely edge at 0.60 is the intended output of inference');

select assert_accepted(
  $$insert into catalog_compatibility_edge (relationship_id, source_id, relation, target_id, status, confidence, basis, verified_by, verified_at)
    values ('r7', 'BB-CAP-0000000002', 'requires', 'BB-BTL-0000000001', 'verified', 1.0, 'physical test', 'warehouse', now())$$,
  'a properly attributed verification must be allowed');

-- --------------------------------------------------------------- media ---

select assert_rejected(
  $$insert into catalog_media_asset (asset_id, catalog_id, asset_type, storage_url, approved)
    values ('BB-AST-1', 'BB-BTL-0000000001', 'hero', 'https://x/a.png', true)$$,
  'approval must be attributable to a person');

select assert_accepted(
  $$insert into catalog_media_asset (asset_id, catalog_id, asset_type, storage_url, approved, approved_by, approved_at)
    values ('BB-AST-2', 'BB-BTL-0000000001', 'hero', 'https://x/b.png', true, 'jordan', now())$$,
  'an attributed approval must be allowed');

select assert_rejected(
  $$insert into catalog_media_asset (asset_id, catalog_id, asset_type, storage_url, approved, approved_by, approved_at)
    values ('BB-AST-3', 'BB-BTL-0000000001', 'hero', 'https://x/c.png', true, 'jordan', now())$$,
  'an item may have at most one approved hero image');

select assert_accepted(
  $$insert into catalog_media_asset (asset_id, catalog_id, asset_type, storage_url, approved)
    values ('BB-AST-4', 'BB-BTL-0000000001', 'hero', 'https://x/d.png', false)$$,
  'multiple unapproved candidate heroes are fine');

-- ----------------------------------------------------------- knowledge ---

select assert_rejected(
  $$insert into catalog_knowledge_entry (kind, content, status, authored_by)
    values ('faq', 'AI generated answer', 'approved', 'ai_draft')$$,
  'an AI draft may not be published without a named reviewer');

select assert_accepted(
  $$insert into catalog_knowledge_entry (kind, content, status, authored_by, reviewed_by, reviewed_at)
    values ('faq', 'Reviewed AI draft', 'approved', 'ai_draft', 'jordan', now())$$,
  'a reviewed AI draft may be published');

select assert_accepted(
  $$insert into catalog_knowledge_entry (kind, content, status, authored_by)
    values ('faq', 'Unreviewed AI draft', 'proposed', 'ai_draft')$$,
  'an unreviewed AI draft may exist as a proposal');

-- --------------------------------------------------------- use cases ---

select assert_rejected(
  $$insert into catalog_use_case_fitness (catalog_id, use_case, fit)
    values ('BB-BTL-0000000001', 'essential_oil', 'not_recommended')$$,
  'a negative use-case claim must carry a reason');

select assert_accepted(
  $$insert into catalog_use_case_fitness (catalog_id, use_case, fit, rationale)
    values ('BB-BTL-0000000001', 'essential_oil', 'not_recommended', 'Plastic roller degrades in citrus oils.')$$,
  'a reasoned negative claim is allowed');

-- --------------------------------------------------------- attributes ---

insert into catalog_attribute_definition (key, label, data_type, unit, applies_to)
values ('shoulder_radius_mm', 'Shoulder radius', 'measurement', 'mm', array['bottle']::catalog_item_kind[]);

select assert_rejected(
  $$insert into catalog_attribute_definition (key, label, data_type) values ('bad_measure', 'Bad', 'measurement')$$,
  'a measurement attribute must declare its unit');

select assert_rejected(
  $$insert into catalog_attribute_value (catalog_id, key, value_text, value_number)
    values ('BB-BTL-0000000001', 'shoulder_radius_mm', 'x', 3)$$,
  'an attribute value must occupy exactly one typed column');

select assert_rejected(
  $$insert into catalog_attribute_value (catalog_id, key, value_number)
    values ('BB-BTL-0000000001', 'undeclared_key', 3)$$,
  'an attribute must be declared before it can be set');

select assert_accepted(
  $$insert into catalog_attribute_value (catalog_id, key, value_number, unit)
    values ('BB-BTL-0000000001', 'shoulder_radius_mm', 3.5, 'mm')$$,
  'a declared attribute may be set without a migration');

-- ------------------------------------------------- raw records are frozen ---

insert into catalog_import_batch (batch_id, source_id, actor)
values ('00000000-0000-0000-0000-000000000001', 'website-scrape', 'test');

insert into catalog_raw_record (raw_id, batch_id, source_id, locator, payload, checksum, parser_version)
values ('BB-RAW-1', '00000000-0000-0000-0000-000000000001', 'website-scrape', 'row 1', '{"sku":"X"}', 'abc', '1.0.0');

update catalog_raw_record set checksum = 'tampered' where raw_id = 'BB-RAW-1';
delete from catalog_raw_record where raw_id = 'BB-RAW-1';

do $$
begin
  if not exists (select 1 from catalog_raw_record where raw_id = 'BB-RAW-1' and checksum = 'abc') then
    raise exception 'GUARANTEE BROKEN: raw ingestion records must be append-only';
  end if;
end
$$;

-- ------------------------------------------------------------- conflicts ---

select assert_rejected(
  $$insert into catalog_conflict (conflict_id, catalog_id, field, status)
    values ('BB-CFL-1', 'BB-BTL-0000000001', 'bottle.diameterMm', 'resolved')$$,
  'a resolved conflict must record who resolved it and when');

-- --------------------------------------------------------- public views ---

do $$
declare leaked text;
begin
  -- No public view may expose internal cost, supplier or identity-anchor data.
  select string_agg(format('%s.%s', table_name, column_name), ', ')
    into leaked
  from information_schema.columns
  where table_schema = 'public'
    and table_name like 'catalog_public_%'
    and column_name in ('unit_cost', 'supplier_id', 'supplier_part_number', 'internal_notes', 'anchor_source', 'anchor_key');
  if leaked is not null then
    raise exception 'GUARANTEE BROKEN: internal columns exposed publicly: %', leaked;
  end if;
end
$$;

do $$
declare n int;
begin
  -- A draft item must not appear on the public surface.
  select count(*) into n from catalog_public_item where catalog_id = 'BB-BTL-0000000003';
  if n <> 0 then raise exception 'GUARANTEE BROKEN: draft items are publicly visible'; end if;

  -- An unapproved asset must not appear on the public surface.
  select count(*) into n from catalog_public_media where asset_id = 'BB-AST-4';
  if n <> 0 then raise exception 'GUARANTEE BROKEN: unapproved media is publicly visible'; end if;

  -- The approved one must.
  select count(*) into n from catalog_public_media where asset_id = 'BB-AST-2';
  if n <> 1 then raise exception 'GUARANTEE BROKEN: approved media is not publicly visible'; end if;
end
$$;

do $$
declare g text;
begin
  -- anon must hold no direct table privilege on any catalog table.
  select string_agg(distinct table_name, ', ') into g
  from information_schema.role_table_grants
  where grantee = 'anon'
    and table_name like 'catalog_%'
    and table_name not like 'catalog_public_%';
  if g is not null then
    raise exception 'GUARANTEE BROKEN: anon has direct table access to %', g;
  end if;
end
$$;

-- ------------------------------------------------------ health reporting ---

do $$
declare rec record;
begin
  select * into rec from catalog_item_completeness where catalog_id = 'BB-BTL-0000000001';
  if rec.production_ready is not true then
    raise exception 'GUARANTEE BROKEN: a bottle with sku, name, capacity, neck and an approved hero should be production ready (missing: %)', rec.missing_fields;
  end if;

  select * into rec from catalog_item_completeness where catalog_id = 'BB-BTL-0000000003';
  if rec.production_ready is not false then
    raise exception 'GUARANTEE BROKEN: a bare draft bottle must not read as production ready';
  end if;
  if not ('media.hero' = any (rec.missing_fields)) then
    raise exception 'GUARANTEE BROKEN: a bottle with no approved hero must report media.hero as missing';
  end if;
end
$$;

do $$
declare n bigint;
begin
  select total_items into n from catalog_health;
  if n <> 3 then raise exception 'GUARANTEE BROKEN: catalog_health.total_items = %, expected 3', n; end if;
end
$$;

-- ------------------------------------------------- convex storefront channel ---

select assert_accepted(
  $$insert into catalog_external_id (catalog_id, system, external_id)
    values ('BB-BTL-0000000001', 'convex_product', 'j57xk2p9convexrowid')$$,
  'a Convex product id must be storable as a mapping');

select assert_accepted(
  $$insert into catalog_external_id (catalog_id, system, external_id)
    values ('BB-BTL-0000000001', 'grace_sku', 'GB-EMP-CLR-50ML-AST-RED')$$,
  'a graceSku must be storable as a second business key');

select assert_rejected(
  $$insert into catalog_external_id (catalog_id, system, external_id)
    values ('BB-BTL-0000000003', 'grace_sku', 'GB-EMP-CLR-50ML-AST-RED')$$,
  'one graceSku may not map to two catalog items');

do $$
declare rec record;
begin
  select * into rec from catalog_convex_drift where catalog_id = 'BB-BTL-0000000001';
  if rec.drift_kind <> 'mapped' then
    raise exception 'GUARANTEE BROKEN: a fully mapped item should read as mapped, got %', rec.drift_kind;
  end if;

  select * into rec from catalog_convex_drift where catalog_id = 'BB-CAP-0000000002';
  if rec.drift_kind <> 'not_in_storefront' then
    raise exception 'GUARANTEE BROKEN: an unmapped item should read as not_in_storefront, got %', rec.drift_kind;
  end if;
end
$$;

do $$
declare convex_rank int; pdp_rank int; verified_rank int; measured_rank int;
begin
  select rank into convex_rank   from catalog_source where source_id = 'bb-convex-production';
  select rank into pdp_rank      from catalog_source where source_id = 'bb-live-pdp';
  select rank into verified_rank from catalog_source where source_id = 'verified-products';
  select rank into measured_rank from catalog_source where source_id = 'physical-measurement';

  if convex_rank is null or pdp_rank is null then
    raise exception 'GUARANTEE BROKEN: the storefront sources must be registered';
  end if;
  -- The storefront pipeline treats the live PDP as the arbiter over Convex.
  if pdp_rank <= convex_rank then
    raise exception 'GUARANTEE BROKEN: the live PDP must outrank Convex (% vs %)', pdp_rank, convex_rank;
  end if;
  -- But neither may outrank a human verification or a physical measurement.
  if convex_rank >= verified_rank or pdp_rank >= verified_rank then
    raise exception 'GUARANTEE BROKEN: storefront sources must not outrank employee verification';
  end if;
  if pdp_rank >= measured_rank then
    raise exception 'GUARANTEE BROKEN: storefront sources must not outrank a physical measurement';
  end if;
end
$$;

do $$
declare n int;
begin
  select count(*) into n from catalog_attribute_definition
  where key in ('cap_style', 'trim_color', 'paper_doll_family_key', 'grace_description');
  if n <> 4 then
    raise exception 'GUARANTEE BROKEN: storefront attributes must be declared, found %', n;
  end if;
end
$$;

rollback;

\echo 'All schema guarantees hold.'
