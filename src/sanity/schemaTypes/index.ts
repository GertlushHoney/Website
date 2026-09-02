import type { SchemaTypeDefinition } from 'sanity'
import { beekeeper } from './beekeeper'
import { honeyProduct } from './honeyProduct'
import { informationCard } from './informationCard'
import { merchProduct } from './merchProduct'
import { newsletterPopup } from './newsletterPopup'
import { productReview } from './productReview'
import { shopTile } from './shopTile'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    beekeeper,
    honeyProduct,
    informationCard,
    merchProduct,
    newsletterPopup,
    productReview,
    shopTile,
  ],
}
