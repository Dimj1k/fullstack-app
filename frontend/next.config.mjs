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
    'env': {
        API: 'http://localhost:3002/api',
        CENTRIFUGE: 'ws://localhost:8000/connection/websocket',
        MONGO_DB: "mongodb://localhost:27017"
    },
};

export default nextConfig;