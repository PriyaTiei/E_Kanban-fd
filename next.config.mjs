/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  distDir: isDev ? '.next_dev' : '.next',
  async headers() {
    return [
      {
        source: "/:path*", // apply to all routes
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  devIndicators: false,
  allowedDevOrigins: [
    "10.82.126.73:3058",
    "10.82.126.73:3059",
    '10.82.126.73:3060',
    '10.82.126.73:3061',
    "localhost:3058",
    "localhost:3059",
    'localhost:3060',
    'localhost:3061',
    'local-origin.dev', 
    '*.local-origin.dev',
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
