/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upthcaewktgrqjieqiya.supabase.co",
        port: "",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
