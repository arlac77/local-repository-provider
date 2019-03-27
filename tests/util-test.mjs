import test from "ava";
import { branchNamesFromString } from "../src/util";

test("branchNamesFromString 1", t => {
  t.deepEqual(
    branchNamesFromString(`  fs-entry
* master
  remotes/origin/HEAD -> origin/master
  remotes/origin/master
`),
    ["fs-entry", "master"]
  );
});

test("branchNamesFromString 2", t => {
  t.deepEqual(
    branchNamesFromString(`* master
      remotes/origin/HEAD -> origin/master
      remotes/origin/greenkeeper/ava-1.4.0
      remotes/origin/greenkeeper/ava-pin-1.3.1
      remotes/origin/greenkeeper/rollup-1.7.1
      remotes/origin/greenkeeper/rollup-1.7.2
      remotes/origin/greenkeeper/rollup-pin-1.7.0
      remotes/origin/master`),
    [
      "master",
      "greenkeeper/ava-1.4.0",
      "greenkeeper/ava-pin-1.3.1",
      "greenkeeper/rollup-1.7.1",
      "greenkeeper/rollup-1.7.2",
      "greenkeeper/rollup-pin-1.7.0"
    ]
  );
});
