import { redirect } from 'next/navigation';

export default function HomePage() {
  // Server-side redirect - flash yok!
  redirect('/register');
}
