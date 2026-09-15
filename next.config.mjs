import fs from 'fs';

// Patch Node fs.readlink & readlinkSync for Windows drive compatibility with Webpack
const patchReadlinkErr = (err) => {
  if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
    const e = new Error('EINVAL: invalid argument, readlink');
    e.code = 'EINVAL';
    return e;
  }
  return err;
};

const origReadlink = fs.readlink;
fs.readlink = function (path, options, callback) {
  const cb = typeof options === 'function' ? options : callback;
  const opts = typeof options === 'function' ? undefined : options;

  const handler = (err, linkString) => {
    cb(patchReadlinkErr(err), linkString);
  };

  return opts !== undefined
    ? origReadlink.call(fs, path, opts, handler)
    : origReadlink.call(fs, path, handler);
};

const origReadlinkSync = fs.readlinkSync;
fs.readlinkSync = function (path, options) {
  try {
    return origReadlinkSync.call(fs, path, options);
  } catch (err) {
    throw patchReadlinkErr(err);
  }
};

if (fs.promises && fs.promises.readlink) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function (path, options) {
    try {
      return await origPromisesReadlink.call(fs.promises, path, options);
    } catch (err) {
      throw patchReadlinkErr(err);
    }
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable Webpack disk caching in dev mode to prevent stale chunk 404s on Windows
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
