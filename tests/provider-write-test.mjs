import test from "ava";
import { tmpdir } from "os";
import LocalProvider from "local-repository-provider";

import {REPOSITORY_NAME } from "./helpers/constants.mjs";

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
    REPOSITORY_NAME + "#" + newName
  );

  t.is(branch.name, newName);

  await repository.deleteBranch(newName);
  t.is(await repository.branch(newName), undefined);
});
