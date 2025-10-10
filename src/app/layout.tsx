import { AppProviders } from '@core/providers/app-providers.component';
import type { Metadata } from 'next';
import { Poppins, Roboto_Mono } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

const robotoMono = Roboto_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700']
});

export const metadata: Metadata = {
  title: 'Curby',
  description: 'Curby',
  icons: {
    icon: '/favicon.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${robotoMono.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
