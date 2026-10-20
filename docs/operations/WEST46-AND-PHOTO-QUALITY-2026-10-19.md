# West 46th consolidation and photo quality — preview

Application `afdfdce`, branch `fix/property-media-management-20261019`; no main merge or client-production release.

## Website changes

- Match the existing combined Admin record: **349-351 W 46th St**, slug `349-351-w-46th-st`. Admin currently says 349, not 346. Its canonical name and address drive the preview projection.
- One listing in each Residences/Retail directory; both former individual detail routes permanently redirect to the combined equivalent. Preserve commercial directory and vetted neighborhood content.
- Scoped additive SQL `combine-west-46th-website.sql`: retain 16 combined photos and append 23 approved building-wide split-property photos. No original assignments, source images, tenant/unit identities, covers or prior gallery order removed. Enable the explicitly requested combined Retail listing; archived split records stay archived. No bulk migration replay.
- One deterministic New York calendar-day background plan for About, Contact, Rent with Us, Residences and Retail. Reserve an eligible explicit Retail cover first, then assign four distinct Residential covers. Compare asset IDs, URLs and valid content checksums. Never cross context gates; insufficient unique inventory produces a neutral background, not a repeated/unapproved photo.
- Decorative backgrounds stop scaling above their native CSS-pixel dimensions. A charcoal surround/vignette handles larger frames; no blur filter, artificial detail or image enlargement. This changes full-bleed behavior where sources are too small.
- Restore the owner-supplied 61 Gold Street PNG byte-for-byte, replacing the compressed JPEG source for the same asset ID. Keep the prior JPEG bytes and metadata checkpoint. Asset associations, cover selections and gallery order remain unchanged. Source is still **1536 × 1024**, not 4K. Physical high-DPI output and details absent from the source are not recovered.
- Gold Street Residential and Retail detail heroes use scale-down framing; Residential offers a full-size source link. Other property gallery layout and 4-second cadence remain unchanged.

## Release and evidence

- Private Worker: `teams-combined-46th-20261019`, version `1895a22e-f007-45db-a9df-4218891d2f23`, served release `afdfdce-combined-46th-20261019`.
- Candidate gateway: https://fc9961ee.teams-management-preview.pages.dev (gateway commit `bbb48f2`, final served application `afdfdce`; private runtime updated in place during candidate QA).
- Stable preview: https://teams-management-preview.pages.dev; deployment `c3a6045d-4bc7-41d1-9c1b-3c75e85c49c2`, https://c3a6045d.teams-management-preview.pages.dev, branch `preview`, Pages production environment of the **preview project**. Selective service-binding changes preserved variables, secrets and D1 bindings.
- 273 tests / 34 files, TypeScript and canonical OpenNext preview build passed. Scoped consolidation rehearsed twice locally to prove idempotency. Remote foreign keys clean; 258 units and 341 media assets retained.
- All 39 combined photos decode signed out and match stored byte sizes/checksums. Existing Admin read and anonymous denial checked without changing selections.
- Candidate and stable responsive directory/detail checks passed at 1440/768/390; five unique decoded daily backgrounds; four 308 redirects; manual next/refresh; parsed structured data; no browser exceptions. Stable merged-gallery normal-motion hover/autoplay, Pause and Play passed without blurring controls.
- Reproduced a 1206-pixel Gold source stretched across a 2560-pixel banner. Candidate 24 source/resize checks passed across 2560/1440/768/390; final stable extra-wide backgrounds passed. Gold detail pages passed eight candidate and eight stable responsive checks, including byte-identical PNG delivery after source activation.
- Fresh OTP, physical mobile-device performance and sharp 4K/full-bleed output are not verified. Client production, main, DNS, Waterbear, roles and tenant records unchanged.

## Recovery

Prior gateway/runtime pair: `41c5b5cd-7d6c-4559-8ade-dccb8ea271fb` / `teams-daily-hero-20261019`. That older runtime lacks the new original PNG. Before reverting to it, conditionally restore the prior Gold source metadata from the private checkpoint, verifying no later media edits; the old JPEG bytes remain available. Keep additive combined associations rather than deleting sources or restoring an entire database over later Admin edits. Private checkpoints, deployment manifests and browser evidence are outside Git.
