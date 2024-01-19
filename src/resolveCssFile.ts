import fs from 'fs';
import url from 'url';
import path from 'path';
import fetch from 'sync-fetch';

const createCache = ({ limit = 100 } = {}) => {
  let cache: Record<string, any> = {};
  let keys: string[] = [];

  return {
    get: (key: string) => cache[key],
    set: (key: string, value: any) => {
      keys.push(key);
      if (keys.length > limit) {
        delete cache[keys.shift() as string];
      }
      cache[key] = value;
    },
    reset: () => {
      cache = {};
      keys = [];
    },
    length: () => keys.length,
  };
};

export const CSS_CACHE = createCache({ limit: 30 });

const getAbsoluteLocalPath = (src: string) => {
  // if (BROWSER) {
  //   throw new Error('Cannot check local paths in client-side environment');
  // }

  const {
    protocol,
    auth,
    host,
    port,
    hostname,
    path: pathname,
  } = url.parse(src);
  const absolutePath = path.resolve(pathname as string);
  if ((protocol && protocol !== 'file:') || auth || host || port || hostname) {
    return undefined;
  }
  return absolutePath;
};

const fetchLocalFile = (src: string): string => {
  // if (BROWSER) {
  //   throw new Error('Cannot fetch local file in this environment');
  // }

  const absolutePath = getAbsoluteLocalPath(src);
  if (!absolutePath) {
    throw new Error(`Cannot fetch non-local path: ${src}`);
  }
  return fs.readFileSync(absolutePath, { encoding: 'utf8', flag: 'r' });
};

const fetchRemoteFile = (
  uri: string,
  options: Parameters<typeof fetch>['1']
): string => {
  const response = fetch(uri, options);

  return response.text();
};

const resolveImageFromUrl = (
  src: string,
  crossOrigin: 'anonymous' | 'use-credentials' = 'anonymous'
) => {
  return getAbsoluteLocalPath(src)
    ? fetchLocalFile(src)
    : fetchRemoteFile(src, {
        method: 'GET',
      });
};

const resolveCssFile = (
  src: string,
  crossOrigin: 'anonymous' | 'use-credentials' = 'anonymous',
  cache = true
) => {
  let image;

  if (cache && CSS_CACHE.get(src)) {
    return CSS_CACHE.get(src);
  } else {
    image = resolveImageFromUrl(src, crossOrigin);
  }

  if (!image) {
    throw new Error('Cannot resolve image');
  }

  if (cache) {
    CSS_CACHE.set(src, image);
  }

  return image;
};

export default resolveCssFile;
