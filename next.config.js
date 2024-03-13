/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'",
  },
];

const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  env: {
    GO_HOST: process.env.GO_HOST,
    SIGNUP_POINT_ID: process.env.SIGNUP_POINT_ID,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
