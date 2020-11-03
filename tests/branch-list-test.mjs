import test from "ava";
import { branchListTest } from "repository-provider-test-support";
import LocalProvider from "local-repository-provider";

const provider = LocalProvider.initialize(undefined, process.env);

test(branchListTest, provider, undefined, 0);
test(branchListTest, provider, "invalid", 0);

test(branchListTest, provider, "https://github.com/arlac77/local-repository-provider.git", {
  "https://github.com/arlac77/local-repository-provider.git" : {
    name: "master",
    fullName: "https://github.com/arlac77/local-repository-provider.git#master",
    fullCondensedName: "https://github.com/arlac77/local-repository-provider.git"
  }
});
