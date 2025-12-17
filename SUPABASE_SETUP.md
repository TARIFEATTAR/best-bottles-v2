# Supabase Setup Guide for Best Bottles

## 🎯 What We're Building

A complete backend for Best Bottles with:
- ✅ User authentication (customer accounts)
- ✅ Product favorites
- ✅ Order management
- ✅ Chat history (Grace conversations)
- ✅ Customer profiles

---

## 📋 Step 1: Create Supabase Project (5 minutes)

### 1.1 Sign Up
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### 1.2 Create New Project
1. Click "New Project"
2. **Organization**: Create new or select existing
3. **Project Name**: `best-bottles`
4. **Database Password**: Create a strong password (SAVE THIS!)
5. **Region**: Choose closest to your users (e.g., US West)
6. Click "Create new project"
7. **Wait 2-3 minutes** for setup to complete

### 1.3 Get Your Credentials
Once project is ready:
1. Go to **Project Settings** (gear icon, bottom left)
2. Click **API** in the sidebar
3. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

**Copy these - you'll need them!**

---

## 📋 Step 2: Configure Environment Variables

### 2.1 Update `.env` file

Add these to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# ElevenLabs Configuration (already have these)
VITE_ELEVENLABS_API_KEY=sk_your_api_key_here
VITE_ELEVENLABS_AGENT_ID=agent_your_agent_id_here
```

### 2.2 Update `.env.example`

I'll update this for you...

---

## 📋 Step 3: Database Schema

### 3.1 Create Tables

Go to **SQL Editor** in Supabase dashboard and run these:

#### **Users/Profiles Table**
```sql
-- Enable Row Level Security
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  company_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

#### **Favorites Table**
```sql
create table public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_sku text not null,
  product_name text,
  product_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.favorites enable row level security;

-- Policies
create policy "Users can view own favorites"
  on favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on favorites for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index favorites_user_id_idx on favorites(user_id);
create index favorites_product_sku_idx on favorites(product_sku);
```

#### **Orders Table**
```sql
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  order_number text unique not null,
  status text default 'pending' not null,
  total_amount decimal(10,2) not null,
  items jsonb not null,
  shipping_address jsonb,
  billing_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.orders enable row level security;

-- Policies
create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on orders for insert
  with check (auth.uid() = user_id);

-- Index
create index orders_user_id_idx on orders(user_id);
create index orders_order_number_idx on orders(order_number);
```

#### **Chat History Table**
```sql
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

-- Policies
create policy "Users can view own chat history"
  on chat_history for select
  using (auth.uid() = user_id or user_id is null);

create policy "Anyone can insert chat history"
  on chat_history for insert
  with check (true);

create policy "Users can update own chat history"
  on chat_history for update
  using (auth.uid() = user_id or user_id is null);

-- Index
create index chat_history_user_id_idx on chat_history(user_id);
create index chat_history_session_id_idx on chat_history(session_id);
```

---

## 📋 Step 4: Create Supabase Client

I'll create this for you...

---

## 📋 Step 5: Test Connection

After setup, you can test with:

```typescript
import { supabase } from './lib/supabase'

// Test connection
const { data, error } = await supabase.from('profiles').select('*')
console.log('Supabase connected:', data)
```

---

## 🎯 What You'll Be Able to Do

### For Customers:
- ✅ Sign up / Log in
- ✅ Save favorite products
- ✅ Place orders
- ✅ View order history
- ✅ Chat with Grace (history saved)

### For You:
- ✅ View all customers
- ✅ Manage orders
- ✅ See chat analytics
- ✅ Track popular products
- ✅ Customer insights

---

## 💰 Pricing

**Supabase Free Tier** (Perfect for demo):
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth
- ✅ **$0/month**

**Upgrade later if needed**:
- Pro: $25/month (8GB database, 100GB bandwidth)

---

## 🚀 Next Steps

1. ✅ **Supabase installed** (just did this)
2. ⏳ **Create Supabase project** (5 minutes)
3. ⏳ **Add credentials to `.env`**
4. ⏳ **Run SQL schema** (copy/paste into SQL Editor)
5. ⏳ **Create Supabase client** (I'll do this)
6. ⏳ **Add auth to app** (I'll help)

---

## 📝 Quick Commands

```bash
# Already installed
npm install @supabase/supabase-js

# Restart dev server after adding .env
npm run dev
```

---

**Ready to continue? Let me know when you've:**
1. Created your Supabase project
2. Got your URL and anon key
3. Added them to `.env`

Then I'll create the Supabase client and auth components! 🚀
