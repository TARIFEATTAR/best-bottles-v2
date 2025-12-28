
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const homeClient = createClient({
  projectId: 'gv4os6ef',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

const builder = createImageUrlBuilder(homeClient);

export function urlForHome(source: any) {
  if (!source) return '';
  return builder.image(source).url();
}

export const HOMEPAGE_QUERY = `
  *[_type == "homepageConfig"][0]{
    title,
    hero {
      title,
      subtitle,
      description,
      "desktopImageUrl": desktopImage.asset->url,
      "mobileImageUrl": mobileImage.asset->url,
      exploreButtonText,
      startButtonText
    },
    categories[]{
      label,
      iconName,
      "imageUrl": image.asset->url
    },
    promoSlider[]{
      labelBefore,
      "imageBeforeUrl": imageBefore.asset->url,
      labelAfter,
      "imageAfterUrl": imageAfter.asset->url
    }
  }
`;

export async function fetchHomepageData() {
  try {
    const data = await homeClient.fetch(HOMEPAGE_QUERY);
    return data;
  } catch (error) {
    console.warn('[Sanity Home] Failed to fetch homepage data:', error);
    return null;
  }
}
