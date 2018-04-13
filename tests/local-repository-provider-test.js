import test from 'ava';
import { LocalProvider } from '../src/local-repository-provider';
import { join } from 'path';

const tempy = require('tempy');

const workspace = join(__dirname, '..', 'build', 'workspace');

const REPOSITORY_NAME = 'https://github.com/arlac77/sync-test-repository.git';
const REPOSITORY_NAME_GIT = 'git@github.com:arlac77/sync-test-repository.git';

test('local provider https', async t => {
  const provider = new LocalProvider({ workspace: tempy.directory() });

  const repository = await provider.repository(REPOSITORY_NAME);

  t.is(repository.name, REPOSITORY_NAME);
});

test('local provider git@', async t => {
  if (process.env.SSH_AUTH_SOCK) {
    const provider = new LocalProvider({ workspace: tempy.directory() });

    const repository = await provider.repository(REPOSITORY_NAME_GIT);

    t.is(repository.name, REPOSITORY_NAME_GIT);
  } else {
    t.is(1, 1, 'skip git@ test without SSH_AUTH_SOCK');
  }
});

test('local provider with default workspace', async t => {
  const provider = new LocalProvider();

  const repository = await provider.repository(REPOSITORY_NAME);

  t.is(repository.name, REPOSITORY_NAME);
});

test('local provider create & delete branch', async t => {
  const provider = new LocalProvider({ workspace: tempy.directory() });
  const repository = await provider.repository(REPOSITORY_NAME);
  const branches = await repository.branches();

  const newName = `test-${branches.size}`;
  const branch = await repository.createBranch(newName);

  t.is(branch.name, newName);

  await repository.deleteBranch(newName);
  t.is(branches.get(newName), undefined);
});

test('local get file', async t => {
  const provider = new LocalProvider({ workspace: tempy.directory() });
  const repository = await provider.repository(REPOSITORY_NAME);
  const branch = await repository.branch('master');

  const file = await branch.content('README.md');

  t.is(file.content.substring(0, 3), `xxx`);
});

test('local provider list files', async t => {
  const provider = new LocalProvider({ workspace: tempy.directory() });
  const repository = await provider.repository(REPOSITORY_NAME);
  const branch = await repository.branch('master');

  const files = await branch.list();

  t.is(files[0].path, 'README.md');
  t.is(files[0].type, 'blob');
});

test('local provider commit files', async t => {
  const provider = new LocalProvider({ workspace });

  if (process.env.SSH_AUTH_SOCK) {
    const repository = await provider.repository(REPOSITORY_NAME_GIT);
    const branch = await repository.branch('master');

    const file = await branch.content('README.md');

    let content = file.content;

    content += `\n${new Date()}`;

    const r = await branch.commit('test: ignore', [
      { path: 'README.md', content }
    ]);

    const file2 = await branch.content('README.md');

    t.is(content, file2.content);
  } else {
    t.is(1, 1, 'skip git@ test without SSH_AUTH_SOCK');
  }
});
