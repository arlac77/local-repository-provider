import test from "ava";
import { join } from "path";
import { tmpdir } from "os";
import LocalProvider from "local-repository-provider";
import { REPOSITORY_NAME_WITH_BRANCH } from "./helpers/constants.mjs";
import {
  REPOSITORY_NAME_GITHUB_HTTP,
  REPOSITORY_NAME_GITHUB_GIT
} from "repository-provider-test-support";

test("provider factory name", t => t.is(LocalProvider.name, "local"));

test("local provider optionsFromEnvironment", t => {
  const options = LocalProvider.optionsFromEnvironment({
    GIT_CLONE_OPTIONS: "--depth 1"
  });

  t.deepEqual(options.cloneOptions, "--depth 1");

  const provider = new LocalProvider(options);
  t.deepEqual(provider.cloneOptions, ["--depth", "1"]);
});

test("local provider", t => {
  const provider = new LocalProvider();
  t.deepEqual(provider.cloneOptions, ["--depth", "8", "--no-single-branch"]);
  t.truthy(provider.workspace.length > 2);
  t.is(provider.priority, 0);
});

test("local provider workspacePaths", async t => {
  const provider = new LocalProvider({ workspace: "/tmp" });

  const w1 = provider.newWorkspacePath("a");
  const w2 = provider.newWorkspacePath("b");
  const w3 = provider.newWorkspacePath("c");

  t.true(w1 !== w2);
  t.true(w1 !== w3);
  t.true(w2 !== w3);
  t.true(w1.startsWith("/tmp/"));
  t.true(w2.startsWith("/tmp/"));
  t.true(w3.startsWith("/tmp/"));
});

test("local provider repo undefined", async t => {
  const provider = new LocalProvider();
  const repository = await provider.repository(undefined);
  t.true(repository === undefined);
});

test("local provider git@", async t => {
  if (process.env.SSH_AUTH_SOCK) {
    const provider = new LocalProvider({ workspace: join(tmpdir(), "a") });

    const repository = await provider.repository(REPOSITORY_NAME_GITHUB_GIT);

    t.is(repository.name, REPOSITORY_NAME_GITHUB_GIT);
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});

test("local provider with default workspace", async t => {
  const provider = new LocalProvider();

  const repository = await provider.repository(REPOSITORY_NAME_GITHUB_HTTP);

  t.is(repository.name, REPOSITORY_NAME_GITHUB_HTTP);
  t.is(repository.url, REPOSITORY_NAME_GITHUB_HTTP);
});

test("local provider branch name", async t => {
  const provider = new LocalProvider({ workspace: join(tmpdir(), "b") });

  const repository = await provider.repository(REPOSITORY_NAME_WITH_BRANCH);
  t.is(repository.name, REPOSITORY_NAME_GITHUB_HTTP);
  t.is(repository.url, REPOSITORY_NAME_GITHUB_HTTP);
  t.is(
    (await provider.branch(REPOSITORY_NAME_WITH_BRANCH)).name,
    "preserve-for-test"
  );
});

test("local get file", async t => {
  const provider = new LocalProvider({ workspace: join(tmpdir(), "c") });
  const repository = await provider.repository(REPOSITORY_NAME_GITHUB_HTTP);
  const branch = await repository.defaultBranch;

  const file = await branch.entry("README.md");

  t.is((await file.string).substring(0, 3), "fil");
});

test("local provider list files", async t => {
  const provider = new LocalProvider({ workspace: join(tmpdir(), "d") });
  const repository = await provider.repository(REPOSITORY_NAME_GITHUB_HTTP);
  const branch = await repository.defaultBranch;

  const files = [];

  for await (const entry of branch.entries()) {
    files.push(entry);
  }

  const file1 = files.find(f => f.name == "README.md");
  t.is(file1.name, "README.md");
  t.true(file1.isBlob);

  const file2 = files.find(f => f.name === ".gitignore");
  t.is(file2.name, ".gitignore");
  t.true(file2.isBlob);
});

test("local provider list files with pattern", async t => {
  const provider = new LocalProvider({ workspace: join(tmpdir(), "e") });
  const repository = await provider.repository(REPOSITORY_NAME_GITHUB_HTTP);
  const branch = await repository.defaultBranch;

  const files = [];

  for await (const entry of branch.entries(["README.md"])) {
    files.push(entry);
  }

  const file = files[0];

  t.is(file.name, "README.md");
  t.true(file.isBlob);
});

test("local provider get none existing file", async t => {
  const provider = new LocalProvider({ workspace: join(tmpdir(), "f") });

  if (process.env.SSH_AUTH_SOCK) {
    const repository = await provider.repository(REPOSITORY_NAME_GITHUB_GIT);
    const branch = await repository.defaultBranch;

    await t.throwsAsync(async () => branch.entry("missing file"), {
      instanceOf: Error
    });
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});

test("local provider get none exiting file maybeEntry", async t => {
  const provider = new LocalProvider({ workspace: join(tmpdir(), "g") });

  if (process.env.SSH_AUTH_SOCK) {
    const repository = await provider.repository(REPOSITORY_NAME_GITHUB_GIT);
    const branch = await repository.defaultBranch;

    t.is(await branch.maybeEntry("missing file"), undefined);
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});

test.serial.skip("local provider commit files", async t => {
  const provider = new LocalProvider({ workspace: join(tmpdir(), "h") });

  if (process.env.SSH_AUTH_SOCK) {
    const repository = await provider.repository(REPOSITORY_NAME_GITHUB_GIT);
    const branch = await repository.defaultBranch;
    const file = await branch.entry("README.md");
    const old = await file.string;

    t.false(!(await file.isEmpty));
    await file.setString(`${old}\n${new Date()}`);
    t.false(!(await file.isEmpty));

    const file2 = await branch.entry("README.md");
    t.false(!(await file2.isEmpty));

    t.is(await file.string, await file2.string);

    await branch.commit("test: ignore", [file]);

    const file3 = await branch.entry("README.md");
    t.is(await file.string, await file3.string);
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});
