const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/config/rental-application-fields.ts'), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
vm.runInNewContext(js, { module: mod, exports: mod.exports });
const { rentalApplicationFields: fields, screeningQuestionCatalogue: questions, applicationStatuses, documentTypes } = mod.exports;
const esc = value => String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
const code = value => '`' + value + '`';
const rows = fields.map(x => `| ${[x.key,x.label,x.type,x.required,x.validation,x.repeatable?'Yes':'No',x.sensitivity,x.pdfField,x.currentPdfField,x.onlineField,x.adminDisplay,x.storage,x.legalReview?'Yes':'No',x.active?'Yes':'No',x.notes].map(esc).join(' | ')} |`).join('\n');
const high = fields.filter(x=>x.sensitivity==='highly-sensitive').map(x=>code(x.key)).join(', ');
const doc = `# Teams Management rental application — canonical field map

> Generated from [the machine-readable registry](../src/config/rental-application-fields.ts) by \`node scripts/generate-rental-field-map.cjs\`. Edit the registry, then regenerate this document. No application collection, upload, screening, consent, or signature workflow is enabled by these definitions.

## Scope and counts

- **${fields.length} unique canonical fields** across applicant-entered, deferred, document-metadata, and system-managed fields.
- **53 existing AcroForm fields** in the supplied 4-page PDF. The registry maps all 53: 49 direct or grouped mappings, with the two occupant row patterns covering three PDF rows each.
- **${fields.filter(x=>x.pdfField).length} target semantic PDF mappings**. A target name is a specification, not proof that the supplied PDF already uses it.
- **${fields.filter(x=>x.sensitivity==='highly-sensitive').length} highly sensitive fields** and **${fields.filter(x=>x.legalReview).length} legal-review fields**. Screening question definitions below are additional catalogue items, not seven separate applicant field keys.

## Contract

\`key\` is the stable canonical key. \`[]\` denotes a repeatable collection; never store the literal brackets as an instance ID. \`onlineField\`, \`adminDisplay\`, \`storage\`, and target \`pdfField\` are projections of the same registry, not independent schemas. \`currentPdfField\` records the exact current AcroForm name or a clearly marked row pattern. Null means the field is not in the supplied PDF. All new PDF fields must receive semantic names and be tested against an actual fill/save/reopen cycle before a revised PDF is published.

\`building_address\` must be resolved from a valid Teams D1 \`property_id\`, not accepted as a trusted free-text property reference. Requested move-in, landlord phone, and prepared-by/date remain mapped because they exist in the modernized PDF even though the supplied proposed table did not list them. Previous employment \`employed_until\` is explicitly included because the modernized PDF has it. The current PDF has one rental-history row and three occupant rows; the online model is repeatable. Current employer addresses are one PDF field each, so their city/state/ZIP components cannot round-trip separately through this PDF without a revised form.

## Field registry

| Key | Display label | Type | Required | Validation | Repeatable | Sensitivity | Target PDF field | Current PDF field | Online field | Admin display | Storage destination | Legal review | Active | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${rows}

## Screening catalogue — all inactive

| ID | Legacy question | Legal review | Active |
|---|---|---|---|
${questions.map(q=>`| \`${q.id}\` | ${esc(q.label)} | Yes | No |`).join('\n')}

The reusable \`screening_questions[]\` structure stores \`question_id\`, \`answer\`, and \`explanation\` only if a question is separately approved. The bankruptcy explanation may need date/chapter; the other-name explanation may need prior name. No screening question is approved for production by this map. The original broad background/police-record authorization, arrest-history question, blanket screening language, rejection/waiver terms, and **$100 non-refundable fee** are historical references requiring legal/business review, not approved production copy. Exact original legal clauses were not supplied in the modernized PDF and must be preserved from the legacy source document if needed for legal review; do not reconstruct them from memory.

## Sensitive and access boundaries

Highly sensitive keys: ${high}.

Other personal and financial fields are classified individually in the table; salary and rent are financial. Draft and submitted applications, PDFs, and documents require applicant isolation, staff least-privilege authorization, encrypted private storage where applicable, malware scanning for uploads, no raw sensitive values in logs/analytics/ordinary email, and masked Admin list views. Do not enable production storage of highly sensitive values, uploads, screening, or signatures until the security path and legal text are explicitly reviewed. The currently supplied PDF itself intentionally omits SSN, DOB, license, screening, fee, and binding-signature inputs.

## Workflow metadata

Statuses: ${applicationStatuses.map(code).join(', ')}. Sources: \`web\`, \`pdf\`, \`admin\`. Suggested document types: ${documentTypes.map(code).join(', ')}. System fields must be server-controlled; \`review_notes\`, assignment, and internal status are private Admin data. \`property_id\` is defined once, in the property section, and stored as \`applications.property_id\`. The disclosure version is defined once at \`consent.disclosure_version\` rather than duplicated in metadata.

## Open decisions before enabling application workflows

1. Approve the legal disclosure text/version, screening question set, fee policy, and signature procedure. Nothing here treats the legacy wording as approved.
2. Approve restricted storage, encryption/key management, retention, staff roles, applicant isolation, document scanning, and email notification destination/format.
3. Resolve whether \`rental_history[].landlord_address\` means landlord mailing address or the rental-property address requested by the current PDF.
4. Decide whether to revise the current PDF to match target names and unbounded occupants/history, or maintain an explicitly lossy fallback. A field-by-field fill/save/reopen test is required after any revision.
5. Decide whether a guarantor is a separate application role and when relationship is required; confirm property/unit selection and availability rules.
`;
fs.writeFileSync(path.join(root,'docs/rental-application-field-map.md'), doc);
