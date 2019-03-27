
export function branchNamesFromString(str) {
  const branchNames = new Set();

  str.split(/\n/).forEach(b => {
    const m = b.match(/^\*?\s*([^\s]+)/);
    if (m) {
      let name = m[1];
      const parts = name.split(/\//);
      if (parts.length >= 3 && parts[0] === "remotes") {
        parts.shift();
        parts.shift();
        name = parts.join('/');
      }
      if(name !== 'HEAD') {
        branchNames.add(name);
      }
    }
  });

  return [...branchNames.values()];
}
