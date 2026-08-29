-- ===========================================================================
-- 0002 - Compatibility graph, configurations, commerce
-- ===========================================================================
-- The compatibility graph is the capability the rest of the business hangs
-- off: "what caps fit this bottle", "what do I need for a complete perfume
-- oil package", "is this configuration buildable".
--
-- The rule enforced in the schema: a rule-inferred edge may not claim to be
-- verified, and a verified edge must name who verified it. A neck-finish match
-- is evidence of fit, never proof of fit.
-- ===========================================================================

create type catalog_relation_type as enum (
  'compatible_with', 'incompatible_with', 'accepts', 'requires',
  'fits_into', 'suitable_for', 'replaces', 'variant_of'
);

create type catalog_compatibility_status as enum (
  'verified', 'likely', 'unverified', 'conditional', 'incompatible'
);

create table catalog_compatibility_edge (
  relationship_id text primary key,
  source_id       text not null references catalog_item (catalog_id) on delete cascade,
  relation        catalog_relation_type not null,
  target_id       text not null references catalog_item (catalog_id) on delete cascade,
  status          catalog_compatibility_status not null,
  confidence      numeric(3,2) not null check (confidence between 0 and 1),
  -- How the edge was established: 'rule:neck-finish-match:13-415',
  -- 'physical-test', 'supplier-spec', 'customer-report'.
  basis           text not null,
  condition       text,
  notes           text,
  verified_by     text,
  verified_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (source_id, relation, target_id),
  constraint catalog_edge_no_self_loop check (source_id <> target_id),

  -- Verification is a human act and must be attributable.
  constraint catalog_edge_verified_needs_verifier
    check (status <> 'verified' or (verified_by is not null and verified_at is not null)),

  -- Rule inference may propose, never assert.
  constraint catalog_edge_rules_stay_likely
    check (basis not like 'rule:%' or (status = 'likely' and confidence <= 0.60)),

  -- A conditional fit must say what the condition is.
  constraint catalog_edge_conditional_needs_condition
    check (status <> 'conditional' or condition is not null)
);

create index catalog_edge_source_idx on catalog_compatibility_edge (source_id, relation, status);
create index catalog_edge_target_idx on catalog_compatibility_edge (target_id, relation, status);
create index catalog_edge_status_idx on catalog_compatibility_edge (status);

comment on constraint catalog_edge_rules_stay_likely on catalog_compatibility_edge is
  'A matching neck finish is evidence of fit, not proof. Only verification may raise the status.';

-- ------------------------------------------------------------ configurations ---
-- A complete buildable assembly. The configurator, quoting, bundling and the
-- "which image shows this exact build" question all resolve against these.

create type catalog_configuration_status as enum ('proposed', 'validated', 'published');

create table catalog_configuration (
  catalog_id       text primary key references catalog_item (catalog_id) on delete cascade,
  display_name     text not null,
  container_id     text not null references catalog_item (catalog_id) on delete restrict,
  closure_id       text references catalog_item (catalog_id) on delete restrict,
  status           catalog_configuration_status not null default 'proposed',
  validation_notes text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table catalog_configuration_component (
  configuration_id text not null references catalog_configuration (catalog_id) on delete cascade,
  component_id     text not null references catalog_item (catalog_id) on delete restrict,
  position         integer not null default 0,
  primary key (configuration_id, component_id)
);

create index catalog_configuration_container_idx on catalog_configuration (container_id);
create index catalog_configuration_closure_idx   on catalog_configuration (closure_id);

-- ---------------------------------------------------------------- commerce ---
-- Kept apart from product identity so that a price change never touches a
-- specification, and so channel pricing does not contaminate the canonical model.

create type catalog_stock_status as enum (
  'in_stock', 'low_stock', 'out_of_stock', 'backorder', 'discontinued'
);

create table catalog_commerce (
  id                       uuid primary key default gen_random_uuid(),
  catalog_id               text not null references catalog_item (catalog_id) on delete cascade,
  channel                  text not null default 'retail',
  currency                 char(3) not null default 'USD',
  minimum_order_quantity   integer check (minimum_order_quantity > 0),
  case_quantity            integer check (case_quantity > 0),
  pallet_quantity          integer check (pallet_quantity > 0),
  lead_time_days           integer check (lead_time_days >= 0),
  stock_status             catalog_stock_status,
  available_quantity       integer check (available_quantity >= 0),
  reserved_quantity        integer check (reserved_quantity >= 0),
  incoming_quantity        integer check (incoming_quantity >= 0),
  shipping_weight_g        numeric(10,3),
  -- Internal only. Never selected by the public views in 0006.
  unit_cost                numeric(12,4),
  supplier_id              text,
  supplier_part_number     text,
  updated_at               timestamptz not null default now(),
  unique (catalog_id, channel, currency)
);

create index catalog_commerce_item_idx  on catalog_commerce (catalog_id);
create index catalog_commerce_stock_idx on catalog_commerce (stock_status);

comment on column catalog_commerce.unit_cost is
  'Internal cost. Excluded from every public view and every channel feed.';

create table catalog_price_break (
  id           uuid primary key default gen_random_uuid(),
  commerce_id  uuid not null references catalog_commerce (id) on delete cascade,
  min_quantity integer not null check (min_quantity > 0),
  unit_price   numeric(12,4) not null check (unit_price >= 0),
  unique (commerce_id, min_quantity)
);

create index catalog_price_break_commerce_idx on catalog_price_break (commerce_id, min_quantity);

create trigger catalog_edge_touch          before update on catalog_compatibility_edge for each row execute function catalog_touch_updated_at();
create trigger catalog_configuration_touch before update on catalog_configuration      for each row execute function catalog_touch_updated_at();
create trigger catalog_commerce_touch      before update on catalog_commerce           for each row execute function catalog_touch_updated_at();
