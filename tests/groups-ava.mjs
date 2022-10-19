import test from "ava";
import { groupListTest, groupTest } from "repository-provider-test-support";
import LocalProvider from "local-repository-provider";

const provider = LocalProvider.initialize(undefined, process.env);

test(groupListTest, provider, undefined, 0);
test(groupListTest, provider, "*", 0);
test(groupListTest, provider, "https://github.com/arlac77/*", 0);
test(groupTest, provider, undefined, undefined);
