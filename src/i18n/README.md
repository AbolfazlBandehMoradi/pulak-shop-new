# i18n Conventions

This project now supports a page-by-page i18n migration with a clear split between:

- `src/i18n/locales/<lang>/layout/*` for layout-level UI texts (navbar, footer, etc.)
- `src/i18n/locales/<lang>/shared/*` for cross-page shared keys (`common.*`)
- `src/i18n/locales/<lang>/<page>.json` for legacy flat page files (to be migrated incrementally)

## Current migration status

- Migrated: `layout/navbar.json`
- Migrated: `layout/footer.json`
- Migrated: `shared/common.json`
- Legacy still active: `about/auth/blog/cart/categories/checkout/comment/contact/faq/payment/profile/product/review/returnPolicy/shop`

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
- Locale: `npm run i18n:audit -- --locale=en`
- Dry run (default): `npm run i18n:audit -- --dry-run`
- Apply key cleanup: `npm run i18n:audit -- --write`
- Apply key cleanup + delete unused namespace files:
  `npm run i18n:audit -- --write --delete-files`
- Verbose output: `npm run i18n:audit -- --verbose`

Flags:

- `--locale=<code>` target locale folder
- `--prefix=<key>` analyze only a namespace/key subtree
- `--write` apply JSON key removals
- `--delete-files` delete fully unused namespace files (requires `--write`)
- `--dry-run` preview without modifying files
- `--verbose` print detailed output

The script reports missing/unused keys, can prune unused keys from JSON files, and can
optionally delete unused translation files. Dynamic keys are ignored on purpose and should
still be reviewed manually.
