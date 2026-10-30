/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 🟢 CORRECCIÓN: Cambiado a false para detectar errores críticos antes del despliegue a producción
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig; // o "export default nextConfig;" si es .mjs
