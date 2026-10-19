import { redirect } from 'next/navigation';

// After paying, Stripe sends people to /create-password. This redirect only
// exists so any old link to /checkout/success still lands somewhere sensible.
// Always run on the server so this is a real HTTP redirect, not a static page.
export const dynamic = 'force-dynamic';

export default function CheckoutSuccessPage() {
  redirect('/login');
}
