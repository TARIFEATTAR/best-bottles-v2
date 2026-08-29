-- ===========================================================================
-- 0006 - Convex storefront channel: mappings, source registration, drift report
-- ===========================================================================
-- The live bestbottles.company storefront is a separate Next.js repository
-- whose catalog lives in Convex deployment `precise-raccoon-123`. It is a real
-- product catalog — roughly 2,325 rows across `products` and `productGroups` —
-- and it is where the live PDP reads from today.
--
-- This migration does NOT make the catalog write to Convex. It does three
-- things, all of which are prerequisites for ever reconciling the two:
--
--   1. lets a catalog item carry its Convex identifiers as mappings
--   2. registers Convex as a ranked ingestion source, so its claims compete
--      on the normal conflict rules instead of being taken on faith
--   3. adds a drift report comparing the two catalogs once both are loaded
--
-- Applied separately from 0001-0005 so an already-provisioned database gets
-- only the delta. Safe to run on a fresh install too.
-- ===========================================================================

-- ------------------------------------------------------ external systems ---
-- ALTER TYPE ... ADD VALUE cannot be used in the same transaction that
-- references the new value, so these run as standalone statements.

alter type catalog_external_system add value if not exists 'convex_product';
alter type catalog_external_system add value if not exists 'convex_product_group';
alter type catalog_external_system add value if not exists 'grace_sku';

comment on type catalog_external_system is
  'Identifier systems the catalog maps to. Convex, Shopify and Sanity ids are mappings, never identity.';

-- ------------------------------------------------------------- the source ---
-- Rank 60: above the internal spreadsheet (50) and the legacy exports, because
-- Convex is actively curated and backfilled; below employee verification (90)
-- and physical measurement (100).
--
-- The pipeline documentation is explicit that Convex is not infallible —
-- "if Convex disagrees with the live PDP, PDP wins" — which is precisely why
-- it is ranked rather than trusted absolutely.

insert into catalog_source (source_id, label, kind, locator, parser_version, rank, notes)
values (
  'bb-convex-production',
  'Best Bottles storefront catalog (Convex precise-raccoon-123)',
  'legacy_database',
  'precise-raccoon-123.convex.cloud',
  '0.1.0',
  60,
  'Live storefront catalog for bestbottles.company. Joins to this catalog on products.websiteSku. '
  'Per the storefront pipeline docs the live PDP outranks Convex where the two disagree, so Convex '
  'claims are ranked, not trusted absolutely.'
)
on conflict (source_id) do nothing;

insert into catalog_source (source_id, label, kind, locator, parser_version, rank, notes)
values (
  'bb-live-pdp',
  'bestbottles.com product detail pages',
  'website_scrape',
  'https://www.bestbottles.com/product/',
  '0.1.0',
  65,
  'Ranked just above Convex because the storefront pipeline treats the live PDP as the arbiter when '
  'the two disagree. Still below employee verification and physical measurement.'
)
on conflict (source_id) do nothing;

-- --------------------------------------------------- storefront specifics ---
-- Fields the storefront catalog carries that have no home in the typed specs,
-- declared through the governed attribute layer rather than by widening the
-- core tables for one channel's needs.

insert into catalog_attribute_definition (key, label, data_type, applies_to, description) values
  ('cap_style', 'Cap style',
   'string', array['bottle','jar','vial','cap','closure','sprayer','pump','dropper','reducer']::catalog_item_kind[],
   'Convex products.capStyle. Feeds storefront image-generation prompt assembly.'),
  ('trim_color', 'Trim colour',
   'string', array['bottle','jar','vial','cap','closure','sprayer','pump']::catalog_item_kind[],
   'Convex products.trimColor, e.g. "Shiny Gold". Not derivable from the SKU suffix: AST-PNK pairs with gold trim while AST-RED pairs with silver. Authoritative source is the graceDescription text.'),
  ('paper_doll_family_key', 'Paper Doll family key',
   'string', array['bottle','jar','vial']::catalog_item_kind[],
   'Convex productGroups.paperDollFamilyKey. Points the PDP at the layered-asset family used for zero-drift swatch swapping.'),
  ('grace_description', 'Storefront description',
   'string', array['bottle','jar','vial','cap','closure','sprayer','pump','dropper','reducer','accessory','packaging']::catalog_item_kind[],
   'Convex products.graceDescription. The customer-facing copy on the live PDP, and the authoritative source for trim colour.')
on conflict (key) do nothing;

-- ------------------------------------------------------------ drift report ---
-- Once both catalogs are loaded, this names every item where the storefront and
-- the catalog disagree about identity coverage. It deliberately reports
-- absence in both directions: an item the storefront does not know about is as
-- much of a problem as a storefront row the catalog cannot explain.

create or replace view catalog_convex_drift as
with mapped as (
  select
    i.catalog_id,
    i.sku as website_sku,
    max(case when e.system = 'convex_product'       then e.external_id end) as convex_product_id,
    max(case when e.system = 'convex_product_group' then e.external_id end) as convex_group_id,
    max(case when e.system = 'grace_sku'            then e.external_id end) as grace_sku
  from catalog_item i
  left join catalog_external_id e on e.catalog_id = i.catalog_id
  group by i.catalog_id, i.sku
)
select
  catalog_id,
  website_sku,
  grace_sku,
  convex_product_id,
  case
    when convex_product_id is null and grace_sku is null then 'not_in_storefront'
    when convex_product_id is null                       then 'grace_sku_without_convex_row'
    when grace_sku is null                               then 'convex_row_without_grace_sku'
    else 'mapped'
  end as drift_kind
from mapped;

comment on view catalog_convex_drift is
  'Identity coverage between this catalog and the Convex storefront catalog. Populated once a Convex adapter has run; before that every row reads not_in_storefront, which is the correct starting state.';

grant select on catalog_convex_drift to catalog_operator;
