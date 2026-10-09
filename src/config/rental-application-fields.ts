/** Canonical rental-application field registry. No applicant collection is enabled by this file. */
export type FieldType = 'text' | 'textarea' | 'email' | 'phone' | 'date' | 'month' | 'currency' | 'number' | 'boolean' | 'reference' | 'timestamp' | 'identifier' | 'enum' | 'file-metadata';
export type Sensitivity = 'public' | 'personal' | 'financial' | 'highly-sensitive' | 'internal';
export type Requirement = 'required' | 'optional' | 'conditional' | 'review' | 'system';
export type Field = {
  key: string; label: string; type: FieldType; required: Requirement;
  validation: string; repeatable: boolean; sensitivity: Sensitivity;
  /** Target semantic AcroForm name; null means no PDF field is planned. */
  pdfField: string | null;
  /** Name in the currently supplied 53-field PDF; null means absent. */
  currentPdfField: string | null;
  onlineField: string | null; adminDisplay: string; storage: string;
  legalReview: boolean; active: boolean; notes?: string;
};
type Input = Pick<Field, 'key' | 'label' | 'type' | 'required' | 'sensitivity'> & Partial<Omit<Field, 'key' | 'label' | 'type' | 'required' | 'sensitivity'>>;
const field = (input: Input): Field => ({
  validation: 'Trim; reject control characters; enforce bounded length.', repeatable: false,
  pdfField: null, currentPdfField: null, onlineField: input.key,
  adminDisplay: input.label, storage: `application_data.${input.key}`,
  legalReview: false, active: true, ...input,
});
const f = (key: string, label: string, type: FieldType, required: Requirement, sensitivity: Sensitivity, extra: Partial<Field> = {}) => field({ key, label, type, required, sensitivity, ...extra });
const deferred = { active: false, legalReview: true, onlineField: null };
const personal = 'personal' as const;
const financial = 'financial' as const;
const normal = 'public' as const;

