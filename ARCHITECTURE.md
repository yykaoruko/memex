# Architecture

Architectural decisions for this repository, in chronological order.

---

## 1. Five top-level directories with distinct roles

**Date:** 2026-03-05

**Decision:**
The repository is organized into five directories, each with a clearly different nature:

```
schema/      Shared type definitions (cross-domain)
core/        Personal facts, domain-agnostic
modules/     Domain facts — objective, structured, schema-validated
views/       Domain views — subjective prose, agent-maintained
exports/     Deliverables — composed outputs for a specific purpose
```

**Rationale:**
AI agents need to know not just *where* data lives, but *what kind* of data it is.
A single flat structure forces agents to infer intent from content. Explicit top-level
directories make the nature of each piece of data immediately clear and allow agents
to load only what they need for a given task.

---

## 2. Facts and views are separated at the top level

**Date:** 2026-03-05

**Decision:**
Subjective, interpretive content (`views/`) lives at the top level alongside `modules/`,
not inside a module subdirectory.

**Rationale:**
`modules/` contains objective facts: things that can be validated against a schema and
are maintained by the human. `views/` contains subjective prose: self-introductions,
motivations, STAR stories — created and maintained by AI agents as reusable building
blocks.

These have a fundamentally different nature. Mixing them inside a domain directory
(e.g. `modules/career/narratives/`) implies they are the same kind of data, which
they are not.

Additionally, a view can draw from multiple domains. A STAR story about leadership
might reference career history, a personal project, and a non-work experience.
Scoping it to a single module directory would be artificial.

**Corollary — three kinds of agent data:**
| Directory | Nature | Maintained by |
|---|---|---|
| `modules/` | Objective facts | Human |
| `views/` | Subjective interpretation | AI agent |
| `exports/` | One-off deliverables | AI agent |

---

## 3. Schema co-location — each module owns its schema

**Date:** 2026-03-05

**Decision:**
Each module contains its own `schema.json` (e.g. `modules/career/schema.json`).
The top-level `schema/` directory is reserved for shared types only (`common.schema.json`).

**Rationale:**
Domain schemas change together with the data they describe. Co-locating the schema
next to the data makes the module self-contained: it can be understood, copied, and
validated in isolation without knowledge of the top-level directory structure.

Centralized schemas (e.g. `schema/career.schema.json`) create implicit coupling —
a change to the data requires navigating to a different directory to update the schema,
making drift more likely.

Shared primitive types (`period`, `tags`) are the exception: they are referenced across
multiple modules and belong in `schema/common.schema.json`, referenced via `$ref`.

---

## 4. Data access layer — filesystem MCP first, DuckDB later

**Date:** 2026-03-05

**Decision:**
Start with `@modelcontextprotocol/server-filesystem` as the MCP server. DuckDB is
deferred as a future option, not ruled out.

**Rationale:**
The filesystem MCP server is sufficient for the current use case: an agent reads
individual files, filters content in its context window, and composes an output.
Personal data in `modules/` will never reach a scale where file reads are slow.

DuckDB becomes valuable when cross-file relational queries are needed — for example,
filtering skills by tag across jobs within a date range, or joining career history
with projects. These queries are awkward for an agent to perform by loading multiple
files individually.

The current JSON structure is DuckDB-compatible without modification (DuckDB reads
JSON natively via `read_json()`). Migration is therefore low-cost and can happen
incrementally when the need arises.

**Expected trigger for DuckDB adoption:**
When prompts require cross-file joins or aggregations that are too verbose to
express as "load these files and filter them."

**Permanent split regardless of query layer:**
`views/` (Markdown prose) is always served via filesystem. DuckDB is only relevant
for structured data in `modules/`.
