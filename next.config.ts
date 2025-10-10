import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hbaiapsdvjjuxlgbogtz.supabase.co',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  }
};

export default nextConfig;
