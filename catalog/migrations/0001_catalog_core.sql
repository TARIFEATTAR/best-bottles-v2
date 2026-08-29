-- ===========================================================================
-- Best Bottles Commerce Knowledge Catalog
-- 0001 - Core identity, typed specifications, governed attributes
-- ===========================================================================
-- Run in order against the Supabase project SQL editor, or via the Supabase
-- CLI. Every object is prefixed `catalog_` so it never collides with the
-- existing application tables (profiles, favorites, orders, carts,
-- chat_history, product_images).
--
-- Design notes that the column list alone will not tell you:
--   * catalog_item.catalog_id is the ONLY identity. sku is a business key and
--     is allowed to change; Shopify ids live in catalog_external_id.
--   * measurements are stored once, in a canonical base unit (mm / ml / g).
--     Imperial is derived on read - see catalog/src/domain/units.ts.
--   * NULL means "we do not know", never "no" and never zero. Nothing in this
--     schema defaults an unknown specification to a value.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --------------------------------------------------------------- enums ---

create type catalog_item_kind as enum (
  'bottle', 'jar', 'vial', 'closure', 'cap', 'dropper', 'reducer', 'insert',
  'rollerball', 'sprayer', 'pump', 'liner', 'accessory', 'packaging', 'kit',
  'configuration'
);

create type catalog_lifecycle_state as enum (
  'draft', 'active', 'inactive', 'discontinued', 'archived'
);

create type catalog_verification_state as enum (
  'unverified', 'needs_review', 'verified', 'conflicting'
);

create type catalog_material as enum (
  'glass', 'aluminium', 'steel', 'plastic', 'polypropylene', 'polyethylene',
  'phenolic', 'bakelite', 'wood', 'leather', 'rubber', 'paper', 'unknown'
);

create type catalog_glass_colour as enum (
  'flint', 'amber', 'cobalt', 'green', 'black', 'white', 'pink', 'lavender',
  'red', 'unknown'
);

create type catalog_finish as enum (
  'clear', 'frosted', 'matte', 'shiny', 'polished', 'brushed', 'coated', 'unknown'
);

create type catalog_closure_kind as enum (
  'screw_cap', 'roller_ball', 'sprayer', 'atomiser', 'pump', 'dropper',
  'reducer', 'plug', 'stopper', 'tassel', 'keychain', 'unknown'
);

-- A neck finish is structured, not a string: `18-415` and `18-400` share a
-- diameter but never mate, and `17mm` is a different geometry entirely.
create type catalog_neck_style as enum ('gpi', 'metric', 'special');

-- ---------------------------------------------------------- catalog_item ---

create table catalog_item (
  catalog_id        text primary key
                    check (catalog_id ~ '^BB-[A-Z]{3}-[0-9A-HJKMNP-TV-Z]{10}$'),
  kind              catalog_item_kind not null,
  sku               text unique,
  display_name      text not null,
  slug              text not null,
  short_description text,
  -- Never exposed through a public endpoint. See 0006 for the public views.
  internal_notes    text,
  family            text,
  lifecycle         catalog_lifecycle_state not null default 'draft',
  verification      catalog_verification_state not null default 'unverified',
  -- Frozen at creation. Changing it would change the item's identity.
  anchor_source     text not null,
  anchor_key        text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (anchor_source, anchor_key)
);

create index catalog_item_kind_idx        on catalog_item (kind);
create index catalog_item_lifecycle_idx   on catalog_item (lifecycle);
create index catalog_item_verification_idx on catalog_item (verification);
create index catalog_item_family_idx      on catalog_item (family);
create unique index catalog_item_slug_idx on catalog_item (slug);
create index catalog_item_name_trgm_idx   on catalog_item using gin (to_tsvector('english', display_name));

comment on column catalog_item.catalog_id is
  'Permanent opaque identity. Never encodes specifications; survives renames and respecs.';
comment on column catalog_item.sku is
  'Best Bottles merchandising SKU. A business key, not identity - a corrected cap colour changes it.';

-- ---------------------------------------------------- external id mapping ---

create type catalog_external_system as enum (
  'shopify_product', 'shopify_variant', 'sanity_document', 'supabase_product_image',
  'supplier_part', 'gtin', 'website_url', 'google_merchant', 'amazon', 'etsy',
  'faire', 'legacy_inventory_id'
);

create table catalog_external_id (
  id          uuid primary key default gen_random_uuid(),
  catalog_id  text not null references catalog_item (catalog_id) on delete cascade,
  system      catalog_external_system not null,
  external_id text not null,
  url         text,
  created_at  timestamptz not null default now(),
  unique (system, external_id)
);

create index catalog_external_id_item_idx on catalog_external_id (catalog_id);

comment on table catalog_external_id is
  'Shopify and marketplace identifiers are MAPPINGS. Shopify is a channel, not the source of truth.';

-- ------------------------------------------------- container specification ---

