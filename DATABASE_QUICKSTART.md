# 🚀 Quick Database Setup

## ✅ What's Ready
- ✅ `.env` file created with your Supabase credentials
- ✅ `database-setup.sql` file ready to run
- ✅ Supabase client (`lib/supabase.ts`) created

---

## 📋 Run the Database Setup (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/wtpcreoetjounuatzaub
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy and Paste SQL

1. Open the file: `database-setup.sql`
2. **Copy ALL the content** (Cmd+A, Cmd+C)
3. **Paste** into the SQL Editor
4. Click **Run** (or press Cmd+Enter)

### Step 3: Verify Success

You should see:
```
Success. No rows returned
```

This means all 5 tables were created successfully!

---

## ✅ What Gets Created

When you run the SQL, you'll get:

1. **profiles** - User profiles (auto-created on signup)
2. **favorites** - Saved products
3. **orders** - Order history
4. **chat_history** - Grace conversation history  
5. **carts** - Shopping carts

All with:
- ✅ Row Level Security (RLS) enabled
- ✅ Proper indexes for performance
- ✅ Auto-triggers for user creation

---

## 🧪 Test the Connection

After running the SQL, restart your dev server:

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

The app will now connect to Supabase!

---

## 📊 View Your Tables

In Supabase dashboard:
1. Click **Table Editor** (left sidebar)
2. You should see all 5 tables:
   - profiles
   - favorites
   - orders
   - chat_history
   - carts

---

## 🎯 Next Steps

After database is set up:

1. ✅ Database setup complete
2. ⏳ Set up Grace on ElevenLabs (follow `GRACE_SETUP.md`)
3. ⏳ Test the app
4. ⏳ Ready for demo!

---

## 🆘 If Something Goes Wrong

**Error: "relation already exists"**
- Tables already created! You're good to go.

**Error: "permission denied"**
- Make sure you're using the correct Supabase project
- Check that you're logged in to the right account

**Can't find SQL Editor**
- Look for it in the left sidebar
- It might be under "Database" → "SQL Editor"

---

**You're almost there! Just run that SQL and you're done with the database! 🎉**
