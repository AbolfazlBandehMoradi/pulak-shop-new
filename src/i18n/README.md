# i18n Conventions

This project now supports a page-by-page i18n migration with a clear split between:

- `src/i18n/locales/<lang>/layout/*` for layout-level UI texts (navbar, footer, etc.)
- `src/i18n/locales/<lang>/shared/*` for cross-page shared keys (`common.*`)
- `src/i18n/locales/<lang>/<page>.json` for legacy flat page files (to be migrated incrementally)

## Current migration status

- Migrated: `layout/navbar.json`
- Migrated: `shared/common.json`
- Legacy still active: `about/auth/blog/cart/categories/checkout/comment/contact/faq/footer/payment/privete/product/review/static/shop`

## Key naming rules

- Keep top-level namespaces stable (`nav.*`, `common.*`, `product.*`, etc.).
- Use lowercase camelCase for keys (`searchPlaceholder`, `continueShopping`).
- Keep keys semantic (what the text means), not UI-position-based.
- Avoid duplicate aliases unless required for compatibility.

## Page-by-page workflow

1. Pick one page/feature namespace (example: `product`).
2. Move its keys from legacy flat file to structured file:
   - Example target: `src/i18n/locales/en/pages/product.json` (or `features/product.json` if shared across pages)
3. Update the corresponding `shared.ts` or resource loader import.
4. Run the audit script:
   - `npm run i18n:audit -- --prefix=product`
5. Remove keys reported as unused after confirming no dynamic access patterns depend on them.

## Audit command

- Full: `npm run i18n:audit`
- Namespace: `npm run i18n:audit -- --prefix=nav`

The audit reports potential missing and unused keys based on literal `t("...")` usage.
Treat it as a safe guide, then confirm dynamic key cases manually.
