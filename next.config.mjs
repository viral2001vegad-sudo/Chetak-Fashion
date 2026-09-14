import fs from 'fs';

// Patch Node fs.readlink for Webpack exFAT drive compatibility
const origReadlink = fs.readlink;
fs.readlink = function (path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  origReadlink.call(fs, path, options, (err, linkString) => {
    if (err && (err.code === 'EISDIR' || err.code === 'EINVAL')) {
      const einvalErr = new Error('EINVAL: invalid argument, readlink');
      einvalErr.code = 'EINVAL';
      return callback(einvalErr);
    }
    callback(err, linkString);
  });
};

if (fs.promises) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function (path, options) {
    try {
      return await origPromisesReadlink.call(fs.promises, path, options);
    } catch (err) {
      if (err && (err.code === 'EISDIR' || err.code === 'EINVAL')) {
        const einvalErr = new Error('EINVAL: invalid argument, readlink');
        einvalErr.code = 'EINVAL';
        throw einvalErr;
      }
      throw err;
    }
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    webpackBuildWorker: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  webpack: (config) => {
    config.cache = false;
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
