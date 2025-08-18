import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
        port: '',
        pathname: '/i/teamlogos/nfl/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.imagn.com',
        port: '',
        pathname: '/api/download/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/wikipedia/**',
      },
      {
        protocol: 'http',
        hostname: 'cdn.imagn.com',
        port: '',
        pathname: '/api/download/**',
      },
      {
        protocol: 'https',
        hostname: 'www.usatoday.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'headshots.usatoday.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3-us-west-2.amazonaws.com',
        port: '',
        pathname: '/static.fantasydata.com/**',
      },
      {
        protocol: 'https',
        hostname: 'static.fantasydata.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'cdn.usatsimg.com',
        port: '',
        pathname: '/api/download/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.usatsimg.com',
        port: '',
        pathname: '/api/download/**',
      },
    ],
  },
};

export default nextConfig;
