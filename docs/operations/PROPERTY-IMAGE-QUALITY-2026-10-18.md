# Property image framing and source quality — 18 October 2026

## Owner request and verified sources

Replace Gold Street's old marked-up bridge/skyline gallery image with the supplied twilight composition, keep its high-resolution quality, review the other Gold Street images, and display full property photos rather than cropped/enlarged fills.

The new PNG is **1536 × 1024**, **2,623,160 bytes**, SHA256 `5dca42c2ec061ed3b8fddd740341b19a91d20bebafd1b2b9cc791b8a1f448b78`. The exact input bytes are copied to a versioned static asset; no resizing, recompression, enhancement or invented detail. The old skyline static file is removed from the new artifact and recoverable in Git / the private checkpoint. Existing asset ID `gold-preview-07`, assignment ID, gallery position, covers and other publication selections are retained.

All nine other existing Gold Street static images were downloaded again from the original 8 October email and compared by SHA256: **all match byte-for-byte**. There was no additional website-file compression of these nine images. Their source dimensions range from 1005–1206 pixels wide; the existing exterior render is only **1005 × 1168**, with softness and embedded borders already in the supplied source. CSS cannot recover missing detail. A genuinely higher-resolution exterior source remains necessary to improve its underlying detail. Do not use generative enhancement or artificial upscaling as a substitute for architectural evidence.

The source email also contains an alternative exterior image; it was inspected but not silently substituted or published. Private source copies and comparison evidence remain outside Git.

## Presentation changes

- Shared property galleries and property photography cards use `object-fit: scale-down`: preserve the entire composition, its aspect ratio and native resolution, with neutral framing instead of cropping or stretching.
- Gallery title/address and navigation controls sit outside the image rather than covering its details. Thumbnails remain small navigation previews, not delivery sources.
- Detail galleries expose a View full-size photo link to the served image.
- Property-image hover zoom is removed where it could crop edges. Decorative neighborhood/background artwork is a separate surface, not an original-property-photo viewer.
- Gold Street metadata records verified original dimensions and bytes so Admin shows real source size. Legacy duplicate checksums are preserved rather than merging or reassigning media records.

## Prevention and release boundaries

Preserve an unmodified approved original, use a versioned asset URL, compare source and served hashes/dimensions after release, and inspect full-frame desktop/tablet/mobile rendering. Never substitute a thumbnail/screenshot when a larger approved original exists; never claim that a larger CSS box creates detail. Existing Admin bulk uploads produce bounded web copies and do not themselves archive large originals; the owner's Drive source and the private source archive remain independent originals. The full-size Gold Street assets in this release bypass that preview-copy limit as exact static originals.

Apply only the scoped `gold-skyline-20261018.sql` data update to Waterbear development after the new asset is deliverable. Keep the old asset's associations/position and current cover choices. Do not bulk-apply the unrelated pending initializer or touch the separate 2Nspira preview/production. The pre-change 64-table database export was restored locally with exact fingerprints, integrity `ok`, and zero foreign-key violations; off-device recovery is not claimed.
