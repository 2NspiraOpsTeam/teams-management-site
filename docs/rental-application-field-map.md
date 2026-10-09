# Teams Management rental application — canonical field map

> Generated from [the machine-readable registry](../src/config/rental-application-fields.ts) by `node scripts/generate-rental-field-map.cjs`. Edit the registry, then regenerate this document. No application collection, upload, screening, consent, or signature workflow is enabled by these definitions.

## Scope and counts

- **84 current canonical fields** across applicant-entered, deferred, document-metadata, and system-managed fields; 4 legacy keys are recorded separately below and are not application fields.
- **53 existing AcroForm fields** in the supplied 4-page PDF. The registry maps all 53: 49 direct or grouped mappings, with the two occupant row patterns covering three PDF rows each.
- **56 target semantic PDF mappings**. A target name is a specification, not proof that the supplied PDF already uses it.
- **8 highly sensitive fields** and **9 legal-review fields**. Screening question definitions below are additional catalogue items, not seven separate applicant field keys.

## Contract

`key` is the stable canonical key. `[]` denotes a repeatable collection; never store the literal brackets as an instance ID. `onlineField`, `adminDisplay`, `storage`, and target `pdfField` are projections of the same registry, not independent schemas. `currentPdfField` records the exact current AcroForm name or a clearly marked row pattern. Null means the field is not in the supplied PDF. All new PDF fields must receive semantic names and be tested against an actual fill/save/reopen cycle before a revised PDF is published.

`building_address` must be resolved from a valid Teams D1 `property_id`, not accepted as a trusted free-text property reference. Requested move-in, landlord phone, and prepared-by/date remain mapped because they exist in the modernized PDF even though the supplied proposed table did not list them. Previous employment `employed_until` is explicitly included because the modernized PDF has it. The current PDF has one rental-history row and three occupant rows; the online model is repeatable. Current employer addresses are one PDF field each, so their city/state/ZIP components cannot round-trip separately through this PDF without a revised form.

## Field registry

