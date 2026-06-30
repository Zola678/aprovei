/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Desativar checagem de tipos durante o build para economizar memória (evitar OOM Killed)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Desativar linting durante o build para economizar RAM
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
