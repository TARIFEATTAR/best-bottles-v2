-- ===========================================================================
-- 0003 - Sources, ingestion, provenance, conflicts, audit
-- ===========================================================================
-- This migration is what makes the catalog trustworthy rather than merely
-- populated. Every important fact can answer "where did this come from?", and
-- no import can silently overwrite a better value.
--
--   catalog_source          who told us
--   catalog_import_batch    one ingestion run
--   catalog_raw_record      the original row, immutable
--   catalog_fact_assertion  "source S claims field F of item I is V"
--   catalog_conflict        two assertions that disagree, unresolved
--   catalog_audit_event     who changed what, afterwards
-- ===========================================================================

create type catalog_source_kind as enum (
  'physical_measurement', 'manufacturer_spec', 'supplier_feed',
  'employee_verification', 'internal_spreadsheet', 'legacy_database',
  'shopify', 'website_scrape', 'image_filename', 'customer_feedback',
  'ai_inference'
);

create table catalog_source (
  source_id      text primary key check (source_id ~ '^[a-z][a-z0-9-]*$'),
  label          text not null,
  kind           catalog_source_kind not null,
  locator        text not null,
  parser_version text not null,
  -- Default precedence when sources disagree. Higher wins. A conflict is still
  -- recorded; this only decides which value the catalog serves meanwhile.
  rank           integer not null,
  notes          text,
  created_at     timestamptz not null default now()
);

insert into catalog_source (source_id, label, kind, locator, parser_version, rank) values
  ('physical-measurement',  'Measured in house',                   'physical_measurement',  'warehouse',                     '1.0.0', 100),
  ('verified-products',     'Verified product subset',             'employee_verification', 'data/verified_products.json',   '1.0.0',  90),
  ('master-spreadsheet',    'Master product spreadsheet',          'internal_spreadsheet',  'data/complete_products.json',   '1.0.0',  50),
  ('legacy-inventory-json', 'Legacy site catalogue',               'legacy_database',       'inventory.json',                '1.0.0',  40),
  ('website-scrape',        'bestbottles.com scrape',              'website_scrape',        'data/scraped_products.json',    '1.0.0',  30)
on conflict (source_id) do nothing;

-- ------------------------------------------------------------ import runs ---

create table catalog_import_batch (
  batch_id     uuid primary key default gen_random_uuid(),
  source_id    text not null references catalog_source (source_id) on delete restrict,
  actor        text not null,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  discovered   integer not null default 0,
  parsed       integer not null default 0,
  created      integer not null default 0,
  updated      integer not null default 0,
  unchanged    integer not null default 0,
  conflicted   integer not null default 0,
  needs_review integer not null default 0,
  rejected     integer not null default 0,
  warnings     text[] not null default '{}',
  errors       text[] not null default '{}'
);

create index catalog_import_batch_source_idx on catalog_import_batch (source_id, started_at desc);

-- ---------------------------------------------- immutable raw ingestion ---
-- Preserved verbatim so a parser improvement can reprocess history instead of
-- re-reading a file that may have moved or changed.

create table catalog_raw_record (
  raw_id         text primary key,
  batch_id       uuid not null references catalog_import_batch (batch_id) on delete cascade,
  source_id      text not null references catalog_source (source_id) on delete restrict,
  locator        text not null,
  source_key     text,
  payload        jsonb not null,
  checksum       text not null,
  parser_version text not null,
  ingested_at    timestamptz not null default now()
);

create index catalog_raw_record_batch_idx    on catalog_raw_record (batch_id);
create index catalog_raw_record_key_idx      on catalog_raw_record (source_id, source_key);
create index catalog_raw_record_checksum_idx on catalog_raw_record (checksum);

create rule catalog_raw_record_no_update as on update to catalog_raw_record do instead nothing;
create rule catalog_raw_record_no_delete as on delete to catalog_raw_record do instead nothing;

comment on table catalog_raw_record is
  'Append only. Update and delete are rewritten to no-ops so ingestion history cannot be rewritten.';

-- --------------------------------------------------------- fact assertions ---
-- The unit of truth. Canonical values are DERIVED from these, never written
-- directly by an importer.

create table catalog_fact_assertion (
  assertion_id   text primary key,
  catalog_id     text not null references catalog_item (catalog_id) on delete cascade,
  -- Dotted canonical path, e.g. 'bottle.nominalCapacityMl'.
  field          text not null,
  value          jsonb not null,
  unit           text,
  source_id      text not null references catalog_source (source_id) on delete restrict,
  source_locator text,
  batch_id       uuid references catalog_import_batch (batch_id) on delete set null,
  observed_at    timestamptz not null,
  confidence     numeric(3,2) not null check (confidence between 0 and 1),
  created_at     timestamptz not null default now()
);

create index catalog_fact_item_field_idx on catalog_fact_assertion (catalog_id, field);
create index catalog_fact_source_idx     on catalog_fact_assertion (source_id);
create index catalog_fact_batch_idx      on catalog_fact_assertion (batch_id);

-- ---------------------------------------------------------------- conflicts ---

create type catalog_conflict_status as enum ('open', 'resolved', 'accepted_variance');

create table catalog_conflict (
  conflict_id      text primary key,
  catalog_id       text not null references catalog_item (catalog_id) on delete cascade,
  field            text not null,
  status           catalog_conflict_status not null default 'open',
  -- The assertion chosen as canonical, once a human decides.
  resolved_assertion_id text references catalog_fact_assertion (assertion_id) on delete set null,
  resolved_by      text,
  resolved_at      timestamptz,
  note             text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (catalog_id, field),
  constraint catalog_conflict_resolution_complete check (
    status = 'open'
    or (resolved_by is not null and resolved_at is not null)
  )
);

create index catalog_conflict_status_idx on catalog_conflict (status);
create index catalog_conflict_item_idx   on catalog_conflict (catalog_id);

create table catalog_conflict_assertion (
  conflict_id  text not null references catalog_conflict (conflict_id) on delete cascade,
  assertion_id text not null references catalog_fact_assertion (assertion_id) on delete cascade,
  primary key (conflict_id, assertion_id)
);

-- ------------------------------------------------------- resolution policy ---
-- A durable, per-item-per-field override of the default source precedence.

create table catalog_field_resolution (
  catalog_id            text not null references catalog_item (catalog_id) on delete cascade,
  field                 text not null,
  preferred_assertion_id text not null references catalog_fact_assertion (assertion_id) on delete cascade,
  decided_by            text not null,
  decided_at            timestamptz not null default now(),
  reason                text,
  primary key (catalog_id, field)
);

-- ------------------------------------------------------------------ audit ---

create table catalog_audit_event (
  id          bigserial primary key,
  catalog_id  text,
  entity      text not null,
  entity_id   text,
  action      text not null,
  actor       text not null,
  before      jsonb,
  after       jsonb,
  occurred_at timestamptz not null default now()
);

create index catalog_audit_item_idx    on catalog_audit_event (catalog_id, occurred_at desc);
create index catalog_audit_entity_idx  on catalog_audit_event (entity, entity_id);

create trigger catalog_conflict_touch before update on catalog_conflict for each row execute function catalog_touch_updated_at();
