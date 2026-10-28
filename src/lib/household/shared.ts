export const householdSubject = 'household-access-v1';
export type HouseholdRequest = { id: string; assignment_id: string; message: string; status: string; created_at: string; property_name?: string; unit_identifier?: string; requester?: string };
export function householdInput(v: Record<string, unknown>) {
  const name = typeof v.name === 'string' ? v.name.trim() : '';
  const email = typeof v.email === 'string' ? v.email.trim().toLowerCase() : '';
  const assignmentId = typeof v.assignmentId === 'string' ? v.assignmentId : '';
  if (!name || name.length > 100 || /[\u0000-\u001f]/.test(name)) throw Error('Enter a name of up to 100 characters.');
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]+$/.test(email) || email.length > 254) throw Error('Enter a valid email address.');
  if (!assignmentId || assignmentId.length > 100) throw Error('Choose your apartment.');
  if (v.confirm !== true) throw Error('Confirm you have permission to share these details.');
  return { name, email, assignmentId };
}
export function householdPerson(message: string): {name: string; email: string} {
  try { const v = JSON.parse(message); return {name: typeof v.name === 'string' ? v.name : 'Household member', email: typeof v.email === 'string' ? v.email : ''}; }
  catch { return { name: 'Household member', email: '' }; }
}
export const householdStatus: Record<string,string> = {submitted:'Awaiting review',approved:'Access approved',declined:'Not approved',cancelled:'Cancelled'};
