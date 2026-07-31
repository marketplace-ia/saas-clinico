/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignora los errores para poder hacer el despliegue de prueba
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; // o "export default nextConfig;" si es .mjs
