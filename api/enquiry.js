/* Enquiry relay: website form -> Zoho Forms "Akalka Product Enquiry Form".

   A browser on akalka.in cannot call Zoho directly (Zoho sends no CORS
   headers, so the page could never read the answer). This function makes
   the same two calls Zoho's own hosted form makes, from the server, and
   answers { ok: true } only when Zoho has recorded the enquiry.

     1. POST <upload server>     raw file   -> { filepath: "<zoho path>" }
     2. POST <form>/records      JSON       -> { thankyou_page_URL, ... } on success
                                               { errors: [{ field: message }] } on rejection

   No secrets are involved: the form's public permalink is all Zoho asks for.
   Runs as a Vercel function (/api/enquiry) and, in `npm run dev`, through
   the middleware in vite.config.js. */

import { Readable } from 'node:stream';

export const config = { api: { bodyParser: false } };

const FORM =
  'https://forms.zohopublic.in/infoneoteric11/form/AkalkaProductEnquiryForm/formperma/OkxgSwiTqRc8e3zqTOwZwhHGK9vMuwYBULXjush9PX0';

/* Zoho's file server and form id, as the hosted page uses them. */
const UPLOAD_URL = 'https://in2-files.zohopublic.in/forms/v2/stream/publicupload';
const FORM_ID = '275789000000010005';

/* Zoho's own limits for this form. */
const PRODUCTS = ['Doors', 'Cleanroom Panels', 'Fire-Rated Doors', 'Emergency Exit Doors', 'Other'];
const MAX = { name: 255, org: 255, msg: 65535, phoneDigits: 15 };
/* Vercel rejects request bodies over 4.5 MB before this code runs; stay
   under it, leaving room for the form text. */
const MAX_FILE_BYTES = 4 * 1024 * 1024;

/* Zoho answers a bare server request with the same "accepted" reply as a
   real one but files nothing (verified: entries posted without these never
   reached the inbox). So the relay behaves like Zoho's own page: it opens
   the form first to get its session cookies, then sends them back with the
   Origin / Referer / X-Requested-With the page itself sends. */
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function openZohoSession() {
  const res = await fetch(FORM, { headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html' } });
  const cookies = (res.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
  return {
    'User-Agent': BROWSER_UA,
    Origin: 'https://forms.zohopublic.in',
    Referer: FORM,
    'X-Requested-With': 'XMLHttpRequest',
    ...(cookies ? { Cookie: cookies } : {}),
  };
}

const send = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const text = (fd, k) => {
  const v = fd.get(k);
  return typeof v === 'string' ? v.trim() : '';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  let fd;
  try {
    fd = await new Request('http://relay.local/', {
      method: 'POST',
      headers: { 'content-type': req.headers['content-type'] || '' },
      body: Readable.toWeb(req),
      duplex: 'half',
    }).formData();
  } catch {
    return send(res, 400, { ok: false, error: 'We could not read the enquiry. Please try again.' });
  }

  const name = text(fd, 'SingleLine');
  const org = text(fd, 'SingleLine1');
  const phone = text(fd, 'PhoneNumber');
  const product = text(fd, 'Dropdown');
  const msg = text(fd, 'MultiLine');
  const file = fd.get('FileUpload');
  const hasFile = file && typeof file === 'object' && file.size > 0;

  /* Mirror Zoho's validation so a bad value is explained here instead of
     surfacing as a vague refusal from Zoho. */
  if (name.length > MAX.name || org.length > MAX.org || msg.length > MAX.msg)
    return send(res, 422, { ok: false, error: 'One of the fields is too long.' });
  if (phone && (!/^[\d+\-.() ]+$/.test(phone) || phone.replace(/\D/g, '').length > MAX.phoneDigits))
    return send(res, 422, { ok: false, error: 'Please check the phone number.' });
  if (product && !PRODUCTS.includes(product))
    return send(res, 422, { ok: false, error: 'Please choose a product from the list.' });
  if (hasFile && file.size > MAX_FILE_BYTES)
    return send(res, 413, { ok: false, error: 'That file is over 4 MB. Please zip or compress it.' });
  if (!name && !org && !phone && !product && !msg && !hasFile)
    return send(res, 422, { ok: false, error: 'Please fill in at least one field.' });

  try {
    const record = { SingleLine: name, SingleLine1: org, PhoneNumber: phone.replace(/\s+/g, ''), Dropdown: product, MultiLine: msg };
    const session = await openZohoSession();
    record['FileUpload-v2'] = []; /* the hosted page always sends this key */

    if (hasFile) {
      /* Zoho's page streams the raw file to its upload server, then files
         the returned path under <field>-v2. */
      const { Cookie: _forms, ...uploadSession } = session; /* forms cookies belong to forms.zohopublic.in only */
      const upRes = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: Buffer.from(await file.arrayBuffer()),
        headers: {
          ...uploadSession,
          'Content-Type': file.type || 'application/octet-stream',
          'x-service': 'forms',
          'x-streammode': '1',
          'upload-id': `infoneoteric11_${FORM_ID}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
          'x-portalname': 'infoneoteric11',
          'x-formlinkname': 'AkalkaProductEnquiryForm',
          'x-fieldlinkname': 'FileUpload',
          'x-filename': encodeURIComponent(file.name || 'drawing'),
          'x-assured-response': 'true',
          'x-live_form_upload': 'true',
          'x-fclient-version': '2',
        },
      });
      const upJson = await upRes.json().catch(() => ({}));
      if (!upRes.ok || typeof upJson.filepath !== 'string') {
        console.error('Zoho upload refused', upRes.status, upJson);
        return send(res, 502, { ok: false, error: 'The drawing could not be uploaded. Please try again, or send the enquiry without it.' });
      }
      record['FileUpload-v2'] = [upJson.filepath];
    }

    const recRes = await fetch(`${FORM}/records`, {
      method: 'POST',
      headers: { ...session, 'Content-Type': 'application/json', Accept: 'application/zoho.forms-v1+json' },
      body: JSON.stringify(record),
    });
    const recJson = await recRes.json().catch(() => ({}));
    if (recRes.ok && recJson.thankyou_page_URL) return send(res, 200, { ok: true });

    console.error('Zoho record refused', recRes.status, recJson);
    return send(res, 502, { ok: false, error: 'Zoho did not accept the enquiry. Please try again in a moment.' });
  } catch (err) {
    console.error('Zoho unreachable', err);
    return send(res, 502, { ok: false, error: 'We could not reach our enquiry inbox. Please try again in a moment.' });
  }
}
