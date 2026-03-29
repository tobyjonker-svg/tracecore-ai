# Test Mockup Verification Checklist

## Overview
Test mockup created for Herbal Tea Manufacturing business with complete data flow testing.

---

## Data Summary

### Suppliers (10 Total)
- **Real:** Pacific Botanicals, Bulk Apothecary, SKS Bottle & Packaging, Grain & Spore Co. (4)
- **Test:** Herbal Imports Ltd, Premium Tea Leaves Co, Organic Spice Traders, Eco Packaging Solutions, Natural Extracts Inc, Global Ingredients Hub (6)

### Raw Inputs (10 Total)
- **Real:** Lion's Mane (4500g), Reishi (2200g), Cordyceps (1800g), Alcohol (85L), Bottles (340), Labels (18), Glycerin (12L) (7)
- **Test:** Chamomile (5200g), Peppermint (3800g), Ginger (2900g) (3)

### Products (10 Total)
- **Real:** Lion's Mane Tincture (48), Reishi Tincture (12), Cordyceps Capsules (35), Mushroom Blend (6), Chaga Powder (22) (5)
- **Test:** Chamomile Tea (85), Peppermint Tea (62), Ginger Turmeric Tea (45), Wellness Mix (28), Relaxation Sampler (18) (5)

### Production Runs (10 Total)
- **Real:** 5 runs (Lion's Mane x2, Cordyceps, Reishi, Chaga)
- **Test:** 5 runs (Chamomile, Peppermint, Ginger Turmeric, Wellness Mix, Relaxation Sampler)

### Orders (10 Total)
- **Real:** 5 orders (Pending, Packed, Shipped mix)
- **Test:** 5 orders from [TEST] customers

---

## Verification Tests

### Dashboard KPI Calculations
- [ ] **Total Products:** Should show 10 products
- [ ] **Total Revenue:** Calculate from shipped orders
- [ ] **Pending Orders:** Count orders with "Pending" status
- [ ] **Low Stock Items:** Count products below threshold
  - Reishi Tincture (12 < 15) ✓
  - Mushroom Blend (6 < 10) ✓
  - Relaxation Sampler (18 > 10) ✗

### Inventory Flow
- [ ] **Stock Tracking:** Verify all inputs show correct stock levels
- [ ] **Low Stock Alerts:** Should trigger for products below threshold
- [ ] **Production Run Impact:** Verify production runs increase product stock
- [ ] **Order Impact:** Verify orders decrease product stock

### Production Runs
- [ ] **Batch Tracking:** All 10 runs visible with correct product IDs
- [ ] **Quantity Tracking:** Verify quantities match product stock increases
- [ ] **Date Sorting:** Runs sorted by creation date (newest first)

### Orders Management
- [ ] **Order Status:** Verify Pending/Packed/Shipped statuses display correctly
- [ ] **Customer Names:** All 10 customer names visible
- [ ] **Order Items:** Verify line items show correct products and quantities
- [ ] **Order Totals:** Calculate total items per order

### Supplier Management
- [ ] **Supplier List:** All 10 suppliers visible
- [ ] **Contact Info:** Phone and email display correctly
- [ ] **Input Mapping:** Verify inputs linked to correct suppliers
- [ ] **Supplier Performance:** Track which suppliers have active inputs

### Reports & Analytics
- [ ] **Revenue Report:** Calculate from shipped orders
- [ ] **Inventory Report:** Show current stock levels
- [ ] **Production Report:** Show all 10 production runs
- [ ] **Order Report:** Show all 10 orders with status breakdown

### Data Cleanup Instructions
After testing, remove all test data:

1. **Delete Test Suppliers (sup-5 to sup-10):**
   - [TEST] Herbal Imports Ltd
   - [TEST] Premium Tea Leaves Co
   - [TEST] Organic Spice Traders
   - [TEST] Eco Packaging Solutions
   - [TEST] Natural Extracts Inc
   - [TEST] Global Ingredients Hub

2. **Delete Test Inputs (inp-8 to inp-10):**
   - [TEST] Chamomile Flowers
   - [TEST] Peppermint Leaves
   - [TEST] Ginger Root Powder

3. **Delete Test Products (prod-6 to prod-10):**
   - [TEST] Chamomile Tea Blend
   - [TEST] Peppermint Tea Blend
   - [TEST] Ginger Turmeric Tea
   - [TEST] Herbal Wellness Mix
   - [TEST] Relaxation Tea Sampler

4. **Delete Test Production Runs (pr-6 to pr-10):**
   - All [TEST] batch runs

5. **Delete Test Orders (ord-6 to ord-10):**
   - [TEST] Tea Lovers Cafe
   - [TEST] Wellness Boutique
   - [TEST] Organic Health Store
   - [TEST] Spa & Wellness Resort
   - [TEST] Herbal Remedy Shop

---

## Testing Notes

**All test data is marked with [TEST] prefix for easy identification and removal.**

**Expected System Behavior:**
- Dashboard should calculate KPIs correctly
- Inventory should track stock changes from production and orders
- Low stock alerts should trigger for items below threshold
- All calculations should flow end-to-end without errors

---

## Sign-Off
- [ ] All KPI calculations verified
- [ ] Inventory flow working correctly
- [ ] Production runs tracked accurately
- [ ] Orders processed correctly
- [ ] Reports generating properly
- [ ] Test data cleanup completed
