import { Repository } from 'repository-provider';
const execa = require('execa');
import { stat } from 'fs';
import { promisify } from 'util';

const pStat = promisify(stat);

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

  get urls() {
    return [this.name];
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
