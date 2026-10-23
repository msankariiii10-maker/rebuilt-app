// The one account that may open /admin and bypass the paywall (so you can test the member area).
// Change it any time by setting OWNER_EMAIL in Vercel.
export const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'mskrebuilt@gmail.com').trim().toLowerCase();
export const isOwner = (email?: string | null) => !!email && email.trim().toLowerCase() === OWNER_EMAIL;
