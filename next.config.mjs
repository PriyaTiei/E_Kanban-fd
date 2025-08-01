/** @type {import('next').NextConfig} */
const nextConfig = {
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
