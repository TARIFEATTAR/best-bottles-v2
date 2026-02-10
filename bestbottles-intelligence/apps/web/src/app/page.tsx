import Link from 'next/link';
import { client } from '@/lib/sanity';
import { groq } from 'next-sanity';

/**
 * Minimal home page - lists all products for quick testing
 */
const productsQuery = groq`
  *[_type == "product"] | order(title asc) {
    _id,
    title,
    "slug": slug.current
  }
`;

export default async function HomePage() {
  const products = await client.fetch(productsQuery);

  return (
    <main className="p-8 max-w-md">
      <h1 className="text-xl font-bold mb-4">Product Viewer Proof</h1>
      
      {products.length === 0 ? (
        <p className="text-gray-500">
          No products found. Create one in Sanity Studio first.
        </p>
      ) : (
        <ul className="space-y-2">
          {products.map((p: any) => (
            <li key={p._id}>
              <Link
                href={`/products/${p.slug}`}
                className="text-blue-600 hover:underline"
              >
                {p.title || p.slug}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

