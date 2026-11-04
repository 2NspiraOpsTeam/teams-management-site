# Offline photo preparation

Uses the existing pinned Sharp/libvips bundled with Next, locally, with no API key, external image service, inference endpoint or paid transform. Run `prepare.cjs --inventory <private-approved-public-media-inventory.json>` only against sources independently confirmed public/published. Never pass resident uploads, identity documents or private assets. Input source paths and exported database content stay outside this public repository.

The source inventory contains `assets` with id, original_url, storage_key, checksum, source_file and cover; `missing` must be empty. Originals are retained unchanged. Generated `photo-variants.json` contains only public image identifiers, original checksums and derivative metadata—not database records, credentials or private filesystem paths.

Preparation auto-orients, preserves aspect ratio, resamples with Lanczos3, applies mild sharpening only to enlarged copies, and creates responsive WebP sizes. It does not generate architectural detail, replace text/people/objects, change lighting, retouch property condition or promise real detail absent from a screenshot. Native high-resolution originals remain preferable. Logos use lossless encoding. Existing image credits/licenses remain attached to their original page uses; processed files are resized/re-encoded derivatives of those same originals. Paper/grain textures remain at their existing native tile scale.

`build:preview:worker` builds OpenNext then calls `stage.cjs`; staging checks each derivative checksum. The canonical production portfolio build also stages its approved derivatives; ordinary builds without portfolio presentation retain original URLs. Do not bypass this separation in future release scripts.

D1-linked derivatives are staged under an HTTP-blocked `_photo-variants` namespace. Public requests must use `/api/media/:id?v=<source-sha>&w=<prepared-width>`; existing live publication/property/unit/visibility gates still apply before bytes load, and source metadata must match the prepared version. Only exact prepared widths are accepted; no on-request image processing or arbitrary fetch. Versioned public cache entries separate widths, release and publication scope with the existing maximum 60-second revalidation window. Direct/encoded private namespace requests must 404. Static public brand/neighborhood derivatives retain the original static-public distribution scope.

When a saved photo changes, stale derivatives are rejected rather than applied to new source bytes. Newly uploaded/unprepared sources keep their existing original path; re-inventory and prepare after approval. No cover, gallery, ordering, caption, property/unit assignment or original stored bytes should be changed by this workflow.

## Launch mobile delivery optimization (November 2026)

`optimize-delivery.cjs --inventory <private-approved-public-media-inventory.json>`
re-encodes only existing public covers and static prepared renditions at widths up
to 960px, from checksum-verified original sources. It retains originals, larger
renditions, photo selections, geometry and publication checks. The small emblem
also receives exact 72/144/216px choices; transparency is preserved. Review the
rendered result before release. This is standard Sharp encoding, not AI editing.

`delivery-manifest.cjs` derives the browser-only URL/width index. Client components
must import `photo-delivery`, not the full authorization/checksum manifest. Tests
compare all responsive URLs and full-size links against the authoritative server
manifest and enforce a compressed-size budget. Both canonical preview and
production builds regenerate the index before compiling, then stage and checksum
all public and guarded renditions. Production portfolio presentation is explicitly
enabled by `build:production:worker`; ordinary non-portfolio consumers retain their
original URLs. Never place guarded media derivatives in the public Pages gateway.
