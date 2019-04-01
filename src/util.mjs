export function branchNamesFromString(str) {
  const branchNames = new Set();

  str.split(/\n/).forEach(b => {
    const m = b.match(/^\w{40}?\s*(.+)/);
    if (m) {
      let name = m[1];
      const parts = name.split(/\//);
      if (parts.length >= 3) {
        parts.shift();
        parts.shift();
        name = parts.join("/");
        branchNames.add(name);
      }
    }
  });

  return [...branchNames.values()];
}
