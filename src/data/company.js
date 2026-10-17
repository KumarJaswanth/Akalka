/* Direct contact details.
   Empty until the client supplies them — and an empty field is simply not
   rendered anywhere (contact page, footer), so the site never shows a
   "to be confirmed" placeholder where a real detail will go. Fill in any of
   these and it appears everywhere it belongs:

     phone    "+91 00000 00000"
     email    "sales@example.com"
     address  "Works / office address"
     hours    "Mon–Sat, 9:00–18:00"
*/
export const CONTACT = {
  phone: '',
  email: '',
  address: '',
  hours: '',
};

export const hasChannels = Object.values(CONTACT).some(Boolean);

/* The Zoho "Akalka Product Enquiry Form" — the inbox behind every enquiry.
   The branded form posts to its htmlRecords endpoint; the contact page also
   links to the hosted form itself. */
export const ZOHO_FORM_URL =
  'https://forms.zohopublic.in/infoneoteric11/form/AkalkaProductEnquiryForm/formperma/OkxgSwiTqRc8e3zqTOwZwhHGK9vMuwYBULXjush9PX0';

/* tel: links want digits and a leading + only. */
export const telHref = (p) => `tel:${p.replace(/[^\d+]/g, '')}`;
