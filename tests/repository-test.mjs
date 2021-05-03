import test from "ava";
import { assertRepo } from "repository-provider-test-support";
import LocalProvider from "local-repository-provider";

const workspace = new URL("../build/workspace",import.meta.url).pathname;

const REPOSITORY_NAME = "https://github.com/arlac77/sync-test-repository.git";

const repoFixtures = {
  "": undefined,
  "  x  ": undefined,

  // export GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"
  /*
  "git@mfelten.de/github-repository-provider.git": undefined,
  "git@github.com:arlac77/sync-test-repository.git": {
    condensedName: "sync-test-repository",
    provider: LocalProvider
  },
    "https://mfelten.dynv6.net/services/git/markus/de.mfelten.archlinux.git": {
    condensedName: "de.mfelten.archlinux",
    provider: LocalProvider
  },

*/
  "http://www.heise.de/index.html": undefined,
  "https://github.com/arlac77/sync-test-repository.git": {
    condensedName: "sync-test-repository",
    provider: LocalProvider
  }
  /*,
  "ssh://git@github.com/arlac77/sync-test-repository.git": {
    condensedName: "sync-test-repository",
    provider: LocalProvider
  }*/
};

test("locate repository several", async t => {
  const provider = new LocalProvider();

  t.plan(7);

  for (const [url, repoFixture] of Object.entries(repoFixtures)) {
    await assertRepo(t, await provider.repository(url), repoFixture, url);
  }
});

test("locate invalid repository", async t => {
  const provider = new LocalProvider();
  t.is(
    await provider.repository("git@mfelten.de/github-repository-provider.git"),
    undefined
  );
});

test("local provider reuse workspace", async t => {
  const provider1 = new LocalProvider();
  const provider2 = new LocalProvider();

  const repository1 = await provider1.repository(REPOSITORY_NAME);
  const repository2 = await provider2.repository(REPOSITORY_NAME);

  t.is(repository1.name, REPOSITORY_NAME);
  t.is(repository2.name, REPOSITORY_NAME);
});

test("local provider show ref", async t => {
  const provider = new LocalProvider({ workspace });
  const repository = await provider.repository(REPOSITORY_NAME);
  const refid = await repository.refId("refs/heads/master");
  t.is(refid.length, 40);
});

test("list tags", async t => {
  const provider = new LocalProvider({ workspace });
  const repository = await provider.repository(REPOSITORY_NAME);

  const tags = new Set();
  for await (const name of repository.tags()) {
    tags.add(name);
  }

  t.true(tags.has("v1.0.0"));
});
