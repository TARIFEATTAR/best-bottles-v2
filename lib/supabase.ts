import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

// Database types (auto-generated from your schema)
export type Profile = {
    id: string
    email: string | null
    full_name: string | null
    company_name: string | null
    phone: string | null
    created_at: string
    updated_at: string
}

export type Favorite = {
    id: string
    user_id: string
    product_sku: string
    product_name: string | null
    product_image: string | null
    product_price: number | null
    created_at: string
}

export type Order = {
    id: string
    user_id: string
    order_number: string
    status: string
    total_amount: number
    items: any // JSON
    shipping_address: any | null // JSON
    billing_address: any | null // JSON
    notes: string | null
    created_at: string
    updated_at: string
}

export type ChatHistory = {
    id: string
    user_id: string | null
    session_id: string
    messages: any // JSON
    created_at: string
    updated_at: string
}

export type Cart = {
    id: string
    user_id: string | null
    session_id: string | null
    items: any // JSON
    created_at: string
    updated_at: string
}

// Helper functions
export const auth = {
    // Sign up new user
    signUp: async (email: string, password: string, fullName?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        })
        return { data, error }
    },

    // Sign in existing user
    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    // Get current user
    getUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser()
        return { user, error }
    },

    // Get current session
    getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession()
        return { session, error }
    }
}

// Database helpers
export const db = {
    // Profiles
    profiles: {
        get: async (userId: string) => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
            return { data, error }
        },
        update: async (userId: string, updates: Partial<Profile>) => {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single()
            return { data, error }
        }
    },

    // Favorites
    favorites: {
        list: async (userId: string) => {
            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
            return { data, error }
        },
        add: async (userId: string, product: { sku: string, name?: string, image?: string, price?: number }) => {
            const { data, error } = await supabase
                .from('favorites')
                .insert({
                    user_id: userId,
                    product_sku: product.sku,
                    product_name: product.name,
                    product_image: product.image,
                    product_price: product.price
                })
                .select()
                .single()
            return { data, error }
        },
        remove: async (favoriteId: string) => {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('id', favoriteId)
            return { error }
        },
        check: async (userId: string, productSku: string) => {
            const { data, error } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', userId)
                .eq('product_sku', productSku)
                .single()
            return { isFavorite: !!data, error }
        }
    },

    // Orders
    orders: {
        list: async (userId: string) => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
            return { data, error }
        },
        get: async (orderId: string) => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single()
            return { data, error }
        },
        create: async (userId: string, order: {
            order_number: string
            total_amount: number
            items: any
            shipping_address?: any
            billing_address?: any
            notes?: string
        }) => {
            const { data, error } = await supabase
                .from('orders')
                .insert({
                    user_id: userId,
                    ...order
                })
                .select()
                .single()
            return { data, error }
        }
    },

    // Chat History
    chatHistory: {
        save: async (sessionId: string, messages: any, userId?: string) => {
            const { data, error } = await supabase
                .from('chat_history')
                .upsert({
                    session_id: sessionId,
                    user_id: userId,
                    messages,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()
            return { data, error }
        },
        get: async (sessionId: string) => {
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .eq('session_id', sessionId)
                .single()
            return { data, error }
        }
    },

    // Cart
    cart: {
        get: async (userId?: string, sessionId?: string) => {
            let query = supabase.from('carts').select('*')

            if (userId) {
                query = query.eq('user_id', userId)
            } else if (sessionId) {
                query = query.eq('session_id', sessionId)
            }

            const { data, error } = await query.single()
            return { data, error }
        },
        upsert: async (items: any, userId?: string, sessionId?: string) => {
            const { data, error } = await supabase
                .from('carts')
                .upsert({
                    user_id: userId,
                    session_id: sessionId,
                    items,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()
            return { data, error }
        }
    }
}
