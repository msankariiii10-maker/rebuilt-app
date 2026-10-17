/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      // Checked BEFORE the old pages, so the new member experience wins.
      // To undo the swap, delete the "beforeFiles" list below.
      beforeFiles: [
        { source: '/program', destination: '/member.html' },
        { source: '/program/week', destination: '/member.html' },
        { source: '/program/day/:slug*', destination: '/member.html' },
      ],
      afterFiles: [{ source: '/member', destination: '/member.html' }],
      fallback: [],
    }
  },
}
module.exports = nextConfig
