// Current public website contact details. Update this file if the client changes them.
export const siteContact = {
  email: 'Admin@TeamsManagement.com',
  phone: '212-861-0303',
  fax: '212-861-1118',
  address: {
    street: '1374 1st Avenue',
    city: 'New York',
    state: 'NY',
    postalCode: '10021',
  },
} as const;

export const contactAddress = `${siteContact.address.street}, ${siteContact.address.city}, ${siteContact.address.state} ${siteContact.address.postalCode}`;
export const contactPhoneHref = `tel:+1${siteContact.phone.replace(/\D/g, '')}`;
export const contactEmailHref = `mailto:${siteContact.email}`;
