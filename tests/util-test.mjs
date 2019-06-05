import test from "ava";
import { refNamesFromString } from "../src/util.mjs";

test("refNamesFromString heads", t => {
  t.deepEqual(
    [...refNamesFromString(`From https://github.com/arlac77/local-repository-provider.git
a0fd4e406680de7d1153bdecb432f1202f9afce8	refs/heads/master
`)],
    ["master"]
  );
});

test("refNamesFromString heads 2", t => {
  t.deepEqual(
  [...refNamesFromString(`From https://github.com/arlac77/node-symatem.git
175ed3ec4ad9246e96ec69c7809d20d47c21646f	refs/heads/master
ef7bfd57dae29ea31fe7d5b86674730e3cceaceb	refs/heads/features/wasm
`)],
    ["master", "features/wasm"]
  );
});


test("refNamesFromString tags", t => {
  t.deepEqual(
    [...refNamesFromString(`From https://github.com/arlac77/local-repository-provider.git
    1ac258e3203978e9b1b60b3d7cd6e4f4185206bb	refs/tags/v1.0.0
    e617cc0d66a9466f4df36fbd285862f9d9928c31	refs/tags/v1.0.1
    400779b1bd0bf021b148e0ef40c80e279e4f8e17	refs/tags/v1.2.10
    9a9f1f45a5741c42a121c47b2c2ae0132a21f1c0	refs/tags/v1.2.13
`)],
    ["v1.0.0", "v1.0.1", "v1.2.10", "v1.2.13"]
  );
});