export const rentalApplicationFields: readonly Field[] = [
  // Property / application
  f('property_id','Property','reference','required',normal,{validation:'Existing published Teams D1 building ID; server resolves address.',pdfField:'property_id',storage:'applications.property_id'}),
  f('building_address','Building','text','required',normal,{validation:'Server-derived from property_id; read-only online.',pdfField:'building',currentPdfField:'property.building',onlineField:null}),
  f('unit_number','Apt #','text','optional',normal,{pdfField:'apt_number',currentPdfField:'property.unit'}),
  f('bedroom_count','# of Bedrooms','number','optional',normal,{validation:'Integer from 0 to 20.',pdfField:'bedrooms',currentPdfField:'property.bedrooms'}),
  f('monthly_rent','Monthly Rent','currency','optional',financial,{validation:'Nonnegative USD amount; two decimal places.',pdfField:'monthly_rent',currentPdfField:'property.rent'}),
  f('requested_move_in','Requested Move-in','date','optional',personal,{validation:'Valid calendar date.',pdfField:'requested_move_in',currentPdfField:'property.move_in'}),
  // Applicant
  f('applicant.first_name','First Name','text','required',personal,{pdfField:'applicant_first_name',currentPdfField:'applicant.first_name'}),
  f('applicant.last_name','Last Name','text','required',personal,{pdfField:'applicant_last_name',currentPdfField:'applicant.last_name'}),
  f('applicant.street_address','Current Street Address','text','required',personal,{pdfField:'current_street_address',currentPdfField:'applicant.street'}),
  f('applicant.apartment_number','Current Apt #','text','optional',personal,{pdfField:'current_apt_number',currentPdfField:'applicant.unit'}),
  f('applicant.city','City','text','required',personal,{pdfField:'current_city',currentPdfField:'applicant.city'}),
  f('applicant.state','State','text','required',personal,{validation:'Two-letter US state or approved territory.',pdfField:'current_state',currentPdfField:'applicant.state'}),
  f('applicant.zip','ZIP','text','required',personal,{validation:'US ZIP or ZIP+4.',pdfField:'current_zip',currentPdfField:'applicant.zip'}),
  f('applicant.email','Email Address','email','required',personal,{validation:'Valid email address; max 254 characters.',pdfField:'email',currentPdfField:'applicant.email'}),
  f('applicant.home_phone','Home Phone','phone','optional',personal,{validation:'Valid phone number.',pdfField:'home_phone',currentPdfField:'applicant.home_phone'}),
  f('applicant.cell_phone','Cell Phone','phone','required',personal,{validation:'Valid phone number.',pdfField:'cell_phone',currentPdfField:'applicant.mobile'}),
  f('applicant.work_phone','Work Phone','phone','optional',personal,{validation:'Valid phone number.',pdfField:'work_phone',currentPdfField:'applicant.work_phone'}),
  f('applicant.uses_guarantor','Will you be using a guarantor?','boolean','required',personal,{validation:'Select yes or no.',pdfField:'uses_guarantor'}),
  f('applicant.guarantor_relationship','Guarantor Relationship','text','conditional',personal,{validation:'Required when uses_guarantor is yes.',pdfField:'guarantor_relationship',currentPdfField:'applicant.guarantor_relationship'}),
  // Repeatable collections: [] means each item, never a fixed three-row cap online.
  f('occupants[].name','Occupant Name','text','conditional',personal,{repeatable:true,validation:'Required for each added occupant.',pdfField:'occupants[].name',currentPdfField:'occupants.{1..3}.name'}),
  f('occupants[].relationship','Relationship','text','optional',personal,{repeatable:true,pdfField:'occupants[].relationship',currentPdfField:'occupants.{1..3}.relationship'}),
  f('rental_history[].landlord_name','Landlord','text','optional',personal,{repeatable:true,pdfField:'rental_history[].landlord_name',currentPdfField:'rental.landlord'}),
  f('rental_history[].landlord_address','Rental Property Address','text','optional',personal,{repeatable:true,pdfField:'rental_history[].landlord_address',currentPdfField:'rental.address',notes:'Current PDF requests rental property address, not landlord mailing address; confirm business meaning.'}),
  f('rental_history[].landlord_phone','Landlord Contact Phone','phone','optional',personal,{repeatable:true,validation:'Valid phone number.',pdfField:'rental_history[].landlord_phone',currentPdfField:'rental.phone'}),
  f('rental_history[].residency_from','Resident From','month','optional',personal,{repeatable:true,validation:'Valid YYYY-MM; before residency_to.',pdfField:'rental_history[].residency_from',currentPdfField:'rental.from'}),
  f('rental_history[].residency_to','Resident To','month','optional',personal,{repeatable:true,validation:'Valid YYYY-MM; after residency_from.',pdfField:'rental_history[].residency_to',currentPdfField:'rental.to'}),
  f('rental_history[].monthly_rent','Monthly Rent','currency','optional',financial,{repeatable:true,validation:'Nonnegative USD amount.',pdfField:'rental_history[].monthly_rent',currentPdfField:'rental.monthly_rent'}),
  f('rental_history[].reason_for_leaving','Reason for Leaving','textarea','optional',personal,{repeatable:true,pdfField:'rental_history[].reason_for_leaving',currentPdfField:'rental.reason_leaving'}),
  ...(['current','previous'] as const).flatMap((period) => {
    const prefix = `employment_${period}`;
    const old = `employment.${period}`;
    const previous = period === 'previous';
    const items: Field[] = [
      ...(previous ? [] : [f(`${prefix}.currently_employed`,'Currently Employed','boolean','required',personal,{validation:'True or false.',pdfField:`${prefix}.currently_employed`,currentPdfField:`${old}.employed`})]),
      f(`${prefix}.company_name`,'Company','text','conditional',personal,{validation:previous?'Optional history.':'Required if currently employed.',pdfField:`${prefix}.company_name`,currentPdfField:`${old}.company`}),
      f(`${prefix}.street_address`,'Employer Street Address','text','optional',personal,{pdfField:`${prefix}.street_address`,currentPdfField:`${old}.address`,notes:'Current PDF stores full employer address in one field.'}),
      ...(['city','state','zip'] as const).map(part=>f(`${prefix}.${part}`,part.toUpperCase(),'text','optional',personal,{pdfField:`${prefix}.${part}`,notes:'Current PDF combines employer address into one field.'})),
      f(`${prefix}.occupation`,'Occupation','text','optional',personal,{pdfField:`${prefix}.occupation`,currentPdfField:`${old}.occupation`}),
      f(`${prefix}.responsibilities`,'Responsibilities','textarea','optional',personal,{pdfField:`${prefix}.responsibilities`,currentPdfField:`${old}.responsibilities`}),
      f(`${prefix}.supervisor_name`,'Supervisor’s Name','text','optional',personal,{pdfField:`${prefix}.supervisor_name`,currentPdfField:`${old}.supervisor`}),
      f(`${prefix}.employer_phone`,'Employer Phone','phone','optional',personal,{validation:'Valid phone number.',pdfField:`${prefix}.employer_phone`,currentPdfField:`${old}.phone`}),
      f(`${prefix}.gross_annual_salary`,'Gross Annual Salary','currency','optional',financial,{validation:'Nonnegative USD amount.',pdfField:`${prefix}.gross_annual_salary`,currentPdfField:`${old}.salary`}),
      f(`${prefix}.employed_since`,'Employed Since','month','optional',personal,{validation:'Valid YYYY-MM.',pdfField:`${prefix}.employed_since`,currentPdfField:`${old}.since`}),
      ...(previous ? [f(`${prefix}.employed_until`,'Employed Until','month','optional',personal,{validation:'Valid YYYY-MM; after employed_since.',pdfField:`${prefix}.employed_until`,currentPdfField:`${old}.to`,notes:'Present in supplied PDF; added explicitly to canonical schema.'})] : []),
    ];
    return items;
  }),
  f('income.other_source_to_verify','Do you have another income source for Teams to verify?','boolean','required',financial,{validation:'Select yes or no.',pdfField:'other_income_to_verify'}),
  f('pets.has_pets','Has Pets','boolean','required',personal,{validation:'True or false.',pdfField:'pets.has_pets',currentPdfField:'pets.planned',notes:'Assistance animals follow reasonable-accommodation process.'}),
  f('pets.details','Number and Type of Pets','textarea','conditional',personal,{validation:'Required if has_pets is true; no medical details.',pdfField:'pets.details',currentPdfField:'pets.description'}),
  f('additional.notes','Additional Information','textarea','optional',personal,{validation:'Reject obvious identifier patterns; warn not to enter SSN/DOB/license or screening history.',pdfField:'additional.notes',currentPdfField:'additional.notes'}),
  f('review.prepared_by','Prepared By (Not a Signature)','text','optional',personal,{pdfField:'review.prepared_by',currentPdfField:'review.prepared_by'}),
  f('review.date','Date Prepared','date','optional',personal,{validation:'Valid calendar date.',pdfField:'review.date',currentPdfField:'review.date'}),
  // Legacy screening is catalogued but disabled pending legal/business approval.
  f('screening_questions[].question_id','Question ID','enum','review','internal',{...deferred,repeatable:true,validation:'Approved question ID from versioned catalogue.',storage:'application_screening.question_id'}),
  f('screening_questions[].answer','Answer','boolean','review','highly-sensitive',{...deferred,repeatable:true,validation:'True or false only after question approval.',storage:'application_screening.answer'}),
  f('screening_questions[].explanation','Explanation','textarea','review','highly-sensitive',{...deferred,repeatable:true,validation:'Required if approved question answer is yes.',storage:'application_screening.explanation'}),
  f('consent.disclosure_version','Disclosure Version','identifier','review','internal',{...deferred,validation:'Versioned approved disclosure ID.',storage:'application_consents.disclosure_version'}),
  f('consent.accepted','I Acknowledge and Agree','boolean','review','highly-sensitive',{...deferred,validation:'Explicit true only after approved disclosure is shown.',storage:'application_consents.accepted'}),
  f('consent.accepted_at','Consent Timestamp','timestamp','review','highly-sensitive',{...deferred,onlineField:null,validation:'Server timestamp only.',storage:'application_consents.accepted_at'}),
  f('consent.ip_metadata','Submission Metadata','identifier','review','highly-sensitive',{...deferred,onlineField:null,validation:'Server-collected; restricted retention.',storage:'application_consents.ip_metadata'}),
  f('consent.signature_name','Signature','text','review','highly-sensitive',{...deferred,validation:'Inactive until e-signature policy approved.',storage:'application_consents.signature_name'}),
  f('consent.signature_date','Signature Date','date','review','highly-sensitive',{...deferred,validation:'Inactive until e-signature policy approved.',storage:'application_consents.signature_date'}),
  ...([
    ['document_id','Document ID','identifier'],['document_type','Document Type','enum'],['filename_original','Original Filename','text'],
    ['storage_key','Storage Key','identifier'],['mime_type','MIME Type','text'],['uploaded_at','Uploaded At','timestamp'],
    ['visibility','Visibility','enum'],['scan_status','Scan Status','enum'],['applicant_id','Applicant ID','identifier'],
  ] as const).map(([key,label,type])=>f(`documents[].${key}`,label,type,'system',key==='storage_key'?'highly-sensitive':'personal',{active:false,repeatable:true,onlineField:null,validation:'Server-controlled; allowlisted type, size, MIME, malware scan, private storage.',storage:`application_documents.${key}`,notes:'Document-upload workflow inactive pending secure storage/access review.'})),
  ...([
    ['application_id','Application ID','identifier'],['application_number','Application Number','identifier'],['status','Status','enum'],
    ['created_at','Created At','timestamp'],['submitted_at','Submitted At','timestamp'],['updated_at','Updated At','timestamp'],
    ['applicant_user_id','Applicant User ID','identifier'],['source','Source','enum'],['assigned_to','Assigned To','identifier'],
    ['review_notes','Review Notes','textarea'],
  ] as const).map(([key,label,type])=>f(key,label,type,'system','internal',{active:false,onlineField:null,validation:key==='status'?'draft | submitted | under_review | additional_information_requested | approved | declined | withdrawn | archived':key==='source'?'web | pdf | admin':'Server-controlled; never accepted from public input.',storage:`applications.${key}`,notes:key==='review_notes'?'Private Admin only.':undefined})),
];

