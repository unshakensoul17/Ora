/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'zkmkapeuqbyvjxdkiljx.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
        domains: ['localhost', 'ora.s3.amazonaws.com'],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3000/api/v1/:path*',
            },
        ];
    },
};


module.exports = nextConfig;
