import { Provider, Repository, Branch, Content } from 'repository-provider';
import { stat, readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const makeDir = require('make-dir');
const execa = require('execa');
const globby = require('globby');

const pStat = promisify(stat);
const pReadFile = promisify(readFile);
const pWriteFile = promisify(writeFile);

export class LocalProvider extends Provider {
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
      await r.initialize();
      this.repositories.set(name, r);
    }

    return r;
  }
}

export class LocalRepository extends Repository {
  get workspace() {
    return join(this.provider.config.workspace, this.name);
  }

  async initialize() {
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

  async commit(message, blobs, options = {}) {
    await Promise.all(
      blobs.map(b => pWriteFile(join(this.workspace, b.path), b.content))
    );

    await execa('git', ['add', ...blobs.map(b => b.path)], {
      cwd: this.workspace
    });

    await execa('git', ['commit', '-m', message], {
      cwd: this.workspace
    });
  }

  async list() {
    return (await globby(['**/*'], { cwd: this.workspace })).map(f => {
      return { path: f, type: 'blob' };
    });
  }

  async createPullRequest(to, message) {
    console.log(
      `create pull request from ${this.name} to ${to.name} ${message}`
    );
  }
}
