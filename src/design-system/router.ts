import { useEffect, useState } from 'react';

/** Hash routing (`#/components/button`) so the docs need no server rewrites or router library. */
const readPath = () => window.location.hash.replace(/^#/, '') || '/';

export function useHashPath() {
  const [path, setPath] = useState(readPath);
  useEffect(() => {
    const onChange = () => setPath(readPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

export const href = (path: string) => `#${path}`;
