import test from "ava";
import { tmpdir } from "os";
import LocalProvider from "local-repository-provider";

test("create repo", async t => {
  const workspace = tmpdir();
  const name = "https://somewhere/aName.git";

  const provider = new LocalProvider({ workspace });

  const repository = await provider.createRepository(name);

  t.truthy(repository.workspace.startsWith(workspace));
  t.is(repository.name, name);

  //const branch = await repository.defaultBranch;
  //t.is(branch.name, "master");
});
