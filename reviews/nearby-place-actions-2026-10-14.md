# Separate nearby place actions — 2026-10-14

## Scope and behavior

Residential Living Nearby, Retail Commercial Setting, property Dining cards, and Dining destination details. Every nearby card has exactly two separate anchors: an underlined place name opening its verified official site, or a specific map location fallback; Get Directions always uses the current property address as origin and the separately stored place destination. External links open a new tab with noopener/noreferrer, descriptive accessible names, visible focus and external arrows. No runtime search, generic website substitution, invented distances/walk times, or data/schema mutation. Existing menu/reservation/order actions on the dedicated Dining page remain.

129 stored card records normalized: 54 website assignments across 44 distinct source places; 75 map-name fallbacks. Categories, names, existing source facts, destination queries, and map coordinates retained. New explicit fields: officialWebsiteUrl, websiteVerifiedAt, websiteEvidenceUrl, destinationAddress, destinationCoordinates, distanceLabel, walkTimeLabel, directionsDestination. Unknown distance/walk time remains null. Sarasota routes retain building-entrance origins without Unit 402.

## Official URLs verified

Primary-site rendered/fetched responses checked on October 14. Sources are kept independently from visitor website and directions destinations. Address/identity match checked against existing exact-place sources; chain homepages may be shared, but directions remain branch-specific. NYC Parks and IHG have primary fetch 200 evidence despite automated Chrome access blocking. A successful HTML response alone did not establish ownership: Throgs Neck legacy domain redirects to an unrelated Indian school, Dear Mama homepage describes a different address, Poses Park source redirects to generic communications, and several café/theater legacy URLs return 404 or redirect elsewhere. Those were excluded, repaired only when a new primary destination was independently verified, or left mapped. Al Hirschfeld uses the official ATG venue page, not the similarly named unofficial ticket domain.

| Place | Source | Official destination |
| --- | --- | --- |
| Murray Hill Playground | https://www.openstreetmap.org/way/425627322 | https://www.nycgovparks.org/parks/murray-hill-playground/ |
| Mcgoldrick | https://www.openstreetmap.org/way/284526634 | https://www.queenslibrary.org/about-us/locations/mcgoldrick |
| 125th Street Library | https://www.openstreetmap.org/way/271605663 | https://www.nypl.org/locations/125th-street |
| Peter Minuit Playground | https://www.openstreetmap.org/way/225171034 | https://www.nycgovparks.org/parks/peter-minuit-playground/ |
| Aguilar Library | https://www.openstreetmap.org/way/271277515 | https://www.nypl.org/locations/aguilar |
| Westside Market | https://www.openstreetmap.org/node/6055243196 | https://www.wmarketnyc.com/location/1407-lexington-avenue/ |
| CVS Pharmacy | https://www.openstreetmap.org/node/3590689284 | https://www.cvs.com/store-locator/new-york-ny-pharmacies/1622-third-ave-borough-of-manhattan-new-york-ny-10128/storeid=2036 |
| Ruppert Park | https://www.openstreetmap.org/way/353000933 | https://www.nycgovparks.org/parks/ruppert-park |
| 96th Street Library | https://www.openstreetmap.org/way/266924969 | https://www.nypl.org/locations/96th-street |
| CVS Pharmacy | https://www.openstreetmap.org/node/5599203463 | https://www.cvs.com/store-locator/new-york-ny-pharmacies/305-east-86th-st-new-york-ny-10028/storeid=10970 |
| Café Maud | https://www.openstreetmap.org/node/9683499914 | https://www.cafemaud.com/ |
| Yorkville Library | https://www.openstreetmap.org/way/266899958 | https://www.nypl.org/locations/yorkville |
| Gristedes | https://www.openstreetmap.org/node/2620513862 | https://gristedes.com/ |
| Caligor Pharmacy | https://www.openstreetmap.org/node/9233658444 | https://www.caligorpharmacy.com/ |
| Madame Bontè Café | https://www.openstreetmap.org/node/9497036165 | https://www.madamebonte.com/locations |
| New Drug Loft | https://www.openstreetmap.org/node/9233618003 | https://newdrugloft.com/contact/ |
| The New York Society Library | https://www.openstreetmap.org/way/266928744 | https://www.nysoclib.org/ |
| Duane Reade | https://www.openstreetmap.org/node/2629371822 | https://www.walgreens.com/locator/walgreens-1352+1st+ave-new+york-ny-10021/id=14398 |
| Webster Library | https://www.openstreetmap.org/way/266900751 | https://www.nypl.org/locations/webster |
| Whole Foods Market | https://www.openstreetmap.org/node/4665840837 | https://www.wholefoodsmarket.com/stores/bryantpark |
| Duane Reade | https://www.openstreetmap.org/node/12968777478 | https://www.walgreens.com/locator/walgreens-158+w.+45th+st.-new+york-ny-10036/id=21263 |
| Stephen A. Schwarzman Building | https://www.openstreetmap.org/way/265302076 | https://www.nypl.org/locations/schwarzman |
| Columbus Library | https://www.openstreetmap.org/way/265325033 | https://www.nypl.org/locations/columbus |
| Duane Reade | https://www.openstreetmap.org/node/2649092003 | https://www.walgreens.com/locator/walgreens-625+8th+ave-new+york-ny-10018/id=14217 |
| McCaffrey Playground | https://www.openstreetmap.org/way/266077861 | https://www.nycgovparks.org/parks/mccaffrey-playground |
| CityMD | https://www.openstreetmap.org/node/5855965350 | https://www.citymd.com/urgent-care-locations/ny/west-42nd |
| Gristedes | https://www.openstreetmap.org/node/2377128155 | https://gristedes.com/ |
| Chelsea Green | https://www.openstreetmap.org/way/371120098 | https://www.nycgovparks.org/parks/chelsea-green-park |
| Muhlenberg Library | https://www.openstreetmap.org/way/264650639 | https://www.nypl.org/locations/muhlenberg |
| New Amsterdam Library | https://www.openstreetmap.org/node/2632446787 | https://www.nypl.org/locations/new-amsterdam |
| Selby Library | https://scgovlibrary.librarymarket.com/branch/selby-library | https://scgovlibrary.librarymarket.com/branch/selby-library |
| Whole Foods Market — Sarasota | https://www.wholefoodsmarket.com/stores/sarasota | https://www.wholefoodsmarket.com/stores/sarasota |
| Marie Selby Botanical Gardens — Downtown Sarasota | https://selby.org/visit/ | https://selby.org/visit/ |
| Sarasota Opera House | https://www.sarasotaopera.org/directions | https://www.sarasotaopera.org/directions |
| Marina Jack | https://www.marinajacks.com/contact.html | https://www.marinajacks.com/contact.html |
| The Franklin | https://www.openstreetmap.org/node/7868765654 | https://www.ihg.com/voco/hotels/us/en/new-york/nycvo/hoteldetail |
| Comic Strip Live | https://www.openstreetmap.org/node/5794935823 | https://comicstriplive.com/ |
| The Kaye Playhouse | https://www.openstreetmap.org/node/14096143302 | https://www.hunter.cuny.edu/the-kaye-playhouse/ |
| James Earl Jones Theatre | https://www.openstreetmap.org/way/266170541 | https://shubert.nyc/theatres/james-earl-jones/ |
| Times Square | https://www.timessquarenyc.org/ | https://www.timessquarenyc.org/ |
| Al Hirschfeld Theatre | https://www.openstreetmap.org/way/265320169 | https://us.atgtickets.com/venues/al-hirschfeld-theatre/venue-info/ |
| Hotel Scherman | https://www.openstreetmap.org/node/13991571083 | https://www.hotelscherman.com/ |
| Barrymore Theatre | https://www.openstreetmap.org/way/266149297 | https://shubert.nyc/theatres/barrymore/ |
| The Joyce Theater | https://www.openstreetmap.org/way/264629134 | https://www.joyce.org/ |

