import { client } from '@/lib/sanity';
import { groq } from 'next-sanity';
import { ProductViewer, ProductConfigurator } from '@bestbottles/ui';

/**
 * GROQ query to fetch product with configurator data
 * Supports both new configurator format and legacy viewer format
 */
const productQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    title,
    slug,
    defaultAspectRatio,
    
    // New configurator format
    "fitmentVariants": fitmentVariants[] {
      _key,
      label,
      "glassOptions": glassOptions[] {
        _key,
        label,
        "baseImage": baseImage.asset->
      }
    },
    "capOptions": capOptions[] {
      _key,
      label,
      "capImage": capImage.asset->
    },
    
    // Legacy viewer format (fallback)
    "viewer": viewer {
      "baseImage": baseImage.asset->,
      "fitmentImage": fitmentImage.asset->,
      "capImage": capImage.asset->,
      aspectRatio,
      alignment {
        xOffset,
        yOffset,
        scale
      }
    }
  }
`;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await client.fetch(productQuery, { slug });

  if (!product) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Product not found</h1>
        <p className="mt-2 text-gray-600">Slug: {slug}</p>
        <p className="mt-4 text-sm text-gray-500">
          Make sure you have created a product in Sanity Studio with this slug.
        </p>
      </main>
    );
  }

  // Check if using new configurator format
  const hasConfigurator = product.fitmentVariants?.length > 0;
  const hasLegacyViewer = product.viewer?.baseImage;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      {/* Product Name */}
      <h1 className="text-3xl font-bold mb-6">{product.title}</h1>

      {/* New Configurator Format */}
      {hasConfigurator && (
        <ProductConfigurator
          fitmentVariants={product.fitmentVariants}
          capOptions={product.capOptions || []}
          aspectRatio={product.defaultAspectRatio || 'square'}
          className="w-full"
        />
      )}

      {/* Legacy Viewer Format (fallback) */}
      {!hasConfigurator && hasLegacyViewer && (
        <ProductViewer
          baseImage={product.viewer.baseImage}
          fitmentImage={product.viewer.fitmentImage}
          capImage={product.viewer.capImage}
          aspectRatio={product.viewer.aspectRatio || 'square'}
          alignment={product.viewer.alignment}
          className="w-full max-w-md border border-gray-200"
        />
      )}

      {/* No configuration */}
      {!hasConfigurator && !hasLegacyViewer && (
        <div className="p-8 bg-gray-100 text-center text-gray-500 rounded-lg">
          No product configuration available.
          <br />
          <span className="text-sm">Add fitment variants in Sanity Studio.</span>
        </div>
      )}
    </main>
  );
}