create table catalog_bottle_spec (
  catalog_id                 text primary key references catalog_item (catalog_id) on delete cascade,
  shape                      text,
  nominal_capacity_ml        numeric(10,3),
  brimful_capacity_ml        numeric(10,3),
  height_with_closure_mm     numeric(10,3),
  height_with_closure_tol_mm numeric(10,3),
  height_without_closure_mm  numeric(10,3),
  height_without_closure_tol_mm numeric(10,3),
  diameter_mm                numeric(10,3),
  diameter_tol_mm            numeric(10,3),
  width_mm                   numeric(10,3),
  depth_mm                   numeric(10,3),
  opening_diameter_mm        numeric(10,3),
  empty_weight_g             numeric(10,3),
  material                   catalog_material,
  glass_colour               catalog_glass_colour,
  finish                     catalog_finish,
  neck_style                 catalog_neck_style,
  neck_diameter_mm           numeric(5,2),
  neck_series                text,
  neck_code                  text,
  -- NULL = unknown. Do not read a NULL as "not food safe".
  food_safe                  boolean,
  cosmetic_safe              boolean,
  country_of_origin          text,
  manufacturer               text,
  updated_at                 timestamptz not null default now(),
  constraint catalog_bottle_neck_complete
    check ((neck_style is null) or (neck_code is not null))
);

create index catalog_bottle_capacity_idx on catalog_bottle_spec (nominal_capacity_ml);
create index catalog_bottle_neck_idx     on catalog_bottle_spec (neck_code);
create index catalog_bottle_colour_idx   on catalog_bottle_spec (glass_colour);
create index catalog_bottle_material_idx on catalog_bottle_spec (material);
create index catalog_bottle_shape_idx    on catalog_bottle_spec (shape);

-- --------------------------------------------------- closure specification ---

create table catalog_closure_spec (
  catalog_id          text primary key references catalog_item (catalog_id) on delete cascade,
  closure_kind        catalog_closure_kind,
  neck_style          catalog_neck_style,
  neck_diameter_mm    numeric(5,2),
  neck_series         text,
  neck_code           text,
  diameter_mm         numeric(10,3),
  height_mm           numeric(10,3),
  material            catalog_material,
  finish              catalog_finish,
  colour_label        text,
  liner_type          text,
  orifice_mm          numeric(10,3),
  dip_tube_length_mm  numeric(10,3),
  tamper_evident      boolean,
  child_resistant     boolean,
  updated_at          timestamptz not null default now()
);

create index catalog_closure_neck_idx on catalog_closure_spec (neck_code);
create index catalog_closure_kind_idx on catalog_closure_spec (closure_kind);

-- ------------------------------------------------- governed attribute layer ---
-- Adding a niche specification needs a row here, not a migration. Domain-
-- critical fields stay typed above so they remain queryable and constrained.

create type catalog_attribute_type as enum ('string', 'number', 'boolean', 'enum', 'measurement');

create table catalog_attribute_definition (
  key            text primary key check (key ~ '^[a-z][a-z0-9_]*$'),
  label          text not null,
  data_type      catalog_attribute_type not null,
  unit           text,
  allowed_values text[],
  applies_to     catalog_item_kind[] not null default '{}',
  description    text,
  created_at     timestamptz not null default now(),
  constraint catalog_attribute_unit_required
    check (data_type <> 'measurement' or unit is not null),
  constraint catalog_attribute_enum_values
    check (data_type <> 'enum' or (allowed_values is not null and array_length(allowed_values, 1) > 0))
);

create table catalog_attribute_value (
  id            uuid primary key default gen_random_uuid(),
  catalog_id    text not null references catalog_item (catalog_id) on delete cascade,
  key           text not null references catalog_attribute_definition (key) on delete restrict,
  value_text    text,
  value_number  numeric(18,6),
  value_boolean boolean,
  unit          text,
  confidence    numeric(3,2) check (confidence between 0 and 1),
  verification  catalog_verification_state not null default 'unverified',
  updated_at    timestamptz not null default now(),
  unique (catalog_id, key),
  constraint catalog_attribute_exactly_one_value check (
    (value_text is not null)::int + (value_number is not null)::int + (value_boolean is not null)::int = 1
  )
);

create index catalog_attribute_value_key_idx on catalog_attribute_value (key);

-- --------------------------------------------------------- use-case intent ---

create type catalog_use_case as enum (
  'perfume_oil', 'attar', 'essential_oil', 'fragrance_sample', 'tincture',
  'serum', 'cosmetic_oil', 'beard_oil', 'aromatherapy', 'body_oil', 'lotion',
  'luxury_packaging', 'travel', 'gifting', 'wholesale'
);

create type catalog_use_case_fit as enum ('recommended', 'acceptable', 'conditional', 'not_recommended');

create table catalog_use_case_fitness (
  catalog_id text not null references catalog_item (catalog_id) on delete cascade,
  use_case   catalog_use_case not null,
  fit        catalog_use_case_fit not null,
  rationale  text,
  primary key (catalog_id, use_case),
  -- A negative or conditional claim without a reason is unusable to a customer
  -- and unusable to an AI agent. Require the reason.
  constraint catalog_use_case_rationale_required
    check (fit in ('recommended', 'acceptable') or rationale is not null)
);

create index catalog_use_case_idx on catalog_use_case_fitness (use_case, fit);

-- ------------------------------------------------------------- updated_at ---

create or replace function catalog_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger catalog_item_touch          before update on catalog_item          for each row execute function catalog_touch_updated_at();
create trigger catalog_bottle_touch        before update on catalog_bottle_spec   for each row execute function catalog_touch_updated_at();
create trigger catalog_closure_touch       before update on catalog_closure_spec  for each row execute function catalog_touch_updated_at();
create trigger catalog_attribute_touch     before update on catalog_attribute_value for each row execute function catalog_touch_updated_at();
