-- Migration: Replace BIGBUY/DIETISUR with BTSWHOLESALER
-- Uses TEXT intermediary to avoid PostgreSQL enum transaction restriction

-- Step 1: Create new enum type
CREATE TYPE "Supplier_new" AS ENUM ('BTSWHOLESALER');

-- Step 2: Convert columns to TEXT so we can freely update values
ALTER TABLE "Product" ALTER COLUMN "supplier" TYPE TEXT;
ALTER TABLE "SupplierOrder" ALTER COLUMN "supplier" TYPE TEXT;

-- Step 3: Migrate existing data
UPDATE "Product" SET "supplier" = 'BTSWHOLESALER' WHERE "supplier" IN ('BIGBUY', 'DIETISUR');
UPDATE "SupplierOrder" SET "supplier" = 'BTSWHOLESALER' WHERE "supplier" IN ('BIGBUY', 'DIETISUR');

-- Step 4: Drop old enum type
DROP TYPE "Supplier";

-- Step 5: Convert columns to new enum type
ALTER TABLE "Product" ALTER COLUMN "supplier" TYPE "Supplier_new" USING "supplier"::"Supplier_new";
ALTER TABLE "SupplierOrder" ALTER COLUMN "supplier" TYPE "Supplier_new" USING "supplier"::"Supplier_new";

-- Step 6: Rename new enum to final name
ALTER TYPE "Supplier_new" RENAME TO "Supplier";