export const screeningQuestionCatalogue = [
  {id:'landlord_tenant_court',label:'Have you ever been sued in Landlord/Tenant Court?',legalReview:true,active:false},
  {id:'civil_criminal_action',label:'Have you ever been a defendant in a civil/criminal action?',legalReview:true,active:false},
  {id:'eviction',label:'Have you ever been evicted?',legalReview:true,active:false},
  {id:'late_rent',label:'Have you ever failed to pay your rent timely?',legalReview:true,active:false},
  {id:'arrest_history',label:'Have you ever been arrested?',legalReview:true,active:false},
  {id:'bankruptcy',label:'Have you ever filed for bankruptcy?',legalReview:true,active:false},
  {id:'other_name',label:'Have you ever used another name?',legalReview:true,active:false},
] as const;
export const documentTypes = ['government_photo_id','proof_of_income','guarantor_documents','additional_supporting_document'] as const;
/** Historical keys only: never project into web, PDF, Admin, validation, or storage. */
export const removedRentalApplicationFields = [
  {key:'applicant.ssn',status:'removed_from_current_application',legacyPdfField:'ssn'},
  {key:'applicant.date_of_birth',status:'removed_from_current_application',legacyPdfField:'dob'},
  {key:'applicant.drivers_license_number',status:'removed_from_current_application',legacyPdfField:'drivers_license'},
  {key:'occupants[].date_of_birth',status:'removed_from_current_application',legacyPdfField:'occupants[].date_of_birth'},
] as const;
/** Shared document contract for future web, Admin, PDF record, validation, and storage projections.
 * Requirement only: no upload controls or storage are enabled by this registry. */
