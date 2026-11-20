# Oubeid Cell Security Specification

## Data Invariants
1. **Public Read-Only Catalog**: `shop_config`, `app_meta`, `products`, `services`, `telecom_plans`, `repairs`, and `gallery_items` are publicly readable (`allow read: if true`) so storefront visitors can browse inventory without signing in.
2. **Admin-Only Writes**: All `create`, `update`, and `delete` operations across every collection are strictly restricted to `request.auth != null && request.auth.token.email == "admin@oubeidcell.app"`.
3. **Default Deny**: Unmodeled collections match `/{document=**}` and are denied for both reads and writes.
4. **Strict Payload Validation**: Every write checks `isValidId(id)` (`<= 128` chars, `^[a-zA-Z0-9_-]+$`), required keys (`hasAll`), allowed keys (`hasOnly`), field types, string length caps, and bounded arrays (`<= 12` elements).
5. **Storage Guard**: Public read; writes only by `"admin@oubeidcell.app"` with `image/*` content type and `< 5MB` limit.

## Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated `create` on `/products/p1` -> `PERMISSION_DENIED`.
2. Signed-in non-admin user (`other@example.com`) `create` on `/products/p1` -> `PERMISSION_DENIED`.
3. Admin `create` on `/products/p1` with ghost field `isVerified: true` -> `PERMISSION_DENIED` (blocked by `hasOnly`).
4. Admin `create` on `/products/bad$id` with invalid path variable -> `PERMISSION_DENIED` (`isValidId`).
5. Admin `create` on `/products/p1` with `priceUsd: -5` -> `PERMISSION_DENIED`.
6. Admin `create` on `/products/p1` with `nameEn` > 140 chars -> `PERMISSION_DENIED`.
7. Admin `create` on `/products/p1` with `images` array > 12 items -> `PERMISSION_DENIED`.
8. Unauthenticated `update` on `/shop_config/main` -> `PERMISSION_DENIED`.
9. Non-admin `delete` on `/services/s1` -> `PERMISSION_DENIED`.
10. Admin `create` on `/telecom_plans/t1` with invalid `carrier: "other"` -> `PERMISSION_DENIED`.
11. Unauthenticated `write` to `/unknown_collection/doc1` -> `PERMISSION_DENIED`.
12. Non-admin `create` on `/app_meta/admin_status` -> `PERMISSION_DENIED`.
