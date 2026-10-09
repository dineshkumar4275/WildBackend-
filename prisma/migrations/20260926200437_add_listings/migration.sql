-- CreateTable
CREATE TABLE "listing" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "breed" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "age" VARCHAR(50),
    "description" TEXT NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "images" TEXT[],
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unlock" (
    "id" SERIAL NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_sellerId_idx" ON "listing"("sellerId");

-- CreateIndex
CREATE INDEX "listing_category_idx" ON "listing"("category");

-- CreateIndex
CREATE INDEX "listing_status_idx" ON "listing"("status");

-- CreateIndex
CREATE INDEX "listing_createdAt_idx" ON "listing"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "unlock_listingId_idx" ON "unlock"("listingId");

-- CreateIndex
CREATE INDEX "unlock_buyerId_idx" ON "unlock"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "buyerId_listingId" ON "unlock"("buyerId", "listingId");

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock" ADD CONSTRAINT "unlock_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock" ADD CONSTRAINT "unlock_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