export const rentalDocumentRequirements = [
  {key:'government_photo_id',label:'Government-Issued Photo ID',requirement:'required',multiple:false,category:'identity',
    acceptedExamples:['Driver’s License','State ID','Passport','Other valid government-issued photo identification'],
    adminLabel:'Government Photo ID',adminStates:['Uploaded','Missing'],
    visibility:'private',sensitivity:'highly_sensitive',active:false},
  {key:'proof_of_income',label:'Proof of Income',requirement:'when_applicable',multiple:true,category:'income',
    acceptedExamples:['Recent pay stubs','Employment verification letter','Other verifiable income documentation'],
    adminLabel:'Proof of Income',adminStates:['Uploaded','Missing'],
    visibility:'private',sensitivity:'financial_private',active:false},
  {key:'guarantor_documents',label:'Guarantor Documents',requirement:'if_guarantor',multiple:true,category:'guarantor',
    acceptedExamples:[],adminLabel:'Guarantor Documents',adminStates:['Uploaded','Not Required','Missing'],
    visibility:'private',sensitivity:'financial_private',active:false},
  {key:'additional_supporting_document',label:'Additional Supporting Document',requirement:'optional',multiple:false,category:'supporting',
    acceptedExamples:[],adminLabel:'Additional Document',adminStates:['Uploaded','None'],
    visibility:'private',sensitivity:'financial_private',active:false},
] as const;
export const rentalDocumentAcceptedFormats = ['application/pdf','image/jpeg','image/png'] as const;
/** Shared applicability rules for future form, Admin, PDF, and validation projections. */
export const rentalDocumentApplicability = (answers: Record<string,string>) => ({
  government_photo_id: true,
  proof_of_income: answers['employment_current.currently_employed']==='yes' || answers['income.other_source_to_verify']==='yes',
  guarantor_documents: answers['applicant.uses_guarantor']==='yes',
  additional_supporting_document: false,
});
export const applicationStatuses = ['draft','submitted','under_review','additional_information_requested','approved','declined','withdrawn','archived'] as const;
