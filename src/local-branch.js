import { Branch, Content } from 'repository-provider';
const execa = require('execa');
const globby = require('globby');
import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const pReadFile = promisify(readFile);
const pWriteFile = promisify(writeFile);

/**
 * @property {string} workspce
 */
export class LocalBranch extends Branch {
  get workspace() {
    return this.repository.workspace;
  }

  async content(fileName, options = {}) {
    try {
      const d = pReadFile(join(this.workspace, fileName), {
        encoding: 'utf8'
      });

      return new Content(fileName, await d);
    } catch (e) {
      if (options.ignoreMissing) {
        return new Content(fileName, '');
      }
      throw e;
    }
  }

  /**
   * Excutes:
   * - git add
   * - git commit
   * - git push
   */
  async commit(message, blobs, options = {}) {
    await Promise.all(
      blobs.map(b => pWriteFile(join(this.workspace, b.path), b.content))
    );

    const execaOptions = {
      cwd: this.workspace
    };

    await execa('git', ['add', ...blobs.map(b => b.path)], execaOptions);
    await execa('git', ['commit', '-m', message], execaOptions);
    await execa(
      'git',
      ['push', '--set-upstream', 'origin', this.name],
      execaOptions
    );
  }

  async list() {
    return (await globby(['**/.*', '**/*'], { cwd: this.workspace })).map(f => {
      return { path: f, type: 'blob' };
    });
  }

  async createPullRequest(to, message) {
    return new this.provider.pullRequestClass(this.repository, '0', {
      title: 'plese create pull request manually'
    });
  }
}
