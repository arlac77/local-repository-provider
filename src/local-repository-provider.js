import { Provider, Repository, Branch, Content } from 'repository-provider';
import { stat, readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { tmpdir } from 'os';

const makeDir = require('make-dir');
const execa = require('execa');
const globby = require('globby');

const pStat = promisify(stat);
const pReadFile = promisify(readFile);
const pWriteFile = promisify(writeFile);

/**
 * Provider using native git
 */
export class LocalProvider extends Provider {
  /**
   * Default configuration options
   * - workspace
   * @return {Object}
   */
  static get defaultOptions() {
    return { workspace: tmpdir() };
  }

  /**
   * @return {Object} empty object
   */
  static optionsFromEnvironment(env) {
    return {};
  }

  get workspace() {
    return this.config.workspace;
  }

  get repositoryClass() {
    return LocalRepository;
  }

  get branchClass() {
    return LocalBranch;
  }

  async repository(name) {
    let r = this.repositories.get(name);
    if (r === undefined) {
      r = new this.repositoryClass(this, name);
      await r.initialize(
        join(this.workspace, `r${this.repositories.size + 1}`)
      );
      this.repositories.set(name, r);
    }

    return r;
  }
}

/**
 * @property {string} workspace
 */
export class LocalRepository extends Repository {
  /**
   * exec git clone or git pull
   * @param {string} workspace
   */
  async initialize(workspace) {
    Object.defineProperty(this, 'workspace', { value: workspace });
    await super.initialize();
    try {
      await pStat(this.workspace);
      const result = await execa('git', ['pull'], { cwd: this.workspace });
    } catch (e) {
      const result = await execa('git', ['clone', this.name, this.workspace]);
    }
    await this.initializeBranches();
  }

  async initializeBranches() {
    const result = await execa('git', ['branch'], {
      cwd: this.workspace
    });

    result.stdout.split(/\n/).forEach(b => {
      const m = b.match(/^\*?\s*([^\s]+)/);
      if (m) {
        const name = m[1];
        const branch = new this.provider.branchClass(this, name);
        this._branches.set(branch.name, branch);
      }
    });
  }

  async push() {
    return execa('git', ['push'], {
      cwd: this.workspace
    });
  }

  async createBranch(name, from) {
    const result = await execa('git', ['checkout', '-b', name], {
      cwd: this.workspace
    });

    const b = new this.provider.branchClass(this, name);
    this._branches.set(b.name, b);
    return b;
  }

  async deleteBranch(name) {
    await execa('git', ['checkout', 'master'], {
      cwd: this.workspace
    });

    const result = await execa('git', ['branch', '-D', name], {
      cwd: this.workspace
    });

    this._branches.delete(name);
  }
}

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
    return (await globby(['**/*'], { cwd: this.workspace })).map(f => {
      return { path: f, type: 'blob' };
    });
  }

  async createPullRequest(to, message) {
    return new this.provider.pullRequestClass(this.repository, '0', {
      title: 'plese create pull request manually'
    });
  }
}
