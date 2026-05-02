import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Force all routes dynamic -- no static generation
  // Required since API routes use lazy DB/Stripe clients
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  async redirects() {
    return [
      // Milestone 7.1: Pre-Launch SEO Preservation
      // { source: '/old-estate-planning-page', destination: '/qualify', permanent: true },
      // { source: '/contact-us', destination: '/qualify', permanent: true },
    ]
  },
}

export default nextConfig

