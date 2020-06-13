import test from "ava";
import { tmpdir } from "os";
import LocalProvider from "local-repository-provider";

const REPOSITORY_NAME = "https://github.com/arlac77/sync-test-repository.git";
const REPOSITORY_NAME_GIT = "git@github.com:arlac77/sync-test-repository.git";

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
  t.deepEqual(provider.cloneOptions, ["--depth", "10", "--no-single-branch"]);
  t.truthy(provider.workspace.length > 2);
});

test("local provider workspacePaths", async t => {
  const provider = new LocalProvider({ workspace: "/tmp" });

  const w1 = provider.newWorkspacePath();
  const w2 = provider.newWorkspacePath();
  const w3 = provider.newWorkspacePath();

  t.true(w1 !== w2);
  t.true(w1 !== w3);
  t.true(w2 !== w3);
  t.true(w1.startsWith('/tmp/r'));
  t.true(w2.startsWith('/tmp/r'));
  t.true(w3.startsWith('/tmp/r'));
});

test("local provider repo undefined", async t => {
  const provider = new LocalProvider();
  const repository = await provider.repository(undefined);
  t.true(repository === undefined);
});

test.serial("local provider git@", async t => {
  if (process.env.SSH_AUTH_SOCK) {
    const provider = new LocalProvider({ workspace: tmpdir() });

    const repository = await provider.repository(REPOSITORY_NAME_GIT);

    t.is(repository.name, REPOSITORY_NAME_GIT);
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});

test.serial("local provider with default workspace", async t => {
  const provider = new LocalProvider();

  const repository = await provider.repository(REPOSITORY_NAME);

  t.is(repository.name, REPOSITORY_NAME);
  t.is(repository.url, REPOSITORY_NAME);
});

test.serial("local provider create & delete branch", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });
  const repository = await provider.repository(REPOSITORY_NAME);

  let n = 0;
  for await (const branch of repository.branches()) {
    n++;
  }

  const newName = `test-${n}`;
  const branch = await repository.createBranch(newName);

  t.is(branch.name, newName);

  await repository.deleteBranch(newName);
  t.is(await repository.branch(newName), undefined);
});

test.serial("local get file", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });
  const repository = await provider.repository(REPOSITORY_NAME);
  const branch = await repository.defaultBranch;

  const file = await branch.entry("README.md");

  t.is((await file.getString()).substring(0, 3), `fil`);
});

test.serial("local provider list files", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });
  const repository = await provider.repository(REPOSITORY_NAME);
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

test.serial("local provider list files with pattern", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });
  const repository = await provider.repository(REPOSITORY_NAME);
  const branch = await repository.defaultBranch;

  const files = [];

  for await (const entry of branch.entries(["README.md"])) {
    files.push(entry);
  }

  const file = files[0];

  t.is(file.name, "README.md");
  t.true(file.isBlob);
});

test.serial("local provider get none exiting file", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });

  if (process.env.SSH_AUTH_SOCK) {
    const repository = await provider.repository(REPOSITORY_NAME_GIT);
    const branch = await repository.defaultBranch;

    await t.throwsAsync(async () => branch.entry("missing file"), {
      instanceOf: Error
    });
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});

test.serial("local provider get none exiting file maybeEntry", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });

  if (process.env.SSH_AUTH_SOCK) {
    const repository = await provider.repository(REPOSITORY_NAME_GIT);
    const branch = await repository.defaultBranch;

    t.is(await branch.maybeEntry("missing file"), undefined);
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});

test.serial.skip("local provider commit files", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });

  if (process.env.SSH_AUTH_SOCK) {
    const repository = await provider.repository(REPOSITORY_NAME_GIT);
    const branch = await repository.defaultBranch;
    const file = await branch.entry("README.md");
    const options = { encoding: "utf8" };
    const old = await file.getString(options);

    t.false(!(await file.isEmpty()));
    await file.setString(`${old}\n${new Date()}`);
    t.false(!(await file.isEmpty()));

    const file2 = await branch.entry("README.md");
    t.false(!(await file2.isEmpty()));

    t.is(await file.getString(options), await file2.getString(options));

    await branch.commit("test: ignore", [file]);

    const file3 = await branch.entry("README.md");
    t.is(await file.getString(options), await file3.getString(options));
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});
