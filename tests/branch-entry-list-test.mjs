import test from "ava";
import LocalProvider from "local-repository-provider";
import { entryListTest } from "repository-provider-test-support";

const REPOSITORY_NAME_BRANCH = "https://github.com/arlac77/sync-test-repository.git#local-repository-provider-test";

test("local provider branchname", async t => {
  const provider = new LocalProvider();

  const repository = await provider.repository(REPOSITORY_NAME_BRANCH);

  const branch = await repository.branch("local-repository-provider-test");

  
  await entryListTest(t, branch, undefined, {
    ".gitignore": { startsWith: "node" },
    "README.md": { startsWith: "fil" },
    ".github/workflows/update_readme_api.yml": { startsWith: "name" },
    "tests/rollup.config.mjs": { startsWith: "import babel" },
    "a/b/c/file.txt": { startsWith: "file content" }
  });
});