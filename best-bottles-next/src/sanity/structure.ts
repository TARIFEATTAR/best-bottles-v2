/**
 * SANITY STUDIO STRUCTURE
 * 
 * Custom desk structure with Exploded View preview for Roll-On products.
 */

import { StructureBuilder } from 'sanity/structure'
import { PackageIcon, ComponentIcon, ImageIcon } from '@sanity/icons'
import RollOnPreview from './components/RollOnPreview'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Best Bottles')
    .items([
      // ════════════════════════════════════════════════════════════
      // MVP: Roll-On Products with Exploded View Preview
      // ════════════════════════════════════════════════════════════
      S.listItem()
        .title('🧪 MVP: 9ML Roll-On')
        .icon(PackageIcon)
        .child(
          S.documentTypeList('productRollOn')
            .title('9ML Roll-On Products')
            .child((documentId) =>
              S.document()
                .documentId(documentId)
                .schemaType('productRollOn')
                .views([
                  // Default form view
                  S.view.form(),
                  // Custom Exploded View preview
                  S.view
                    .component(RollOnPreview)
                    .title('Exploded View Preview'),
                ])
            )
        ),
      
      S.divider(),
      
      // ════════════════════════════════════════════════════════════
      // Component Library (for full system scaling)
      // ════════════════════════════════════════════════════════════
      S.listItem()
        .title('🧩 Component Library')
        .icon(ComponentIcon)
        .child(
          S.list()
            .title('Component Library')
            .items([
              S.documentTypeListItem('bottle').title('🔵 Bottles (Glass)'),
              S.documentTypeListItem('fitment').title('⚙️ Fitments (Mechanisms)'),
              S.documentTypeListItem('cap').title('🔘 Caps'),
              S.documentTypeListItem('background').title('📐 Backgrounds'),
            ])
        ),
      
      // ════════════════════════════════════════════════════════════
      // Full Products (assembled from components)
      // ════════════════════════════════════════════════════════════
      S.listItem()
        .title('📦 Products (Full System)')
        .icon(PackageIcon)
        .child(
          S.documentTypeList('product')
            .title('Assembled Products')
        ),
      
      S.divider(),
      
      // ════════════════════════════════════════════════════════════
      // Media Library (built-in from plugin)
      // ════════════════════════════════════════════════════════════
      S.listItem()
        .title('🖼️ Media Library')
        .icon(ImageIcon)
        .child(
          S.documentTypeList('sanity.imageAsset')
            .title('All Images')
        ),
    ])

