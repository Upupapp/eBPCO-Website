# Castilla portal — backend integration sweep

- **Front end:** `castilla-lgu-portal/` at `5453095`
- **Backend:** `Upupapp/eBPCOBackend`, `apps/castilla-portal`, contract v0.2.0
- **Date:** 3 September 2026

## The headline

**The backend is built and the portal uses none of it.**

The portal has **zero HTTP call sites** — no `HttpClient`, no `fetch`, and
`@angular/common/http` is not even a dependency. Every office, official,
permit, profile field and narrative page is a TypeScript literal compiled into
the bundle.

The backend meanwhile publishes **26 endpoints** covering all of it, and its
seed is **current**: `contract/portal-data.json` pins
`Upupapp/eBPCO-Website@55c1cfa`, and nothing under `src/app/core` has changed
since that commit. So this is not a data-drift problem. It is an integration
that has never been made.

| Portal surface | Endpoint that would serve it |
|---|---|
| Offices list + category filter | `GET /offices?category=` |
| Office detail | `GET /offices/{slug}` |
| Local government | `GET /officials` |
| Permits list + group filter | `GET /permits` |
| Permit detail | `GET /permits/{slug}` |
| Home "at a glance" | `GET /municipality/profile` |
| About / privacy narrative | `GET /pages`, `GET /pages/{key}` |
| Announcements + header count | `GET /announcements`, `/announcements/count` |
| Search across offices + permits | `GET /search?q=&type=&facet=` |
| Application form PDFs | `GET /forms`, `/forms/{familySlug}/download` |

`GET /pages/{key}` already enumerates exactly the five keys this portal has:
history, vision, mission, seal-description, privacy-policy.

## Six contract gaps

Each verified against the rendering code, not inferred from the schema.

1. **`OfficeDetail.head` has no `initials`.** The office page renders an avatar
   from them. `OfficialList.officials[]` *does* carry `initials` as required —
   the office head object does not. The Mayor's and Vice Mayor's are authored
   ("IM", "JA"), and deriving them from the name is not trivial: the client
   function handles honorifics, generational suffixes, post-nominals after a
   comma, and quoted nicknames (`Isagani "Bong" B. Mendoza` → IM). Losing the
   authored value means re-deriving it and hoping.

2. **`OfficialList` is flat, with no role or grouping.** The page renders four
   distinct groups — Mayor, Vice Mayor, eight Sangguniang Bayan members, two
   ex-officio seats. The only way to reconstruct that from the response is to
   string-match on `position`, which is the same class of defect as F-07.

3. **`MunicipalityProfile.fields[]` carries no confirmation state.** The home
   page filters unconfirmed fields out before rendering. Either the endpoint
   returns only confirmed fields — in which case say so — or the portal cannot
   honour the rule it currently honours.

4. **`category` is required on announcements, optional in the portal.** Both
   `AnnouncementSummary` and `AnnouncementDetail` mark it required; the client
   model has `category?` and a test asserting the chip is omitted when absent.
   One side has to move.

5. **`AnnouncementDetail` returns both `body` and `bodyHtml`.** The portal
   renders plain text deliberately and injects no server HTML anywhere. If
   `bodyHtml` is meant to be rendered, it needs a stated sanitisation
   guarantee; if not, it is dead weight on the wire.

6. **Office categories have no label list.** `OfficeList` returns a category
   *slug* per office, while `PermitCatalogue` returns groups with `id` **and**
   `label`. The portal renders six named filter chips. Without the same shape
   for offices, the client re-invents the slug-to-label mapping the backend
   already holds.

## Two alignment notes, no action requested

**Form URLs change origin.** The portal links `/assets/permits/<file>.pdf` from
its own origin; the API serves `/forms/{familySlug}/download`. That moves 13
real LGU documents off the site origin, outside the scoped-404 rule added in
F-20, and onto whatever caching and privacy posture the API has.

**Prerendering and a live API are in tension, and this is a decision for both
lanes.** The portal prerenders 47 static routes at build time. If content moves
behind the API, either the build fetches from it — making every deploy depend
on the API being up, which is exactly the dependency just removed for fonts in
F-26 — or the pages become client-rendered and lose the real HTML that
prerendering was added to provide. Incremental revalidation is a third option.
Worth deciding before wiring, not after.
