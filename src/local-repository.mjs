import { stat } from "fs/promises";
import { execa } from "execa";
import { replaceWithOneTimeExecutionMethod } from "one-time-execution-method";
import { Repository } from "repository-provider";
import { refNamesFromString } from "./util.mjs";

/**
 * @property {string} workspace
 * @property {Branch} currentBranch
 */
export class LocalRepository extends Repository {
  static get attributes() {
    return {
      ...super.attributes,
      /**
       * workspace directory.
       * @return {string}
       */
      workspace: { type: "string" }
    };
  }

  get displayName() {
    return this.name.replace(/\.git$/,'').replace(/^[^:]+:\/\/([^\/]+\/)?/,'').replace(/\w+@([\.\w]+:)?/,'')
  }

  async exec(args, options = { cwd: this.workspace }) {
    return await execa("git", args, options);
  }

  get urls() {
    return [this.name];
  }

  async push(...args) {
    return this.exec(["push", ...args]);
  }

  async createBranch(name, from, options) {
    await this.exec(["checkout", "-b", name]);
    await this.exec(["push", "--set-upstream", "origin", name]);
    return super.addBranch(name, options);
  }

  /**
   * Set the current active branch (workspace)
   * @param {Branch} branch
   */
  async setCurrentBranch(branch) {
    if (this.currentBranch !== branch) {
      await this.exec(["checkout", "-q", "-f", branch.name]);
      //here is git pull needed after switching to new branch, else works with entries from previous branch
      await this.exec(["pull"]);
      this.currentBranch = branch;
    }
  }

  async deleteBranch(name) {
    await this.setCurrentBranch(await this.defaultBranch);
    await this.exec(["branch", "-D", name]);
    super.deleteBranch(name);
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

  async *tags(pattern) {
    await this.initialize();

    const result = await this.exec(["ls-remote", "--tags"]);

    for (const name of refNamesFromString(result.stdout)) {
      yield name;
    }
  }

  async initialize() {
    try {
      await stat(this.workspace);

      const remoteResult = await this.exec(["remote", "-v"]);
      const m = remoteResult.stdout.match(/origin\s+([^\s]+)\s+/);
      if (m && m[1] === this.name) {
        await this.exec(["pull"]);
      } else {
        throw new Error(`Unknown content in ${this.workspace}`);
      }
    } catch (e) {
      if (e.code === "ENOENT") {
        try {
          await this.exec(
            ["clone", ...this.provider.cloneOptions, this.name, this.workspace],
            {}
          );
        } catch (cloneException) {
          if (
            cloneException.stderr ===
            `fatal: repository '${this.name}' does not exist`
          ) {
            return undefined;
          }
          throw cloneException;
        }
      } else {
        throw e;
      }
    }

    return this;
  }

  /**
   * build lookup of all remote branches
   * ```sh
   * git ls-remote --heads
   * ```
   */
  async initializeBranches() {
    await this.initialize();

    const result = await this.exec(["ls-remote", "--heads"]);

    for (const name of refNamesFromString(result.stdout)) {
      new this.provider.branchClass(this, name);
    }
  }
}

replaceWithOneTimeExecutionMethod(LocalRepository.prototype, "initialize");
replaceWithOneTimeExecutionMethod(
  LocalRepository.prototype,
  "initializeBranches"
);
