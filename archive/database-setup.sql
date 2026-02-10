-- ============================================
-- Best Bottles - Complete Database Setup
-- ============================================
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- Then click "Run" once to set up everything

-- ============================================
-- 1. PROFILES TABLE
-- ============================================

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  company_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile when user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 2. FAVORITES TABLE
-- ============================================

create table public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_sku text not null,
  product_name text,
  product_image text,
  product_price decimal(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.favorites enable row level security;

-- Policies for favorites
create policy "Users can view own favorites"
  on favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on favorites for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index favorites_user_id_idx on favorites(user_id);
create index favorites_product_sku_idx on favorites(product_sku);

-- ============================================
-- 3. ORDERS TABLE
-- ============================================

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  order_number text unique not null,
  status text default 'pending' not null,
  total_amount decimal(10,2) not null,
  items jsonb not null,
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.orders enable row level security;

-- Policies for orders
create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on orders for update
  using (auth.uid() = user_id);

-- Indexes
create index orders_user_id_idx on orders(user_id);
create index orders_order_number_idx on orders(order_number);
create index orders_status_idx on orders(status);

-- ============================================
-- 4. CHAT HISTORY TABLE
-- ============================================

create table public.chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  session_id text not null,
  messages jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chat_history enable row level security;

-- Policies for chat history
create policy "Users can view own chat history"
  on chat_history for select
  using (auth.uid() = user_id or user_id is null);

create policy "Anyone can insert chat history"
  on chat_history for insert
  with check (true);

create policy "Users can update own chat history"
  on chat_history for update
  using (auth.uid() = user_id or user_id is null);

-- Indexes
create index chat_history_user_id_idx on chat_history(user_id);
create index chat_history_session_id_idx on chat_history(session_id);

-- ============================================
-- 5. CART TABLE (for persistent shopping carts)
-- ============================================

create table public.carts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  session_id text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.carts enable row level security;

-- Policies for carts
create policy "Users can view own cart"
  on carts for select
  using (auth.uid() = user_id or session_id = current_setting('request.jwt.claims', true)::json->>'session_id');

create policy "Users can insert own cart"
  on carts for insert
  with check (auth.uid() = user_id or session_id is not null);

create policy "Users can update own cart"
  on carts for update
  using (auth.uid() = user_id or session_id = current_setting('request.jwt.claims', true)::json->>'session_id');

create policy "Users can delete own cart"
  on carts for delete
  using (auth.uid() = user_id);

-- Indexes
create index carts_user_id_idx on carts(user_id);
create index carts_session_id_idx on carts(session_id);

-- ============================================
-- DONE! 🎉
-- ============================================
-- You now have:
-- ✅ profiles - User profiles
-- ✅ favorites - Saved products
-- ✅ orders - Order history
-- ✅ chat_history - Grace conversation history
-- ✅ carts - Shopping carts
--
-- All tables have Row Level Security enabled
-- All tables have proper indexes for performance
-- ============================================
