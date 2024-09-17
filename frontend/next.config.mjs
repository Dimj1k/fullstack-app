/** @type {import('next').NextConfig} */
const nextConfig = {
    'images': {
        // ''
        remotePatterns: [{
            protocol: 'http',
            hostname: 'localhost',
            port: '3002',
        }]
    },
    'poweredByHeader': false,
    'reactStrictMode': true,
    'env': {},
};

export default nextConfig;