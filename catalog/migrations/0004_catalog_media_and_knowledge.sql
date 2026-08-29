-- ===========================================================================
-- 0004 - Media assets, render specifications, product knowledge
-- ===========================================================================
-- Images are first-class catalog records, not a URL column on a product. That
-- is what lets the catalog answer "which approved hero image belongs to this
-- SKU?" and "which of these renders shows the amber body with the matte
-- silver cap?", and what lets the existing Paper Doll and image pipelines read
-- from the catalog instead of hard-coded product values.
-- ===========================================================================

create type catalog_asset_type as enum (
  'hero', 'front', 'rear', 'side', 'top', 'detail', 'scale_reference',
  'technical_drawing', 'dimension_diagram', 'lifestyle', 'render_3d',
  'transparent_png', 'paper_doll_layer', 'marketplace_crop', 'thumbnail',
  'packaging'
);

create type catalog_asset_origin as enum ('photograph', 'render', 'derived', 'unknown');

create table catalog_media_asset (
  asset_id            text primary key,
  catalog_id          text not null references catalog_item (catalog_id) on delete cascade,
  asset_type          catalog_asset_type not null,
  storage_url         text not null,
  -- A render is never presented as a photograph. Keep them distinguishable.
  origin              catalog_asset_origin not null default 'unknown',
  derived_from_asset_id text references catalog_media_asset (asset_id) on delete set null,
  approved            boolean not null default false,
  approved_by         text,
  approved_at         timestamptz,
  width_px            integer check (width_px > 0),
  height_px           integer check (height_px > 0),
  checksum            text,
  -- Set when the asset depicts a specific assembly rather than a bare part.
  shows_configuration_id text references catalog_configuration (catalog_id) on delete set null,
  -- Paper Doll layer ordering, when asset_type = 'paper_doll_layer'.
  layer_index         integer,
  version             integer not null default 1,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (catalog_id, asset_type, storage_url),
  constraint catalog_asset_approval_attributable
    check (approved = false or (approved_by is not null and approved_at is not null))
);

create index catalog_media_item_idx     on catalog_media_asset (catalog_id, asset_type);
create index catalog_media_approved_idx on catalog_media_asset (approved) where approved;
create index catalog_media_config_idx   on catalog_media_asset (shows_configuration_id);

-- Exactly one approved hero per item, so "the hero image" is never ambiguous.
create unique index catalog_media_one_approved_hero_idx
  on catalog_media_asset (catalog_id)
  where asset_type = 'hero' and approved;

comment on constraint catalog_asset_approval_attributable on catalog_media_asset is
  'Approval is a human act. Bulk-imported legacy imagery arrives unapproved, which is what makes the missing-hero-image report meaningful.';

-- ------------------------------------------------------ render parameters ---
-- Links the catalog to the existing rendering work rather than duplicating
-- geometry metadata. `preset_ref` points at whichever system owns the asset
-- (a Sanity document id, a pipeline preset name, a file path).

create table catalog_render_spec (
  catalog_id        text primary key references catalog_item (catalog_id) on delete cascade,
  geometry_ref      text,
  material_preset   text,
  glass_type        text,
  closure_geometry_ref text,
  label_geometry_ref   text,
  camera_preset     text,
  studio_preset     text,
  background_preset text,
  render_version    text,
  updated_at        timestamptz not null default now()
);

-- ============================== knowledge layer =============================

create type catalog_knowledge_kind as enum (
  'faq', 'product_explanation', 'technical_note', 'recommendation',
  'comparison', 'objection', 'customer_question', 'terminology',
  'buying_advice', 'compatibility_explanation', 'application_guidance',
  'support_answer'
);

create type catalog_knowledge_status as enum ('proposed', 'in_review', 'approved', 'retired');
create type catalog_authorship as enum ('human', 'ai_draft');

create table catalog_knowledge_entry (
  knowledge_id  uuid primary key default gen_random_uuid(),
  kind          catalog_knowledge_kind not null,
  question      text,
  content       text not null,
  status        catalog_knowledge_status not null default 'proposed',
  authored_by   catalog_authorship not null,
  reviewed_by   text,
  reviewed_at   timestamptz,
  effective_from timestamptz,
  effective_to   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- An AI draft is never published without a named reviewer. This is the
  -- schema-level guarantee behind "do not automatically publish AI answers".
  constraint catalog_knowledge_ai_needs_review
    check (status <> 'approved' or authored_by = 'human' or reviewed_by is not null),
  constraint catalog_knowledge_approved_is_reviewed
    check (status <> 'approved' or (reviewed_by is not null and reviewed_at is not null))
);