| Key | Display label | Type | Required | Validation | Repeatable | Sensitivity | Target PDF field | Current PDF field | Online field | Admin display | Storage destination | Legal review | Active | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| property_id | Property | reference | required | Existing published Teams D1 building ID; server resolves address. | No | public | property_id | — | property_id | Property | applications.property_id | No | Yes | — |
| building_address | Building | text | required | Server-derived from property_id; read-only online. | No | public | building | property.building | — | Building | application_data.building_address | No | Yes | — |
| unit_number | Apt # | text | optional | Trim; reject control characters; enforce bounded length. | No | public | apt_number | property.unit | unit_number | Apt # | application_data.unit_number | No | Yes | — |
| bedroom_count | # of Bedrooms | number | optional | Integer from 0 to 20. | No | public | bedrooms | property.bedrooms | bedroom_count | # of Bedrooms | application_data.bedroom_count | No | Yes | — |
| monthly_rent | Monthly Rent | currency | optional | Nonnegative USD amount; two decimal places. | No | financial | monthly_rent | property.rent | monthly_rent | Monthly Rent | application_data.monthly_rent | No | Yes | — |
| requested_move_in | Requested Move-in | date | optional | Valid calendar date. | No | personal | requested_move_in | property.move_in | requested_move_in | Requested Move-in | application_data.requested_move_in | No | Yes | — |
| applicant.first_name | First Name | text | required | Trim; reject control characters; enforce bounded length. | No | personal | applicant_first_name | applicant.first_name | applicant.first_name | First Name | application_data.applicant.first_name | No | Yes | — |
| applicant.last_name | Last Name | text | required | Trim; reject control characters; enforce bounded length. | No | personal | applicant_last_name | applicant.last_name | applicant.last_name | Last Name | application_data.applicant.last_name | No | Yes | — |
| applicant.street_address | Current Street Address | text | required | Trim; reject control characters; enforce bounded length. | No | personal | current_street_address | applicant.street | applicant.street_address | Current Street Address | application_data.applicant.street_address | No | Yes | — |
| applicant.apartment_number | Current Apt # | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | current_apt_number | applicant.unit | applicant.apartment_number | Current Apt # | application_data.applicant.apartment_number | No | Yes | — |
| applicant.city | City | text | required | Trim; reject control characters; enforce bounded length. | No | personal | current_city | applicant.city | applicant.city | City | application_data.applicant.city | No | Yes | — |
| applicant.state | State | text | required | Two-letter US state or approved territory. | No | personal | current_state | applicant.state | applicant.state | State | application_data.applicant.state | No | Yes | — |
| applicant.zip | ZIP | text | required | US ZIP or ZIP+4. | No | personal | current_zip | applicant.zip | applicant.zip | ZIP | application_data.applicant.zip | No | Yes | — |
| applicant.email | Email Address | email | required | Valid email address; max 254 characters. | No | personal | email | applicant.email | applicant.email | Email Address | application_data.applicant.email | No | Yes | — |
| applicant.home_phone | Home Phone | phone | optional | Valid phone number. | No | personal | home_phone | applicant.home_phone | applicant.home_phone | Home Phone | application_data.applicant.home_phone | No | Yes | — |
| applicant.cell_phone | Cell Phone | phone | required | Valid phone number. | No | personal | cell_phone | applicant.mobile | applicant.cell_phone | Cell Phone | application_data.applicant.cell_phone | No | Yes | — |
| applicant.work_phone | Work Phone | phone | optional | Valid phone number. | No | personal | work_phone | applicant.work_phone | applicant.work_phone | Work Phone | application_data.applicant.work_phone | No | Yes | — |
| applicant.guarantor_relationship | Guarantor Relationship | text | conditional | Required when applicant is a guarantor. | No | personal | guarantor_relationship | applicant.guarantor_relationship | applicant.guarantor_relationship | Guarantor Relationship | application_data.applicant.guarantor_relationship | No | Yes | — |
| occupants[].name | Occupant Name | text | conditional | Required for each added occupant. | Yes | personal | occupants[].name | occupants.{1..3}.name | occupants[].name | Occupant Name | application_data.occupants[].name | No | Yes | — |
| occupants[].relationship | Relationship | text | optional | Trim; reject control characters; enforce bounded length. | Yes | personal | occupants[].relationship | occupants.{1..3}.relationship | occupants[].relationship | Relationship | application_data.occupants[].relationship | No | Yes | — |
| rental_history[].landlord_name | Landlord | text | optional | Trim; reject control characters; enforce bounded length. | Yes | personal | rental_history[].landlord_name | rental.landlord | rental_history[].landlord_name | Landlord | application_data.rental_history[].landlord_name | No | Yes | — |
| rental_history[].landlord_address | Rental Property Address | text | optional | Trim; reject control characters; enforce bounded length. | Yes | personal | rental_history[].landlord_address | rental.address | rental_history[].landlord_address | Rental Property Address | application_data.rental_history[].landlord_address | No | Yes | Current PDF requests rental property address, not landlord mailing address; confirm business meaning. |
| rental_history[].landlord_phone | Landlord Contact Phone | phone | optional | Valid phone number. | Yes | personal | rental_history[].landlord_phone | rental.phone | rental_history[].landlord_phone | Landlord Contact Phone | application_data.rental_history[].landlord_phone | No | Yes | — |
| rental_history[].residency_from | Resident From | month | optional | Valid YYYY-MM; before residency_to. | Yes | personal | rental_history[].residency_from | rental.from | rental_history[].residency_from | Resident From | application_data.rental_history[].residency_from | No | Yes | — |
| rental_history[].residency_to | Resident To | month | optional | Valid YYYY-MM; after residency_from. | Yes | personal | rental_history[].residency_to | rental.to | rental_history[].residency_to | Resident To | application_data.rental_history[].residency_to | No | Yes | — |
| rental_history[].monthly_rent | Monthly Rent | currency | optional | Nonnegative USD amount. | Yes | financial | rental_history[].monthly_rent | rental.monthly_rent | rental_history[].monthly_rent | Monthly Rent | application_data.rental_history[].monthly_rent | No | Yes | — |
| rental_history[].reason_for_leaving | Reason for Leaving | textarea | optional | Trim; reject control characters; enforce bounded length. | Yes | personal | rental_history[].reason_for_leaving | rental.reason_leaving | rental_history[].reason_for_leaving | Reason for Leaving | application_data.rental_history[].reason_for_leaving | No | Yes | — |
| employment_current.currently_employed | Currently Employed | boolean | required | True or false. | No | personal | employment_current.currently_employed | employment.current.employed | employment_current.currently_employed | Currently Employed | application_data.employment_current.currently_employed | No | Yes | — |
| employment_current.company_name | Company | text | conditional | Required if currently employed. | No | personal | employment_current.company_name | employment.current.company | employment_current.company_name | Company | application_data.employment_current.company_name | No | Yes | — |
| employment_current.street_address | Employer Street Address | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_current.street_address | employment.current.address | employment_current.street_address | Employer Street Address | application_data.employment_current.street_address | No | Yes | Current PDF stores full employer address in one field. |
| employment_current.city | CITY | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_current.city | — | employment_current.city | CITY | application_data.employment_current.city | No | Yes | Current PDF combines employer address into one field. |
| employment_current.state | STATE | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_current.state | — | employment_current.state | STATE | application_data.employment_current.state | No | Yes | Current PDF combines employer address into one field. |
| employment_current.zip | ZIP | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_current.zip | — | employment_current.zip | ZIP | application_data.employment_current.zip | No | Yes | Current PDF combines employer address into one field. |
| employment_current.occupation | Occupation | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_current.occupation | employment.current.occupation | employment_current.occupation | Occupation | application_data.employment_current.occupation | No | Yes | — |
| employment_current.responsibilities | Responsibilities | textarea | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_current.responsibilities | employment.current.responsibilities | employment_current.responsibilities | Responsibilities | application_data.employment_current.responsibilities | No | Yes | — |
| employment_current.supervisor_name | Supervisor’s Name | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_current.supervisor_name | employment.current.supervisor | employment_current.supervisor_name | Supervisor’s Name | application_data.employment_current.supervisor_name | No | Yes | — |
| employment_current.employer_phone | Employer Phone | phone | optional | Valid phone number. | No | personal | employment_current.employer_phone | employment.current.phone | employment_current.employer_phone | Employer Phone | application_data.employment_current.employer_phone | No | Yes | — |
| employment_current.gross_annual_salary | Gross Annual Salary | currency | optional | Nonnegative USD amount. | No | financial | employment_current.gross_annual_salary | employment.current.salary | employment_current.gross_annual_salary | Gross Annual Salary | application_data.employment_current.gross_annual_salary | No | Yes | — |
| employment_current.employed_since | Employed Since | month | optional | Valid YYYY-MM. | No | personal | employment_current.employed_since | employment.current.since | employment_current.employed_since | Employed Since | application_data.employment_current.employed_since | No | Yes | — |
| employment_previous.company_name | Company | text | conditional | Optional history. | No | personal | employment_previous.company_name | employment.previous.company | employment_previous.company_name | Company | application_data.employment_previous.company_name | No | Yes | — |
| employment_previous.street_address | Employer Street Address | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_previous.street_address | employment.previous.address | employment_previous.street_address | Employer Street Address | application_data.employment_previous.street_address | No | Yes | Current PDF stores full employer address in one field. |
| employment_previous.city | CITY | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_previous.city | — | employment_previous.city | CITY | application_data.employment_previous.city | No | Yes | Current PDF combines employer address into one field. |
| employment_previous.state | STATE | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_previous.state | — | employment_previous.state | STATE | application_data.employment_previous.state | No | Yes | Current PDF combines employer address into one field. |
| employment_previous.zip | ZIP | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_previous.zip | — | employment_previous.zip | ZIP | application_data.employment_previous.zip | No | Yes | Current PDF combines employer address into one field. |
| employment_previous.occupation | Occupation | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_previous.occupation | employment.previous.occupation | employment_previous.occupation | Occupation | application_data.employment_previous.occupation | No | Yes | — |
| employment_previous.responsibilities | Responsibilities | textarea | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_previous.responsibilities | employment.previous.responsibilities | employment_previous.responsibilities | Responsibilities | application_data.employment_previous.responsibilities | No | Yes | — |
| employment_previous.supervisor_name | Supervisor’s Name | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | employment_previous.supervisor_name | employment.previous.supervisor | employment_previous.supervisor_name | Supervisor’s Name | application_data.employment_previous.supervisor_name | No | Yes | — |
| employment_previous.employer_phone | Employer Phone | phone | optional | Valid phone number. | No | personal | employment_previous.employer_phone | employment.previous.phone | employment_previous.employer_phone | Employer Phone | application_data.employment_previous.employer_phone | No | Yes | — |
| employment_previous.gross_annual_salary | Gross Annual Salary | currency | optional | Nonnegative USD amount. | No | financial | employment_previous.gross_annual_salary | employment.previous.salary | employment_previous.gross_annual_salary | Gross Annual Salary | application_data.employment_previous.gross_annual_salary | No | Yes | — |
| employment_previous.employed_since | Employed Since | month | optional | Valid YYYY-MM. | No | personal | employment_previous.employed_since | employment.previous.since | employment_previous.employed_since | Employed Since | application_data.employment_previous.employed_since | No | Yes | — |
| employment_previous.employed_until | Employed Until | month | optional | Valid YYYY-MM; after employed_since. | No | personal | employment_previous.employed_until | employment.previous.to | employment_previous.employed_until | Employed Until | application_data.employment_previous.employed_until | No | Yes | Present in supplied PDF; added explicitly to canonical schema. |
| pets.has_pets | Has Pets | boolean | required | True or false. | No | personal | pets.has_pets | pets.planned | pets.has_pets | Has Pets | application_data.pets.has_pets | No | Yes | Assistance animals follow reasonable-accommodation process. |
| pets.details | Number and Type of Pets | textarea | conditional | Required if has_pets is true; no medical details. | No | personal | pets.details | pets.description | pets.details | Number and Type of Pets | application_data.pets.details | No | Yes | — |
| additional.notes | Additional Information | textarea | optional | Reject obvious identifier patterns; warn not to enter SSN/DOB/license or screening history. | No | personal | additional.notes | additional.notes | additional.notes | Additional Information | application_data.additional.notes | No | Yes | — |
| review.prepared_by | Prepared By (Not a Signature) | text | optional | Trim; reject control characters; enforce bounded length. | No | personal | review.prepared_by | review.prepared_by | review.prepared_by | Prepared By (Not a Signature) | application_data.review.prepared_by | No | Yes | — |
| review.date | Date Prepared | date | optional | Valid calendar date. | No | personal | review.date | review.date | review.date | Date Prepared | application_data.review.date | No | Yes | — |
| screening_questions[].question_id | Question ID | enum | review | Approved question ID from versioned catalogue. | Yes | internal | — | — | — | Question ID | application_screening.question_id | Yes | No | — |
| screening_questions[].answer | Answer | boolean | review | True or false only after question approval. | Yes | highly-sensitive | — | — | — | Answer | application_screening.answer | Yes | No | — |
| screening_questions[].explanation | Explanation | textarea | review | Required if approved question answer is yes. | Yes | highly-sensitive | — | — | — | Explanation | application_screening.explanation | Yes | No | — |
| consent.disclosure_version | Disclosure Version | identifier | review | Versioned approved disclosure ID. | No | internal | — | — | — | Disclosure Version | application_consents.disclosure_version | Yes | No | — |
| consent.accepted | I Acknowledge and Agree | boolean | review | Explicit true only after approved disclosure is shown. | No | highly-sensitive | — | — | — | I Acknowledge and Agree | application_consents.accepted | Yes | No | — |
| consent.accepted_at | Consent Timestamp | timestamp | review | Server timestamp only. | No | highly-sensitive | — | — | — | Consent Timestamp | application_consents.accepted_at | Yes | No | — |
| consent.ip_metadata | Submission Metadata | identifier | review | Server-collected; restricted retention. | No | highly-sensitive | — | — | — | Submission Metadata | application_consents.ip_metadata | Yes | No | — |
| consent.signature_name | Signature | text | review | Inactive until e-signature policy approved. | No | highly-sensitive | — | — | — | Signature | application_consents.signature_name | Yes | No | — |
| consent.signature_date | Signature Date | date | review | Inactive until e-signature policy approved. | No | highly-sensitive | — | — | — | Signature Date | application_consents.signature_date | Yes | No | — |
| documents[].document_id | Document ID | identifier | system | Server-controlled; allowlisted type, size, MIME, malware scan, private storage. | Yes | personal | — | — | — | Document ID | application_documents.document_id | No | No | Document-upload workflow inactive pending secure storage/access review. |
| documents[].document_type | Document Type | enum | system | Server-controlled; allowlisted type, size, MIME, malware scan, private storage. | Yes | personal | — | — | — | Document Type | application_documents.document_type | No | No | Document-upload workflow inactive pending secure storage/access review. |
| documents[].filename_original | Original Filename | text | system | Server-controlled; allowlisted type, size, MIME, malware scan, private storage. | Yes | personal | — | — | — | Original Filename | application_documents.filename_original | No | No | Document-upload workflow inactive pending secure storage/access review. |
| documents[].storage_key | Storage Key | identifier | system | Server-controlled; allowlisted type, size, MIME, malware scan, private storage. | Yes | highly-sensitive | — | — | — | Storage Key | application_documents.storage_key | No | No | Document-upload workflow inactive pending secure storage/access review. |
| documents[].mime_type | MIME Type | text | system | Server-controlled; allowlisted type, size, MIME, malware scan, private storage. | Yes | personal | — | — | — | MIME Type | application_documents.mime_type | No | No | Document-upload workflow inactive pending secure storage/access review. |
| documents[].uploaded_at | Uploaded At | timestamp | system | Server-controlled; allowlisted type, size, MIME, malware scan, private storage. | Yes | personal | — | — | — | Uploaded At | application_documents.uploaded_at | No | No | Document-upload workflow inactive pending secure storage/access review. |
| documents[].visibility | Visibility | enum | system | Server-controlled; allowlisted type, size, MIME, malware scan, private storage. | Yes | personal | — | — | — | Visibility | application_documents.visibility | No | No | Document-upload workflow inactive pending secure storage/access review. |
| documents[].scan_status | Scan Status | enum | system | Server-controlled; allowlisted type, size, MIME, malware scan, private storage. | Yes | personal | — | — | — | Scan Status | application_documents.scan_status | No | No | Document-upload workflow inactive pending secure storage/access review. |
| documents[].applicant_id | Applicant ID | identifier | system | Server-controlled; allowlisted type, size, MIME, malware scan, private storage. | Yes | personal | — | — | — | Applicant ID | application_documents.applicant_id | No | No | Document-upload workflow inactive pending secure storage/access review. |
| application_id | Application ID | identifier | system | Server-controlled; never accepted from public input. | No | internal | — | — | — | Application ID | applications.application_id | No | No | — |
| application_number | Application Number | identifier | system | Server-controlled; never accepted from public input. | No | internal | — | — | — | Application Number | applications.application_number | No | No | — |
| status | Status | enum | system | draft \| submitted \| under_review \| additional_information_requested \| approved \| declined \| withdrawn \| archived | No | internal | — | — | — | Status | applications.status | No | No | — |
| created_at | Created At | timestamp | system | Server-controlled; never accepted from public input. | No | internal | — | — | — | Created At | applications.created_at | No | No | — |
| submitted_at | Submitted At | timestamp | system | Server-controlled; never accepted from public input. | No | internal | — | — | — | Submitted At | applications.submitted_at | No | No | — |
| updated_at | Updated At | timestamp | system | Server-controlled; never accepted from public input. | No | internal | — | — | — | Updated At | applications.updated_at | No | No | — |
| applicant_user_id | Applicant User ID | identifier | system | Server-controlled; never accepted from public input. | No | internal | — | — | — | Applicant User ID | applications.applicant_user_id | No | No | — |
| source | Source | enum | system | web \| pdf \| admin | No | internal | — | — | — | Source | applications.source | No | No | — |
| assigned_to | Assigned To | identifier | system | Server-controlled; never accepted from public input. | No | internal | — | — | — | Assigned To | applications.assigned_to | No | No | — |
| review_notes | Review Notes | textarea | system | Server-controlled; never accepted from public input. | No | internal | — | — | — | Review Notes | applications.review_notes | No | No | Private Admin only. |

