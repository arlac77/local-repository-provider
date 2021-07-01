import test from "ava";
import LocalProvider from "local-repository-provider";
import { entryListTest } from "repository-provider-test-support";

import { REPOSITORY_NAME } from "./helpers/constants.mjs";

const REPOSITORY_NAME_BRANCH = REPOSITORY_NAME + "#local-repository-provider-test";

const provider = new LocalProvider();

test("local provider branchname default pattern", async t => {
  const branch = await provider.branch(REPOSITORY_NAME_BRANCH);

  await entryListTest(t, branch, undefined, {
    ".gitignore": { startsWith: "node" },
    "README.md": { startsWith: "fil" },
    ".github/workflows/update_readme_api.yml": { startsWith: "name" },
    "tests/rollup.config.mjs": { startsWith: "import babel" },
    "a/b/c/file.txt": { startsWith: "file content" }
  });
});

test("local provider branchname pattern", async t => {
  const branch = await provider.branch(REPOSITORY_NAME_BRANCH);

  await entryListTest(t, branch, "**/*ADME*", {
    "README.md": { startsWith: "fil" }
  });
});