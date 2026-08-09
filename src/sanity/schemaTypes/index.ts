import type { SchemaTypeDefinition } from 'sanity'
import { beekeeper } from './beekeeper'
import { honeyProduct } from './honeyProduct'
import { merchProduct } from './merchProduct'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [beekeeper, honeyProduct, merchProduct],
}
