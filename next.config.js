/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/member', destination: '/member.html' }]
  },
}
module.exports = nextConfig
