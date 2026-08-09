import type { SchemaTypeDefinition } from 'sanity'
import { beekeeper } from './beekeeper'
import { honeyProduct } from './honeyProduct'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [beekeeper, honeyProduct],
}
