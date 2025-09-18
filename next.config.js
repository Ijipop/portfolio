/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supprimer les avertissements d'accessibilité en développement
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuration pour Material-UI
  transpilePackages: ['@mui/material', '@mui/icons-material'],
}

module.exports = nextConfig