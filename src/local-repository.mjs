import { Repository } from "repository-provider";
import execa from "execa";
import fs from "fs";
const { stat } = fs.promises;

/**
 * @property {string} workspace
 */
export class LocalRepository extends Repository {
  static get defaultOptions() {
    return Object.assign(
      {
        /**
         * workspace directory.
         * @return {string}
         */
        workspace: undefined
      },
      super.defaultOptions
    );
  }

  async exec(args, options = { cwd: this.workspace }) {
    return await execa("git", args, options);
  }

  /**
   * exec git clone or git pull
   * @param {string} workspace
   */
  async _initialize(workspace) {
    await super._initialize();
    try {
      await stat(this.workspace);

      const remoteResult = await this.exec(["remote", "-v"]);
      const m = remoteResult.stdout.match(/origin\s+([^\s]+)\s+/);
      if (m && m[1] === this.name) {
        this.provider.trace(`git pull ${this.name} @${this.workspace}`);
        await this.exec(["pull"]);
      } else {
        throw new Error(`Unknown content in ${this.workspace}`);
      }
    } catch (e) {
      if (e.code === "ENOENT") {
        this.provider.trace(`git clone ${this.name} ${this.workspace}`);

        await this.exec(
          ["clone", ...this.provider.cloneOptions, this.name, this.workspace],
          {}
        );
      } else {
        throw e;
      }
    }
    await this.initializeBranches();
  }

  async initializeBranches() {
    const result = await this.exec(["branch", "--list"]);

    result.stdout.split(/\n/).forEach(b => {
      const m = b.match(/^(\*\s+)?([^\s]+)/);
      if (m) {
        const name = m[2];
        const branch = new this.provider.branchClass(this, name);
        this._branches.set(branch.name, branch);
      }
    });
  }

  /**
   * most significant part of the url
   * remove trailing .git
   * only last directory of use pathname
   * @return {string} name
   */
  get condensedName() {
    let name = new URL(this.name);
    const paths = name.pathname.split(/\//);
    name = paths[paths.length - 1 ];
    name = name.replace(/\.git$/,'');
    return name;
  }


  get urls() {
    return [this.name];
  }

  async push() {
    return this.exec(["push"]);
  }

  async _createBranch(name, from, options) {
    await this.exec(["checkout", "-b", name]);

    return new this.provider.branchClass(this, name);
  }

  async deleteBranch(name) {
    await this.exec(["checkout", "master"]);
    await this.exec(["branch", "-D", name]);

    this._branches.delete(name);
  }

  /**
   * Get sha of a ref
   * Calls
   * ```sh
   * git show-ref <ref>
   * ```
   * @param {string} ref
   * @return {string} sha of the ref
   */
  async refId(ref) {
    const g = await this.exec(["show-ref", ref], {});
    return g.stdout.split(/\s+/)[0];
  }
}
