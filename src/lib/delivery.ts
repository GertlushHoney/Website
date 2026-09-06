// Single source of truth for the free-delivery threshold shown in copy
// across the site (product pages, basket). Keep this in sync with the
// real "Order price based" free-shipping rate configured in Shopify
// Admin → Settings → Shipping and delivery — this constant only controls
// what customers are told, not what Shopify actually charges at checkout.
export const FREE_DELIVERY_THRESHOLD_GBP = 50
