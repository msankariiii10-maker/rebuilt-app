import { redirect } from 'next/navigation';

// Accounts are now created automatically when someone pays (see /create-password).
// This redirect only exists so any old "sign up" link still lands somewhere useful.
export default function SignupPage() {
  redirect('/checkout');
}
