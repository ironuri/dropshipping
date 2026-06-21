# Supplier Integration Guide

## BigBuy

### Overview
BigBuy is a European marketplace with 200,000+ products. Integration uses their REST API.

### API Access
1. Register at [bigbuy.eu](https://bigbuy.eu) as a dropshipper
2. Request API access from your account manager
3. Get your API key from the BigBuy control panel
4. Set `BIGBUY_API_KEY` in `.env.local`

### API Endpoints Used
| Endpoint | Purpose |
|----------|---------|
| `GET /rest/catalog/products.json?isoCode=ES` | Fetch full product catalog |
| `GET /rest/catalog/product/{id}/stocks.json` | Real-time stock check |
| `POST /rest/order/create.json` | Place dropshipping order |

### Pricing Strategy
Default markup: **1.8x cost price** (80% margin).  
Adjust in `app/api/sync/bigbuy/route.ts`:
```typescript
retailPrice: product.costPrice * 1.8  // Change multiplier here
```

### Sync Schedule
- Automatic: every 6 hours via Vercel Cron
- Manual: `pnpm sync:bigbuy` or `curl -H "Authorization: Bearer $CRON_SECRET" /api/sync/bigbuy`

### Category Mapping
BigBuy categories map to store categories in `app/api/sync/bigbuy/route.ts`. 
Extend the `CATEGORY_MAP` object to customize category assignments.

### Order Flow
1. Customer places order → Stripe webhook fires
2. `handleCheckoutCompleted()` in `app/api/webhooks/stripe/route.ts` detects BigBuy items
3. `bigbuyAdapter.placeOrder()` calls BigBuy API with shipping address
4. BigBuy ships directly to customer (blind dropship)
5. Tracking number returned and stored in `SupplierOrder`

---

## DietiSur

### Overview
DietiSur is a Spanish eco/natural cosmetics specialist. Integration uses CSV feed + email orders.

### Getting Access
1. Contact DietiSur at [dietisur.es](https://dietisur.es)
2. Request dropshipping account and ask for:
   - CSV product feed URL (updated hourly)
   - Dropshipping pricing list
   - Order email address
3. Set `DIETISUR_CSV_URL` in `.env.local`

### CSV Format Expected
```
ean;sku;nombre;descripcion;precio_coste;precio_pvp;stock;marca;imagen;categoria;peso;volumen
```
Separator: `;` | Decimal: `,` | Encoding: UTF-8

If the CSV format differs, update the field mapping in `lib/dietisur.ts`:
```typescript
interface DietiSurRow {
  ean: string;
  sku: string;
  nombre: string;         // ← Update field names to match actual CSV headers
  precio_coste: string;
  // ...
}
```

### Pricing Strategy
Default markup: **2.0x cost price** (100% margin).  
DietiSur eco brands carry higher perceived value.

### Sync Schedule
- Automatic: every hour via Vercel Cron
- Manual: `pnpm sync:dietisur` or `curl -H "Authorization: Bearer $CRON_SECRET" /api/sync/dietisur`

### Order Flow
DietiSur does NOT have an API for order placement. Orders go via email:

1. Customer places order → Stripe webhook fires
2. System detects DietiSur products
3. `dietisurAdapter.placeOrder()` sends formatted email to DietiSur
4. DietiSur staff process and ship manually
5. They reply with tracking number (update manually in admin)

**Email template** (in `lib/dietisur.ts`):
```
PEDIDO DROPSHIPPING
Referencia: [order-id]

PRODUCTOS:
- SKU: DS-BIO-001, Cantidad: 2

DIRECCIÓN DE ENVÍO:
[customer address]
```

### Manual Order Tracking
Since DietiSur tracking is manual:
1. Check your email for DietiSur shipping confirmations
2. Go to `/admin/orders`  
3. Find the order and update `SupplierOrder.trackingNumber`

---

## Adding a New Supplier

1. Implement `SupplierAdapter` interface in `lib/`:
```typescript
// lib/newsupplier.ts
export const newSupplierAdapter: SupplierAdapter = {
  async fetchProducts() { ... },
  async getStock(sku) { ... },
  async placeOrder(order) { ... },
};
```

2. Register in `lib/suppliers.ts`:
```typescript
export const suppliers = {
  BIGBUY: bigbuyAdapter,
  DIETISUR: dietisurAdapter,
  NEWSUPPLIER: newSupplierAdapter,  // Add here
};
```

3. Add `NEWSUPPLIER` to the `Supplier` enum in `prisma/schema.prisma`

4. Run `pnpm db:migrate` to apply schema changes

5. Create sync cron endpoint at `app/api/sync/newsupplier/route.ts`

6. Add to `vercel.json` crons

---

## Supplier Comparison

| | BigBuy | DietiSur |
|--|--------|----------|
| Catalog size | 200,000+ | ~2,000 |
| Order API | REST API | Email |
| Sync method | REST API | CSV |
| Delivery | EU-wide | Spain 24-48h |
| Brands | Pharmacy + premium | Eco/natural |
| Markup | 1.8x | 2.0x |
| Min order | None | None |
