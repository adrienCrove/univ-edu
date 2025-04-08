/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignorer les fichiers HTML dans les dépendances
    config.module.rules.push({
      test: /\.html$/,
      loader: 'ignore-loader'
    });

    if (!isServer) {
      // Ne pas inclure les modules Node.js natifs dans le bundle client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        dgram: false,
        cluster: false,
        os: false,
        vm: false,
        rimraf: false
      };
    }
    return config;
  },
  // Autres configurations existantes...
}

module.exports = nextConfig 