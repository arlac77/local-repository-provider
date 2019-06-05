
export function* refNamesFromString(str) {
  const refNames = new Set();

  for (const b of str.split(/\n/)) {
    const m = b.match(/[0-9a-f]{40}?\s+(.+)/);
    if (m) {
      let name = m[1];
      const parts = name.split(/\//);
      if (parts.length >= 3) {
        parts.shift();
        parts.shift();
        name = parts.join("/");
        if (!refNames.has(name)) {
          refNames.add(name);
          yield name;
        }
      }
    }
  }
}
