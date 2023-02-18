import test from "ava";
import { tmpdir } from "node:os";

import { REPOSITORY_NAME_GITHUB_HTTP } from "repository-provider-test-support";
import LocalProvider from "local-repository-provider";



test.skip("local provider create & delete branch", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });
  const repository = await provider.repository(REPOSITORY_NAME_GITHUB_HTTP);

  /*
  writeFileSync(join(homedir(), '.git-credentials'), "https://someone:secret@github.com/\n", { encoding: "utf8" });
  const data = readFileSync(join(homedir(), '.git-credentials'), { encoding: "utf8" });

  console.log(data);
  t.log(data);
*/

  let n = 0;
  for await (const branch of repository.branches()) {
    n++;
  }

  const newName = `test-${n}`;
  const branch = await repository.createBranch(newName);

  t.is(
    branch.fullCondensedName,
    REPOSITORY_NAME_GITHUB_HTTP + "#" + newName
  );

  t.is(branch.name, newName);

  await repository.deleteBranch(newName);
  t.is(await repository.branch(newName), undefined);
});
