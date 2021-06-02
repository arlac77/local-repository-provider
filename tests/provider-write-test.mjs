import test from "ava";
import { tmpdir } from "os";
import LocalProvider from "local-repository-provider";

const REPOSITORY_NAME = "https://github.com/arlac77/sync-test-repository.git";

test("local provider create & delete branch", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });
  const repository = await provider.repository(REPOSITORY_NAME);

  let n = 0;
  for await (const branch of repository.branches()) {
    n++;
  }

  const newName = `test-${n}`;
  const branch = await repository.createBranch(newName);

  t.is(
    branch.fullCondensedName,
    "https://github.com/arlac77/sync-test-repository.git#" + newName
  );

  t.is(branch.name, newName);

  await repository.deleteBranch(newName);
  t.is(await repository.branch(newName), undefined);
});