create index catalog_knowledge_kind_idx   on catalog_knowledge_entry (kind, status);
create index catalog_knowledge_search_idx on catalog_knowledge_entry
  using gin (to_tsvector('english', coalesce(question, '') || ' ' || content));

create table catalog_knowledge_subject (
  knowledge_id uuid not null references catalog_knowledge_entry (knowledge_id) on delete cascade,
  catalog_id   text not null references catalog_item (catalog_id) on delete cascade,
  primary key (knowledge_id, catalog_id)
);

create table catalog_knowledge_source (
  knowledge_id uuid not null references catalog_knowledge_entry (knowledge_id) on delete cascade,
  source_id    text not null references catalog_source (source_id) on delete restrict,
  locator      text,
  primary key (knowledge_id, source_id)
);

-- ------------------------------------------------- customer terminology ---
-- How buyers actually name these things. Feeds onsite search, SEO and the AI
-- assistant's query understanding.

create type catalog_term_kind as enum ('colloquial', 'search_query', 'trade_term', 'misspelling');

create table catalog_term_synonym (
  id             uuid primary key default gen_random_uuid(),
  canonical_term text not null,
  synonym        text not null,
  kind           catalog_term_kind not null,
  observed_count integer not null default 0,
  updated_at     timestamptz not null default now(),
  unique (canonical_term, synonym)
);

create index catalog_term_synonym_idx on catalog_term_synonym (lower(synonym));

-- ------------------------------------------ customer question ingestion ---
-- Questions arrive continuously; answers are reviewed before they become
-- knowledge. Frequency is tracked so the catalog can say which gaps matter.

create type catalog_question_status as enum (
  'ingested', 'normalised', 'duplicate', 'linked', 'answer_proposed',
  'answer_approved', 'discarded'
);

create table catalog_customer_question (
  question_id      uuid primary key default gen_random_uuid(),
  raw_text         text not null,
  normalised_text  text,
  channel          text not null,
  external_ref     text,
  status           catalog_question_status not null default 'ingested',
  duplicate_of     uuid references catalog_customer_question (question_id) on delete set null,
  catalog_id       text references catalog_item (catalog_id) on delete set null,
  knowledge_id     uuid references catalog_knowledge_entry (knowledge_id) on delete set null,
  observed_count   integer not null default 1,
  first_seen_at    timestamptz not null default now(),
  last_seen_at     timestamptz not null default now()
);

create index catalog_question_status_idx on catalog_customer_question (status, observed_count desc);
create index catalog_question_item_idx   on catalog_customer_question (catalog_id);

-- ------------------------------------------------------ customer evidence ---
-- Original review text is preserved verbatim. AI-derived themes are stored
-- separately and never overwrite the customer's own words.

create table catalog_review (
  review_id        uuid primary key default gen_random_uuid(),
  catalog_id       text references catalog_item (catalog_id) on delete set null,
  source_id        text not null references catalog_source (source_id) on delete restrict,
  external_ref     text,
  rating           numeric(2,1) check (rating between 0 and 5),
  body             text not null,
  verified_purchase boolean,
  submitted_at     timestamptz,
  created_at       timestamptz not null default now(),
  unique (source_id, external_ref)
);

create table catalog_review_interpretation (
  id           uuid primary key default gen_random_uuid(),
  review_id    uuid not null references catalog_review (review_id) on delete cascade,
  theme        text not null,
  sentiment    numeric(3,2) check (sentiment between -1 and 1),
  derived_by   catalog_authorship not null default 'ai_draft',
  model_ref    text,
  created_at   timestamptz not null default now(),
  unique (review_id, theme)
);

comment on table catalog_review_interpretation is
  'AI-derived themes. Kept apart from catalog_review so generated interpretation never replaces customer evidence.';

create trigger catalog_media_touch     before update on catalog_media_asset     for each row execute function catalog_touch_updated_at();
create trigger catalog_render_touch    before update on catalog_render_spec     for each row execute function catalog_touch_updated_at();
create trigger catalog_knowledge_touch before update on catalog_knowledge_entry for each row execute function catalog_touch_updated_at();
create trigger catalog_term_touch      before update on catalog_term_synonym    for each row execute function catalog_touch_updated_at();
