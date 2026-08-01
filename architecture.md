# OpenPlanTier

OpenPlanTier is a catalog and recommender for open-source projects that can be
used to build a Palantir-like platform.

## Current scope

- List open-source projects.
- Group projects by platform capability.
- Record each project's license and source links.
- Let users search, filter, compare, and receive explainable recommendations.
- Let users export a selected stack as a manifest or source-download script.

OpenPlanTier does not initially install or run the listed projects.

## Capability groups

- Databases and lakehouses
- Data ingestion, transformation, and orchestration
- Ontologies, knowledge graphs, and semantic layers
- Search and vector search
- Identity, authorization, policy, and auditing
- Geospatial, graph, table, and chart interfaces
- Low-code applications and operational workflows
- AI, agents, model management, and model serving
- Deployment, observability, security, and edge operations

## Project record

Each catalog entry should contain:

```yaml
id: duckdb
name: DuckDB
description: Embedded analytical SQL database
repository: https://github.com/duckdb/duckdb
homepage: https://duckdb.org
capabilities:
  - analytical-database
palantir_analogues:
  - foundry-data-layer
license:
  spdx: MIT
  source: https://github.com/duckdb/duckdb/blob/main/LICENSE
languages:
  - C++
github_stars: 38800
status: active
last_verified: 2026-08-01
```

Every factual field should have an authoritative source and a verification
date. License data must describe the exact edition or package being listed.
New additions currently require at least 5,000 GitHub stars. Open-core entries
must name the community or core edition and must not present enterprise code as
open source.

## Recommendation input

Users can select:

- Capabilities they want to build
- Preferred languages
- Local, cloud, edge, or air-gapped deployment
- Permissive-only or copyleft-compatible licensing
- Expected data scale
- Individual, team, or enterprise complexity

Recommendations should show why each project matched and any license or
integration warnings. The first recommender can use simple rules rather than
machine learning.

## Minimal system

```text
Curated catalog files
        |
        v
Schema and link validation
        |
        v
Static search and recommendation UI
        |
        v
Manifest and source download
```

Catalog files in the repository are the source of truth. Automated metadata
refreshes should create reviewable changes instead of silently overwriting
curated facts.

## Product form

OpenPlanTier should begin as a normal web service and data repository.

- A Codex skill can be added later as a client that searches the catalog.
- A harness is only needed later if OpenPlanTier starts assembling, running,
  or testing complete platform stacks.

## Initial phases

1. Build the catalog and license inventory.
2. Add search, filters, comparisons, rule-based recommendations, and downloads.
3. Add submissions and automated metadata verification.
4. Optionally add skills, APIs, and stack assembly tools.
