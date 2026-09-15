const fs = require('fs');

const origReadlink = fs.readlink;
fs.readlink = function (path, options, callback) {
  const cb = typeof options === 'function' ? options : callback;
  const opts = typeof options === 'function' ? undefined : options;

  const handler = (err, linkString) => {
    if (err && (err.code === 'EISDIR' || err.code === 'EINVAL' || err.code === 'UNKNOWN')) {
      const einvalErr = new Error('EINVAL: invalid argument, readlink');
      einvalErr.code = 'EINVAL';
      return cb(einvalErr);
    }
    return cb(err, linkString);
  };

  if (opts !== undefined) {
    return origReadlink.call(fs, path, opts, handler);
  } else {
    return origReadlink.call(fs, path, handler);
  }
};

const origReadlinkSync = fs.readlinkSync;
fs.readlinkSync = function (path, options) {
  try {
    return origReadlinkSync.call(fs, path, options);
  } catch (err) {
    if (err && (err.code === 'EISDIR' || err.code === 'EINVAL' || err.code === 'UNKNOWN')) {
      const einvalErr = new Error('EINVAL: invalid argument, readlink');
      einvalErr.code = 'EINVAL';
      throw einvalErr;
    }
    throw err;
  }
};

if (fs.promises) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function (path, options) {
    try {
      return await origPromisesReadlink.call(fs.promises, path, options);
    } catch (err) {
      if (err && (err.code === 'EISDIR' || err.code === 'EINVAL' || err.code === 'UNKNOWN')) {
        const einvalErr = new Error('EINVAL: invalid argument, readlink');
        einvalErr.code = 'EINVAL';
        throw einvalErr;
      }
      throw err;
    }
  };
}
