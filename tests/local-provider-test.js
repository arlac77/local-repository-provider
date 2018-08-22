import test from "ava";
import { LocalProvider } from "../src/local-provider";
import { join } from "path";
import { directory } from "tempy";

const workspace = join(__dirname, "..", "build", "workspace");

const REPOSITORY_NAME = "https://github.com/arlac77/sync-test-repository.git";
const REPOSITORY_NAME_GIT = "git@github.com:arlac77/sync-test-repository.git";

test("local provider workspacePaths", async t => {
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
    const provider = new LocalProvider({ workspace: directory() });

    const repository = await provider.repository(REPOSITORY_NAME_GIT);

    t.is(repository.name, REPOSITORY_NAME_GIT);
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});

test("local provider with default workspace", async t => {
  const provider = new LocalProvider();

  const repository = await provider.repository(REPOSITORY_NAME);

  t.is(repository.name, REPOSITORY_NAME);
});

test.serial("local provider create & delete branch", async t => {
  const provider = new LocalProvider({ workspace: directory() });
  const repository = await provider.repository(REPOSITORY_NAME);
  const branches = await repository.branches();

  const newName = `test-${branches.size}`;
  const branch = await repository.createBranch(newName);

  t.is(branch.name, newName);

  await repository.deleteBranch(newName);
  t.is(branches.get(newName), undefined);
});

test.serial("local get file", async t => {
  const provider = new LocalProvider({ workspace: directory() });
  const repository = await provider.repository(REPOSITORY_NAME);
  const branch = await repository.defaultBranch;

  const file = await branch.content("README.md");

  t.is(file.content.substring(0, 3), `xxx`);
});

test.serial("local provider list files", async t => {
  const provider = new LocalProvider({ workspace: directory() });
  const repository = await provider.repository(REPOSITORY_NAME);
  const branch = await repository.defaultBranch;

  const files = await branch.list();

  const file1 = files.find(f => f.path === "README.md");
  t.is(file1.path, "README.md");
  t.is(file1.type, "blob");

  const file2 = files.find(f => f.path === ".gitignore");
  t.is(file2.path, ".gitignore");
  t.is(file2.type, "blob");
});

test.serial("local provider get none exiting file", async t => {
  const provider = new LocalProvider({ workspace });

  if (process.env.SSH_AUTH_SOCK) {
    const repository = await provider.repository(REPOSITORY_NAME_GIT);
    const branch = await repository.defaultBranch;

    const file = await branch.content("missing file", { ignoreMissing: true });
    t.is(file.path, "missing file");
    t.is(file.content.length, 0);
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});

test.serial("local provider commit files", async t => {
  const provider = new LocalProvider({ workspace });

  if (process.env.SSH_AUTH_SOCK) {
    const repository = await provider.repository(REPOSITORY_NAME_GIT);
    const branch = await repository.defaultBranch;
    const file = await branch.content("README.md");

    let content = file.content;

    content += `\n${new Date()}`;

    const r = await branch.commit("test: ignore", [
      { path: "README.md", content }
    ]);

    const file2 = await branch.content("README.md");

    t.is(content, file2.content);
  } else {
    t.is(1, 1, "skip git@ test without SSH_AUTH_SOCK");
  }
});
