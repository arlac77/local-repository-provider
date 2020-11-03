import test from "ava";
import { repositoryListTest } from "repository-provider-test-support";
import LocalProvider from "local-repository-provider";

const provider = LocalProvider.initialize(undefined, process.env);

test(repositoryListTest, provider, undefined, 0);
test(repositoryListTest, provider, "invalid", 0);
test(repositoryListTest, provider, "*", 0);

test(repositoryListTest, provider, "https://github.com/arlac77/local-repository-provider.git", {
  "https://github.com/arlac77/local-repository-provider.git" : {
    name: "https://github.com/arlac77/local-repository-provider.git"
  }
});
