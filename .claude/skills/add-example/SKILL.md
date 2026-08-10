---
name: add-example
description: Use when adding a new usage example to csv-stream-lite's examples/ directory (e.g. "add an example for X", "show how to use Y in the docs/examples"). Handles the file naming convention, EXAMPLES.md regeneration, and verifying it compiles against local source.
---

# Adding an example

This repo generates `EXAMPLES.md` from the `.ts` files in `examples/`. Follow
these steps whenever adding a new example.

## 1. Pick the next number and a short slug

Files are named `NN-short-slug.ts`, numbered sequentially in the order they
should appear in `EXAMPLES.md`. Check the highest existing number:

```bash
ls examples/ | sort
```

Use the next number, zero-padded to two digits (e.g. `08-`, `09-`).

## 2. Write the example

Follow the existing style in `examples/`:

- Import from the published package name, `csv-stream-lite`, not a relative
  `src` path — e.g. `import { Csv } from 'csv-stream-lite'`.
- The **first line must be a `//` comment** with a short human-readable title.
  The doc generator (`scripts/build-examples.ts`) extracts this line's text
  as the `##` heading in `EXAMPLES.md` — don't skip it or bury it after other
  code.
- Keep the example runnable top-to-bottom (it's meant to be copy-pasteable).
- End with a `// Output:` comment block showing what running the example
  actually prints, so readers don't have to run it to know what it does.
- Prefer plain, realistic sample data over contrived edge cases — save edge
  cases for tests, not examples.

## 3. Regenerate EXAMPLES.md

Never hand-edit `EXAMPLES.md` — it's generated. Run:

```bash
pnpm run compile:examples
```

This runs `scripts/build-examples.ts` (rebuilds the doc from every file in
`examples/`) and formats it with prettier. Commit the regenerated
`EXAMPLES.md` alongside the new example file.

## 4. Verify it actually compiles against local source

The root `package.json` links `csv-stream-lite` to the local workspace
package (`workspace:*`), so examples type-check against your in-progress
source, not the last npm release. If you're adding an example for an API you
just added in the same change, rebuild the package first:

```bash
pnpm -r run compile   # rebuilds packages/csv-stream-lite so its dist/types are current
pnpm run compile:test # tsc --noEmit over examples/ and scripts/ — must pass
```

Both must pass before opening a PR — this mirrors what CI's `pnpm compile`
step checks.

## 5. Actually run it

Sanity-check the example's real output matches what you wrote in its
`// Output:` comment:

```bash
pnpm exec tsx examples/NN-short-slug.ts
```
