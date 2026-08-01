# OpenPlanTier

OpenPlanTier is a lightweight catalog and stack builder for open-source projects
that can be combined into a Palantir-like platform.

## Features

- Search and filter projects by capability and license type.
- Compare licenses, languages, and the closest Palantir platform role.
- Start from Foundry-like, Gotham-like, AIP-like, and Apollo-like recipes.
- Download the selected stack as JSON.
- Download a shell script that clones every selected source repository.

The catalog is currently stored in `app/projects.ts`. The application has no
database and sends no selection data to a server.

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Build and test:

```bash
npm run build
npm test
```

OpenPlanTier is independent and is not affiliated with Palantir Technologies.
