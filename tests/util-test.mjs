import test from "ava";
import { branchNamesFromString } from "../src/util.mjs";

test("branchNamesFromString 1", t => {
  t.deepEqual(
    branchNamesFromString(`From https://github.com/arlac77/local-repository-provider.git
a0fd4e406680de7d1153bdecb432f1202f9afce8	refs/heads/master
`),
    ["master"]
  );
});

test("branchNamesFromString 2", t => {
  t.deepEqual(
    branchNamesFromString(`From https://github.com/arlac77/node-symatem.git
175ed3ec4ad9246e96ec69c7809d20d47c21646f	refs/heads/master
ef7bfd57dae29ea31fe7d5b86674730e3cceaceb	refs/heads/wasm
`),
    ["master", "wasm"]
  );
});
