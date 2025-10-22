import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Curby Admin',
  description: 'Curby Admin'
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
