# Retail occupant website audit — 2026-10-14

Scope: every commercial-directory entry and every separately rendered East Tremont storefront in the current preview. The source is the supplied workbook/signage projection, not an independently verified current occupancy roll. No occupants, lease status, stored media selections, or production publication gates changed.

30 displayed entries reviewed: 29 business/storefront entries plus one storage entry. After enrichment, 17 business entries have website links and 12 remain unresolved. Storage is not treated as a business website requirement. Seven links added; ten existing links retained.

## Added links

All seven destinations returned HTTP 200 in rendered Chrome and displayed the matching street address.

| Property / space | Listed occupant | Official website / evidence |
| --- | --- | --- |
| 225 E 83rd St, lower level | NY Sang Yuan Body Works | https://nysangyuanbodyworks.com/ — business name and 225 E 83rd St on home/about page |
| 166 E 118th St, STORE 1 | Pipos Restaurant | https://piposrestaurant0898.s4shops.com/ — restaurant-operated site, name and 166 E 118th St; not reused for the separate 170 address |
| 235 W 18th St, BR | Nicholas Jones d/b/a Manhattan Tattoos | https://manhattantattoosnyc.com/ — 235 W 18th St; /about/ identifies Nick and Shakira Jones |
| 171 E 74th St, 1-4/2F/2R | Caspare Physical Therapy Wellness P.C. | https://www.phitwell.com/ — Kimberly Caspare and 171 E 74th St; https://kimberlycasparedpt.com/phit-well/ independently links this site and address |
| 171 E 74th St, C-3 | Samuel Lippin PT | https://samlippinpt.com/ — Sam Lippin / Golden Hands, exact suite C-3; https://www.choosept.com/find-a-pt/l/i/samuel-lippin-pt lists same address and former .net URL, which redirects to .com |
| 171 E 74th St, C-4 | Kristen R Riani | https://www.kristenriani.com/ — Kristen Riani Movement and exact suite C-4 |
| 307 W 39th St, STORE | HOT POT | https://www.houhotpot.com/ — Hou Hot Pot and 307 West 39th St |

## Existing links reviewed and retained

| Property / storefront | Occupant | Source |
| --- | --- | --- |
| 1365 First Ave | Mexiterranean Restaurant | https://mexiterraneangrillnyc.com/ — 200, matching address |
| 1365 First Ave | Maria Cortes NY Salon | https://www.mariacortesny.com/ — 200, matching address |
| 1374 First Ave | Delizia Restaurant Corp. | https://delizia73.com/ — 200, matching address |
| 1626 Second Ave | FUMO | https://www.fumorestaurant.com/location/fumo-upper-east-side/ — 200, matching address |
| 41 W 46th St | Mala Project | https://www.malaproject.com/ — 200; /reserve lists 41 W 46th St |
| 349 W 46th St | JazzCultural LLC | https://www.jazzcultural.com/ — 200; /info and /who-we-are identify 349 W 46th St |
| 171 E 74th St | Neurotherapeutix / Dr. Scolnick | https://neurotherapeutixnyc.com/contact-us/ — 200, exact Unit 1-1 |
| 3425 East Tremont Ave | H&R Block | https://www.hrblock.com/tax-office-near-me/new-york/bronx/30506/ — fetch/search-open 200 and exact 3425 address; automated Chrome receives 403, so rendered destination not verified |
| 3429 East Tremont Ave | Pizza Hut | https://locations.pizzahut.com/ny/bronx/3429-e-tremont-ave/pizzeria — 200, matching address |
| 3431 East Tremont Ave | T.ology | https://www.tologyny.com/ — 200, matching address |

## Unresolved — intentionally no guessed links

| Property / space | Occupant | Finding |
| --- | --- | --- |
| 42-70 156th St, Office A | New York Symphony Church | Address-matched church-directory records, no verified own website |
| 42-70 156th St, Office C | AI DentTech Inc. | No independently matched official site; unrelated dental businesses excluded |
| 170 E 118th St, STORE 1 | Benjamin's Breakfast & More Corp. | No verified official site |
| 170 E 118th St, STORE 2 | Pipo's Restaurant | Found site lists 166, not 170; do not transfer it to a different property |
| 166 E 118th St, STORE A&B | Lotus Thai Kitchen 6359 Inc. | Corporate record confirms address. Thai Super websites match address, but legal entity/DBA relationship not established; no substitution. https://thaisupernyc.com/ browser security challenge |
| 235 W 18th St, BE | LEN CS Co LTD / Salon | Lenden candidate https://www.lendenny.com/ is live at 235, but displayed copyright BRW BAR Inc. and no exact suite/legal-name bridge; not assigned speculatively |
| 235 W 18th St, BW | Tamy NY Inc. Hair Salon | State-license record https://opengovny.com/appearance-enhancement-business/AEB-22-01649 matches exact suite and Tomoko Sadayasu; no verified official website/DBA |
| 171 E 74th St, C-1 | Dr. Vincent Appow | Address-matched Chiropractic Plus records. Legacy chiropracticplus.biz could not be verified live; excluded |
| 171 E 74th St, C-2 | Dr. Roger Wolfsohn | Registry/review profiles only; no verified own site |
| 171 E 74th St, sixth-floor office | Elizabeth Wolff / Wampum Capital LLC | Corporate records only; no verified own site |
| 3421 East Tremont Ave | Dunkin’ | Address corroborated, but no live matched consumer location page verified; legacy locations.dunkindonuts.com endpoint DNS error. Do not replace with an unrelated branch or recruitment page |
| East Tremont, unspecified pictured storefront | Tattoo studio | No named/address-matched business identity to verify |

Ana Molina (Ines Cruz), 166 E 118th St STORAGE: excluded from business-site coverage; existing storage label preserved.

Research snapshots: /tmp/teams-retail-site-destinations.json. These record destination text/status, not occupancy verification.

## Retail image navigation

Directory card photo/placeholder links to the same /retail/:slug as its yellow CTA, including planned listings. Accessible property-address label, block hit target, visible keyboard focus. Featured retail image links to the same permanent East Tremont detail page as its CTA. Non-retail showcase behavior unchanged. Existing separate inquiry/maps actions preserved.

## Validation / release

Pending final candidate and stable browser verification. Typecheck and all 56 existing tests passed. Preview build passed before final semantic image-wrapper refinement; rebuilt final artifact is required for release. No D1 mutations or external business communication.
