-- CreateIndex
CREATE INDEX "Booking_startDate_endDate_idx" ON "Booking"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Booking_shopId_status_idx" ON "Booking"("shopId", "status");

-- CreateIndex
CREATE INDEX "InventoryItem_shopId_category_idx" ON "InventoryItem"("shopId", "category");

-- CreateIndex
CREATE INDEX "InventoryItem_rentalPrice_idx" ON "InventoryItem"("rentalPrice");

-- CreateIndex
CREATE INDEX "InventoryItem_timesRented_idx" ON "InventoryItem"("timesRented");
