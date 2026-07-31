/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // YouTube poster frames, used by the lesson player in Phase 3.
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
