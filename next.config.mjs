/** @type {import('next').NextConfig} */
const nextConfig = {
  // La imagen de las notificaciones lee la fuente Archivo del proyecto (src/assets/fonts).
  outputFileTracingIncludes: { '/api/push-image': ['./src/assets/fonts/*.ttf'] },
  async headers() {
    return [{ source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }];
  },
};
export default nextConfig;
