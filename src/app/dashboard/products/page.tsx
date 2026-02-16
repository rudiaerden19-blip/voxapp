// Redirect to /dashboard/producten for compatibility
import { redirect } from 'next/navigation';

export default function ProductsPage() {
  redirect('/dashboard/producten');
}
