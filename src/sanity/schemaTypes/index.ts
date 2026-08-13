import type { SchemaTypeDefinition } from 'sanity'
import { beekeeper } from './beekeeper'
import { honeyProduct } from './honeyProduct'
import { merchProduct } from './merchProduct'
import { newsletterPopup } from './newsletterPopup'
import { shopTile } from './shopTile'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [beekeeper, honeyProduct, merchProduct, newsletterPopup, shopTile],
}
