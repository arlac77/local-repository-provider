import test from "ava";
import { LocalProvider } from "../src/local-provider";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const here = dirname(fileURLToPath(import.meta.url));
const workspace = join(here, "..", "build", "workspace");

const REPOSITORY_NAME = "https://github.com/arlac77/sync-test-repository.git";
const REPOSITORY_NAME_GIT = "git@github.com:arlac77/sync-test-repository.git";

test("local provider optionsFromEnvironment", t => {
  const options = LocalProvider.optionsFromEnvironment({
    GIT_CLONE_OPTIONS: "--depth 1"
  });

  t.deepEqual(options.cloneOptions, ["--depth", "1"]);

  const provider = new LocalProvider(options);
  t.deepEqual(provider.cloneOptions, ["--depth", "1"]);
});

test("local provider", async t => {
  const provider = new LocalProvider();
  t.deepEqual(provider.cloneOptions, ["--depth", "10"]);
  t.truthy(provider.workspace.length > 2);
});

test.serial("local provider workspacePaths", async t => {
  const provider = new LocalProvider({ workspace: "/tmp" });

  t.is(await provider.newWorkspacePath(), "/tmp/r1");
  t.is(await provider.newWorkspacePath(), "/tmp/r2");
  t.is(await provider.newWorkspacePath(), "/tmp/r3");
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
  const branches = await repository.branches();

  const newName = `test-${branches.size}`;
  const branch = await repository.createBranch(newName);

  t.is(branch.name, newName);

  await repository.deleteBranch(newName);
  t.is(branches.get(newName), undefined);
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

test.serial("local provider commit files", async t => {
  const provider = new LocalProvider({ workspace: tmpdir() });

  if (process.env.SSH_AUTH_SOCK) {
    const repository = await provider.repository(REPOSITORY_NAME_GIT);
    const branch = await repository.defaultBranch;
    const file = await branch.entry("README.md");
    const options = { encoding: "utf8" };
    const old = await file.getString(options);

    file.setString(`${old}\n${new Date()}`);

    await branch.commit("test: ignore", [file]);

    const file2 = await branch.entry("README.md");

    t.is(await file.getString(options), await file2.getString(options));
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});
