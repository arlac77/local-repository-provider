import test from "ava";
import { tmpdir } from "os";
import { branchListTest } from "repository-provider-test-support";

import LocalProvider from "local-repository-provider";


const provider = new LocalProvider({ workspace: tmpdir() });

test(branchListTest, provider, "bad-name/unknown-*");
test(branchListTest, provider, "https://github.com/arlac77/sync-test-repository.git", {
  "LocalProvider/arlac77/sync-test-repository": {
    fullCondensedName: "arlac77/aggregation-repository-provider",
  },
});



/*
test.serial("list branches", async t => {
    const provider = new LocalProvider({ workspace });
    const repository = await provider.repository(REPOSITORY_NAME);
  
    const names = new Set();
    for await (const branch of repository.branches()) {
      names.add(branch.name);
    }
  
    t.true(names.has("master"));
  });
*/