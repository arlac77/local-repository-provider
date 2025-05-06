import test from "ava";
import { assertRepo, REPOSITORY_NAME_GITHUB_HTTP } from "repository-provider-test-support";
import LocalProvider from "local-repository-provider";

const workspace = new URL("../build/workspace", import.meta.url).pathname;


const repoFixtures = {
  "": undefined,
  "  x  ": undefined,

  // export GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"
  /*
  "git@mfelten.de/github-repository-provider.git": undefined,
    "https://mfelten.dynv6.net/services/git/markus/de.mfelten.archlinux.git": {
    condensedName: "de.mfelten.archlinux",
    provider: LocalProvider
  },
*/
  "http://www.heise.de/index.html": undefined,
  "https://github.com/arlac77/sync-test-repository.git": {
    condensedName: "https://github.com/arlac77/sync-test-repository.git",
    displayName: "arlac77/sync-test-repository",
    provider: LocalProvider
  },
  "git@github.com:arlac77/sync-test-repository.git": {
    condensedName: "git@github.com:arlac77/sync-test-repository.git",
    displayName: "arlac77/sync-test-repository",
    provider: LocalProvider
  },
  "ssh://git@github.com/arlac77/sync-test-repository.git": {
    condensedName: "ssh://git@github.com/arlac77/sync-test-repository.git",
    displayName: "arlac77/sync-test-repository",
    provider: LocalProvider
  }
};

test.serial("locate repository several", async t => {
  const provider = new LocalProvider();

  t.plan(21);

  for (const [url, repoFixture] of Object.entries(repoFixtures)) {
    await assertRepo(t, await provider.repository(url), repoFixture, url);
  }
});

test.serial("locate invalid repository", async t => {
  const provider = new LocalProvider();
  t.is(
    await provider.repository("git@mfelten.de/github-repository-provider.git"),
    undefined
  );
});

test.serial("local provider reuse workspace", async t => {
  const provider1 = new LocalProvider();
  const provider2 = new LocalProvider();

  const repository1 = await provider1.repository(REPOSITORY_NAME_GITHUB_HTTP);
  const repository2 = await provider2.repository(REPOSITORY_NAME_GITHUB_HTTP);

  t.is(repository1.name, REPOSITORY_NAME_GITHUB_HTTP);
  t.is(repository2.name, REPOSITORY_NAME_GITHUB_HTTP);
});

test.serial("local provider show ref", async t => {
  const provider = new LocalProvider({ workspace });
  const repository = await provider.repository(REPOSITORY_NAME_GITHUB_HTTP);
  const refid = await repository.refId("refs/heads/master");
  t.is(refid.length, 40);
});

test.serial("list tags", async t => {
  const provider = new LocalProvider({ workspace });
  const repository = await provider.repository(REPOSITORY_NAME_GITHUB_HTTP);

  const tags = new Set();
  for await (const name of repository.tags()) {
    tags.add(name);
  }

  t.true(tags.has("v1.0.0"));
});
