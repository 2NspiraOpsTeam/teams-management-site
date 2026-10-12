# 61 Gold St aerial prototype source evaluation (2026-10-12)

## Property geometry

- NYC Planning Labs Geosearch PAD address match for `61 GOLD STREET`: BIN **1001288**, BBL **1000930034**, address point `[-74.005217, 40.709682]` (PAD version 26c).
- NYC Open Data [BUILDING dataset 5zhs-2jue](https://data.cityofnewyork.us/City-Government/BUILDING/5zhs-2jue), queried by BIN 1001288: photogrammetric 34-vertex footprint; `height_roof` 153.81587032 ft (46.88 m); last edited 2017-08-22. Snapshot: `src/data/61-gold-st-official-geometry.json`.
- The supplied marker `[-74.005146181808, 40.709506004338]` is approximately **8.25 m south of the official footprint boundary**. It remains unchanged. The prototype outlines the address-linked official footprint separately.
- NYC's [3-D Building Model](https://github.com/CityOfNewYork/nyc-geo-metadata/blob/main/Metadata/Metadata_3DBuildingModel.md) was a one-time 2014 aerial capture. Its LOD 1/1.5 geometry is useful context but not a verified current facade model.

## Imagery candidates

| Source | Site coverage / quality | License / delivery | Verdict |
| --- | --- | --- | --- |
| [OpenAerialMap STAC](https://api.imagery.hotosm.org/stac/search?bbox=-74.006,40.709,-74.004,40.711) | Only a 2024 Sentinel-derived **10 m GSD** image and a 30 m DEM returned for the 61 Gold St bbox. | Image record CC BY 4.0; no useful building detail. | Reject for property-scale view. |
| [NYC 2018 XYZ orthos](https://maps.nyc.gov/tiles/) | Manhattan covered at **6 in/pixel**, full true ortho; tile at z19/z20 visually shows individual roofs and street detail. Captured April 14–May 2, 2018. | City-hosted GeoServer/GeoWebCache XYZ, CC BY 4.0, no key or documented per-view fee. | Use for isolated aerial flyover prototype. Aging imagery and shadow at the site limit architectural identification. |
| [NYC 2024 orthos](https://github.com/CityOfNewYork/nyc-geo-metadata/blob/main/Metadata/Metadata_AerialImagery.md) | Citywide **6 in/pixel** true ortho captured March 14–24, 2024; property tile checked. | Open imagery is CC BY 4.0 and [downloadable](https://gis.ny.gov/new-york-city-orthoimagery-downloads), but the convenient online tiles are hosted at `tiles.arcgis.com`. The service's free commercial production delivery/limits are not established. | Better source for a future self-hosted tile set; do not make ArcGIS Online a production dependency without a separate delivery review. |

## Production boundary

This prototype has **no API key and no billed map-view SKU**. CC BY 4.0 allows commercial reuse with attribution. The City's public tile page explicitly licenses each tile set CC BY 4.0, but it provides no SLA or stated unlimited throughput. City hosting or Cloudflare's free allowances may change; this does **not** guarantee unconditional $0 operation at arbitrary scale. For a durable zero-per-view-dependency production version, generate a bounded self-hosted tile pyramid from the official 2024 download, then validate asset size and Cloudflare quota/traffic. Do not bulk copy the hosted ArcGIS tiles as a substitute for the official download.
