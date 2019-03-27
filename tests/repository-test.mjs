import test from "ava";
import { LocalProvider } from "../src/local-provider";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const here = dirname(fileURLToPath(import.meta.url));
const workspace = join(here, "..", "build", "workspace");

const REPOSITORY_NAME = "https://github.com/arlac77/sync-test-repository.git";
const REPOSITORY_NAME_GIT = "git@github.com:arlac77/sync-test-repository.git";

test.serial("local provider https", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });
  const repository = await provider.repository(REPOSITORY_NAME);

  t.is(repository.name, REPOSITORY_NAME);
  t.is(repository.url, REPOSITORY_NAME);
  t.is(repository.condensedName, "sync-test-repository");
});

test.serial("local provider git@", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });
  const repository = await provider.repository(REPOSITORY_NAME_GIT);

  t.is(repository.name, REPOSITORY_NAME_GIT);
  t.is(repository.url, REPOSITORY_NAME_GIT);
  t.is(repository.condensedName, "sync-test-repository");
});

test.serial("local provider reuse workspace", async t => {
  const wd = tmpdir();
  const provider1 = new LocalProvider({ workspace: wd });
  const provider2 = new LocalProvider({ workspace: wd });

  const repository1 = await provider1.repository(REPOSITORY_NAME);
  const repository2 = await provider2.repository(REPOSITORY_NAME);

  t.is(repository1.name, REPOSITORY_NAME);
  t.is(repository2.name, REPOSITORY_NAME);
});

test.skip("local provider show ref", async t => {
  const provider = new LocalProvider({ workspace });
  const repository = await provider.repository(REPOSITORY_NAME);

  t.is((await repository.refId("refs/heads/master")).length, 10);
});

test.serial("list branches", async t => {
  const provider = new LocalProvider({ workspace });
  const repository = await provider.repository(REPOSITORY_NAME);

  const names = new Set();
  for (const [name, branch] of await repository.branches()) {
    names.add(name);
  }

  t.true(names.has("master"));
});
