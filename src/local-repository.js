import { stat } from 'fs';
import { promisify } from 'util';
import { Repository } from 'repository-provider';
import execa from 'execa';

const pStat = promisify(stat);

/**
 * @property {string} workspace
 */
export class LocalRepository extends Repository {
  /**
   * exec git clone or git pull
   * @param {string} workspace
   */
  async _initialize(workspace) {
    Object.defineProperty(this, 'workspace', { value: workspace });
    await super._initialize();
    try {
      await pStat(this.workspace);
      const result = await execa('git', ['pull'], { cwd: this.workspace });
    } catch (e) {
      if (e.code === 'ENOENT') {
        const result = await execa('git', ['clone', this.name, this.workspace]);
      } else {
        throw e;
      }
    }
    await this.initializeBranches();
  }

  async initializeBranches() {
    const result = await execa('git', ['branch', '--list'], {
      cwd: this.workspace
    });

    result.stdout.split(/\n/).forEach(b => {
      const m = b.match(/^(\*\s+)?([^\s]+)/);
      if (m) {
        const name = m[2];
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
    const options = {
      cwd: this.workspace
    };

    await execa('git', ['checkout', 'master'], options);
    const result = await execa('git', ['branch', '-D', name], options);

    this._branches.delete(name);
  }
}
