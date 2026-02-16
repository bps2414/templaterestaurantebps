# PLAN-seed-images: Dynamic Theme Images in Seeds

> **Objective:** Ensure database seeds populate `dish.image` with theme-appropriate images (e.g., burger photos for Hamburgueria, pizza for Pizzaria).
> **Context:** Single-branch migration requires seeds to self-contain all assets for a given theme.

## 1. Analysis
- **Current State:**
  - `seed.ts` (Restaurante): No images in `dishes` array.
  - `seed-hamburgueria.ts`: No images in `dishes` array.
  - `seed-pizzaria.ts`: No images in `dishes` array.
  - Schema: `Dish` model has nullable `image String?`.
- **Requirement:** User wants "real" images for each item in the seed to match the theme.

## 2. Implementation Strategy

### A. Source Images (Unsplash)
We will use high-quality, stable Unsplash source URLs for each item.

#### Restaurante (seed.ts)
- Bruschetta: `source.unsplash.com/RaWwec-S9i0` (or similar direct link)
- File Mignon: `...`
- Tiramisu: `...`

#### Hamburgueria (seed-hamburgueria.ts)
- X-Burger: `https://images.unsplash.com/photo-1568901346375-23c9450c58cd`
- Smash Burger: `https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5`
- Fries: `https://images.unsplash.com/photo-1573080496987-a2267f884149`
- Milkshake: `https://images.unsplash.com/photo-1572490122747-3968b75cc699`

#### Pizzaria (seed-pizzaria.ts)
- Margherita: `https://images.unsplash.com/photo-1574071318500-1c580aa9656c`
- Pepperoni: `https://images.unsplash.com/photo-1628840042765-356cda07504e`
- Sweet Pizza: `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38`

### B. Execution Steps
1. **Modify `server/prisma/seed.ts`**: Add `image: 'URL'` to all 12 dishes.
2. **Modify `server/prisma/seed-hamburgueria.ts`**: Add `image: 'URL'` to all 15 dishes.
3. **Modify `server/prisma/seed-pizzaria.ts`**: Add `image: 'URL'` to all 18 dishes.

## 3. Verification
- Run `SEED_TYPE=restaurante npx prisma db seed` -> Check console.
- Run `SEED_TYPE=hamburgueria npx prisma db seed` -> Check console.
- Run `SEED_TYPE=pizzaria npx prisma db seed` -> Check console.
- (Optional) Start client and verify images appear in the menu (if UI consumes `dish.image`).

## 4. Agent Assignment
- **Agent:** `backend-specialist` (handling DB seeds).
- **Skill:** `database-design` (schema/data populating).

---

**Next Step:** Run `/create` or confirm to proceed with implementation.
