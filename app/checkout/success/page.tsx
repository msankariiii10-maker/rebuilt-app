import { redirect } from 'next/navigation';

// The success page was removed — after paying, people go straight into the
// program. Stripe now sends them to /program directly; this redirect only
// exists so any old link to /checkout/success still lands in the right place.
// Always run on the server so this is a real HTTP redirect, not a static page.
export const dynamic = 'force-dynamic';

export default function CheckoutSuccessPage() {
  redirect('/program');
}