## Removed legacy fields — not collected

These keys are historical references only, with status `removed_from_current_application`. They must not be rendered, accepted by APIs, stored, or generated into new PDFs. The supplied modernized PDF already omits them. Occupant date of birth must not be reintroduced without a verified business and legal reason.

| Legacy key | Status | Historical PDF mapping |
|---|---|---|
| `applicant.ssn` | `removed_from_current_application` | `ssn` |
| `applicant.date_of_birth` | `removed_from_current_application` | `dob` |
| `applicant.drivers_license_number` | `removed_from_current_application` | `drivers_license` |
| `occupants[].date_of_birth` | `removed_from_current_application` | `occupants[].date_of_birth` |

## Document requirements — uploads disabled in preview

- `government_photo_id` — **Government-Issued Photo ID**; category: `identity`; required when secure uploads are enabled: **yes**; accepted examples: Driver’s License, State ID, Passport, Other valid government-issued photo identification; approved formats: `image/jpeg`, `image/png`, `application/pdf`; visibility: `private`; sensitivity: `highly-sensitive`. Admin list display after upload: **Government Photo ID — Uploaded**. Current status: **not enabled**.

No file input, upload endpoint, storage, public URL, or email attachment is enabled by this requirement. Use private object storage rather than D1 blobs; authorize each reviewer before opening a document. Do not log filenames or contents unnecessarily.

