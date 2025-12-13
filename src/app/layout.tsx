import { AppProviders } from '@core/providers/app-providers.component';
import { AuthProvider } from '@features/auth/providers';
import { DeviceProvider } from '@features/devices/providers';
import { ProfileProvider } from '@features/users/providers';
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
  description:
    'The simplest way to share and discover free stuff in your neighborhood. Reduce waste and strengthen communities.',
  icons: {
    icon: '/favicon.png'
  },
  openGraph: {
    title: 'Curby',
    description:
      'The simplest way to share and discover free stuff in your neighborhood. Reduce waste and strengthen communities.',
    images: [
      {
        url: '/curby_app_icon_dark.png',
        width: 1024,
        height: 1024,
        alt: 'Curby App Icon'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curby',
    description:
      'The simplest way to share and discover free stuff in your neighborhood. Reduce waste and strengthen communities.',
    images: ['/curby_app_icon_dark.png']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${robotoMono.variable} antialiased`}>
        <AppProviders>
          <AuthProvider>
            <ProfileProvider>
              <DeviceProvider>{children}</DeviceProvider>
            </ProfileProvider>
          </AuthProvider>
        </AppProviders>
      </body>
    </html>
  );
}
