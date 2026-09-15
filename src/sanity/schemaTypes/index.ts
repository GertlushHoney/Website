import type { SchemaTypeDefinition } from 'sanity'
import { beekeeper } from './beekeeper'
import { experienceBookingConflict } from './experienceBookingConflict'
import { honeyProduct } from './honeyProduct'
import { informationCard } from './informationCard'
import { merchProduct } from './merchProduct'
import { newsletterPopup } from './newsletterPopup'
import { processedWebhookEvent } from './processedWebhookEvent'
import { productReview } from './productReview'
import { rateLimitBucket } from './rateLimitBucket'
import { shopTile } from './shopTile'
import { webhookOperation } from './webhookOperation'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    beekeeper,
    experienceBookingConflict,
    honeyProduct,
    informationCard,
    merchProduct,
    newsletterPopup,
    processedWebhookEvent,
    productReview,
    rateLimitBucket,
    shopTile,
    webhookOperation,
  ],
}