## Screening catalogue — all inactive

| ID | Legacy question | Legal review | Active |
|---|---|---|---|
| `landlord_tenant_court` | Have you ever been sued in Landlord/Tenant Court? | Yes | No |
| `civil_criminal_action` | Have you ever been a defendant in a civil/criminal action? | Yes | No |
| `eviction` | Have you ever been evicted? | Yes | No |
| `late_rent` | Have you ever failed to pay your rent timely? | Yes | No |
| `arrest_history` | Have you ever been arrested? | Yes | No |
| `bankruptcy` | Have you ever filed for bankruptcy? | Yes | No |
| `other_name` | Have you ever used another name? | Yes | No |

The reusable `screening_questions[]` structure stores `question_id`, `answer`, and `explanation` only if a question is separately approved. The bankruptcy explanation may need date/chapter; the other-name explanation may need prior name. No screening question is approved for production by this map. The original broad background/police-record authorization, arrest-history question, blanket screening language, rejection/waiver terms, and **$100 non-refundable fee** are historical references requiring legal/business review, not approved production copy. Exact original legal clauses were not supplied in the modernized PDF and must be preserved from the legacy source document if needed for legal review; do not reconstruct them from memory.

## Sensitive and access boundaries

Highly sensitive keys: `screening_questions[].answer`, `screening_questions[].explanation`, `consent.accepted`, `consent.accepted_at`, `consent.ip_metadata`, `consent.signature_name`, `consent.signature_date`, `documents[].storage_key`.

