import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Best Bottles
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Premium packaging components for the fragrance and cosmetics industry.
            Build your perfect bottle from 2,000+ component parts.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Link 
            href="/studio"
            className="block p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <h2 className="text-xl font-semibold mb-2">🎨 Sanity Studio</h2>
            <p className="text-gray-400 text-sm">
              Manage bottles, caps, fitments, and products
            </p>
          </Link>

          <Link 
            href="/products"
            className="block p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <h2 className="text-xl font-semibold mb-2">📦 Products</h2>
            <p className="text-gray-400 text-sm">
              Browse assembled bottle configurations
            </p>
          </Link>

          <Link 
            href="/builder"
            className="block p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <h2 className="text-xl font-semibold mb-2">🔧 Bottle Builder</h2>
            <p className="text-gray-400 text-sm">
              Create custom bottle configurations
            </p>
          </Link>

          <Link 
            href="/components"
            className="block p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <h2 className="text-xl font-semibold mb-2">🧩 Components</h2>
            <p className="text-gray-400 text-sm">
              Browse individual parts library
            </p>
          </Link>
        </div>

        {/* Architecture Overview */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Component Stack Architecture</h2>
          
          <div className="bg-white/5 rounded-xl p-6 font-mono text-sm">
            <pre className="text-green-400">
{`┌─────────────────────────────────────────┐
│  EXPLODED VIEW (Visual Stack)           │
├─────────────────────────────────────────┤
│                                         │
│  [ Z-Index 3 ] ──── Cap Layer           │
│       🔘 Silver Screw Cap               │
│                                         │
│  [ Z-Index 2 ] ──── Fitment Layer       │
│       ⚙️  Metal Roller Ball             │
│                                         │
│  [ Z-Index 1 ] ──── Base Layer          │
│       🔵 Cobalt Blue Glass              │
│                                         │
│  [ Z-Index 0 ] ──── Background Layer    │
│       📐 Blueprint Grid                 │
│                                         │
└─────────────────────────────────────────┘`}
            </pre>
          </div>

          <p className="text-gray-400 text-center mt-6">
            Each layer is a <strong>reusable component</strong> stored in Sanity.
            <br />
            Swap any part to instantly create new product variations.
          </p>
        </div>
      </div>
    </main>
  )
}
