import test from "ava";
import { tmpdir } from "os";
import { branchListTest } from "repository-provider-test-support";

import LocalProvider from "local-repository-provider";

const provider = new LocalProvider({ workspace: tmpdir() });

test(branchListTest, provider, "bad-name/unknown-*");

test(
  branchListTest,
  provider,
  "https://github.com/arlac77/sync-test-repository.git",
  {
    "https://github.com/arlac77/sync-test-repository.git": {
      fullCondensedName: "https://github.com/arlac77/sync-test-repository.git"
    }
  }
);