Other personal and financial fields are classified individually in the table; salary and rent are financial. Draft and submitted applications, PDFs, and documents require applicant isolation, staff least-privilege authorization, encrypted private storage where applicable, malware scanning for uploads, no raw sensitive values in logs/analytics/ordinary email, and masked Admin list views. Do not enable production storage of highly sensitive values, uploads, screening, or signatures until the security path and legal text are explicitly reviewed. The currently supplied PDF itself intentionally omits SSN, DOB, license, screening, fee, and binding-signature inputs.

## Workflow metadata

Statuses: `draft`, `submitted`, `under_review`, `additional_information_requested`, `approved`, `declined`, `withdrawn`, `archived`. Sources: `web`, `pdf`, `admin`. Suggested document types: `proof_of_income`, `identification`, `employment_document`, `landlord_reference`, `guarantor_document`, `other`. System fields must be server-controlled; `review_notes`, assignment, and internal status are private Admin data. `property_id` is defined once, in the property section, and stored as `applications.property_id`. The disclosure version is defined once at `consent.disclosure_version` rather than duplicated in metadata.

## Open decisions before enabling application workflows

1. Approve the legal disclosure text/version, screening question set, fee policy, and signature procedure. Nothing here treats the legacy wording as approved.
2. Approve restricted storage, encryption/key management, retention, staff roles, applicant isolation, document scanning, and email notification destination/format.
3. Resolve whether `rental_history[].landlord_address` means landlord mailing address or the rental-property address requested by the current PDF.
4. Decide whether to revise the current PDF to match target names and unbounded occupants/history, or maintain an explicitly lossy fallback. A field-by-field fill/save/reopen test is required after any revision.
5. Decide whether a guarantor is a separate application role and when relationship is required; confirm property/unit selection and availability rules.
