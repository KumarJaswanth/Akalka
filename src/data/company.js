/* Direct contact details, shown on the contact page, beside the Home page
   form and in the footer. An empty field is simply not rendered anywhere, so
   the site never shows a "to be confirmed" placeholder.

     phone     the mobile number people call
     whatsapp  the number people message on WhatsApp
     email     the enquiries inbox
     address   the place shown to visitors (a town is enough)
     street    a street address, only if one is ever added — it is the one
               field the structured data treats as a street
     hours     opening hours, if wanted
*/
export const CONTACT = {
  phone: '+91 99593 94321',
  whatsapp: '+91 76759 55234',
  email: 'info@akalka.in',
  address: 'Visakhapatnam, Andhra Pradesh, India',
  street: '',
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

/* wa.me wants the number as digits only, country code first. */
export const waHref = (p) => `https://wa.me/${p.replace(/\D/g, "")}`;
