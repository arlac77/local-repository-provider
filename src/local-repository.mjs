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

  get execOptions() {
    return { cwd: this.workspace };
  }

  /**
   * exec git clone or git pull
   * @param {string} workspace
   */
  async _initialize(workspace) {
    await super._initialize();
    try {
      await stat(this.workspace);

      const remoteResult = await execa(
        "git",
        ["remote", "-v"],
        this.execOptions
      );
      const m = remoteResult.stdout.match(/origin\s+([^\s]+)\s+/);
      if (m && m[1] === this.name) {
        this.provider.trace(`git pull ${this.name} @${this.workspace}`);
        const result = await execa("git", ["pull"], this.execOptions);
      } else {
        throw new Error(`Unknown content in ${this.workspace}`);
      }
    } catch (e) {
      if (e.code === "ENOENT") {
        this.provider.trace(`git clone ${this.name} ${this.workspace}`);

        const result = await execa("git", [
          "clone",
          ...this.provider.cloneOptions,
          this.name,
          this.workspace
        ]);
      } else {
        throw e;
      }
    }
    await this.initializeBranches();
  }

  async initializeBranches() {
    const result = await execa("git", ["branch", "--list"], this.execOptions);

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
    return execa("git", ["push"], this.execOptions);
  }

  async _createBranch(name, from, options) {
    const result = await execa(
      "git",
      ["checkout", "-b", name],
      this.execOptions
    );

    return new this.provider.branchClass(this, name);
  }

  async deleteBranch(name) {
    await execa("git", ["checkout", "master"], this.execOptions);
    await execa("git", ["branch", "-D", name], this.execOptions);

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
    const g = await execa("git", ["show-ref", ref], this.execOptions);
    return g.stdout.split(/\s+/)[0];
  }
}
