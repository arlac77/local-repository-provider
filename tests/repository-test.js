import test from "ava";
import { LocalProvider } from "../src/local-provider";
import { join } from "path";
import { directory } from "tempy";

const workspace = join(__dirname, "..", "build", "workspace");

const REPOSITORY_NAME = "https://github.com/arlac77/sync-test-repository.git";
const REPOSITORY_NAME_GIT = "git@github.com:arlac77/sync-test-repository.git";

test.serial("local provider https", async t => {
  const provider = new LocalProvider({ workspace: directory() });
  const repository = await provider.repository(REPOSITORY_NAME);

  t.is(repository.name, REPOSITORY_NAME);
  t.is(repository.url, REPOSITORY_NAME);
});

test.serial("local provider reuse workspace", async t => {
  const wd = directory();
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