## Source review / QA evidence

- /tmp/teams-nearby-osm-tags.json: current mapped-place website/address tags (candidate research only).
- /tmp/teams-nearby-website-verification.json: rendered destination status/identity/address text.
- /tmp/teams-nearby-approved-websites.json: approved URL selection, with additional primary-fetch evidence in this session.
- /tmp/teams-nearby-final-inventory.json: every normalized record.

Typecheck, all 59 tests, and final Pages preview build passed. Source e905096; candidate https://45a730ca.teams-management-preview.pages.dev; stable https://f084c17c.teams-management-preview.pages.dev (Pages primary branch preview), https://teams-management-preview.pages.dev. Existing property/retail/photo-label changes preserved; no main merge/custom-domain rollout.

Candidate and stable checks: 34 public routes, 179 rendered nearby cards; exact official/map-name hrefs and per-property origin/destination parameters matched the normalized records. Every nearby card has exactly two external anchors. 15 desktop/tablet/mobile page-width checks (1440/768/390) passed overflow and keyboard focus; screenshots reviewed for Retail/Residential target cards, Sarasota and Dining. Dining property and standalone actions separately checked against Delizia 73 and 1374 First Avenue.

On stable /retail/225-e-83rd-st, actual new-tab activation verified for Gristedes (https://gristedes.com/), Madame Bonte official locations, map-only 86 St (Q) name (Maps search, no origin or destination route parameters), and separate Madame Bonte Get Directions (225 E 83rd St origin, 318 E 84th St destination). Refresh retains Franklin and Comic Strip official URLs. Google Maps opened the exact route URL; its computed route UI was blank in this headless capture, so no claim of rendered Google route calculation. Site link/navigation contracts passed. All 34 app routes returned 200; no app page errors. Existing Admin and Tenant sessions passed in isolated contexts; no new OTP, D1 mutation or public production release.

Evidence: /tmp/teams-nearby-candidate-qa.json, /tmp/teams-nearby-stable-qa.json, /tmp/teams-nearby-tests.log, /tmp/teams-nearby-build.log, /tmp/teams-nearby-*.png.
