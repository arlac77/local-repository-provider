import test from "ava";
import LocalProvider from "local-repository-provider";
import { entryListTest, REPOSITORY_NAME_WITH_BRANCH_GITHUB_HTTP } from "repository-provider-test-support";

const provider = new LocalProvider();

test.serial("local provider branchname default pattern", async t => {
  const branch = await provider.branch(REPOSITORY_NAME_WITH_BRANCH_GITHUB_HTTP);

  await entryListTest(t, branch, undefined, {
    ".gitignore": { startsWith: "node" },
    "README.md": { startsWith: "fil" },
    ".github/workflows/update_readme_api.yml": { startsWith: "name" },
    "tests/rollup.config.mjs": { startsWith: "import babel" },
    "a/b/c/file.txt": { startsWith: "file content" }
  });
});

test.serial("local provider branchname pattern", async t => {
  const branch = await provider.branch(REPOSITORY_NAME_WITH_BRANCH_GITHUB_HTTP);

  await entryListTest(t, branch, "**/*ADME*", {
    "README.md": { startsWith: "fil" }
  });
});