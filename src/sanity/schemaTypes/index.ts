import type { SchemaTypeDefinition } from 'sanity'
import { beekeeper } from './beekeeper'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [beekeeper],
}
