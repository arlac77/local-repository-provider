export function refNamesFromString(str) {
  const refNames = new Set();

  str.split(/\n/).forEach(b => {
    const m = b.match(/[0-9a-f]{40}?\s+(.+)/);
    if (m) {
      let name = m[1];
      const parts = name.split(/\//);
      if (parts.length >= 3) {
        parts.shift();
        parts.shift();
        name = parts.join("/");
        refNames.add(name);
      }
    }
  });

  return [...refNames.values()];
}
