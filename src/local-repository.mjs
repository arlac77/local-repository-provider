import execa from "execa";
import fs from "fs";
import { replaceWithOneTimeExecutionMethod } from "one-time-execution-method";
import { Repository } from "repository-provider";

import { refNamesFromString } from "./util.mjs";
const { stat } = fs.promises;

/**
 * @property {string} workspace
 * @property {Branch} currentBranch
 */
export class LocalRepository extends Repository {
  static get defaultOptions() {
    return {
      /**
       * workspace directory.
       * @return {string}
       */
      workspace: undefined,
      ...super.defaultOptions
    };
  }

  async exec(args, options = { cwd: this.workspace }) {
    return await execa("git", args, options);
  }

  /**
   * most significant part of the url
   * remove trailing .git
   * only use last directory of pathname
   * @return {string} name
   */
  get condensedName() {
    let name = this.name;
    const m = name.match(/^git@([^:]+):([^:]+)\/(.*)/);

    if (m) {
      name = m[3];
    } else {
      try {
        const url = new URL(name);
        const paths = url.pathname.split(/\//);
        name = paths[paths.length - 1];
      } catch (e) {}
    }

    name = name.replace(/\.git$/, "");
    return name;
  }

  get urls() {
    return [this.name];
  }

  async push(...args) {
    return this.exec(["push", ...args]);
  }

  async createBranch(name, from, options) {
    await this.exec(["checkout", "-b", name]);
    return super.addBranch(name, options);
  }

  /**
   * Set the current active branch (workspace)
   * @param {Branch} branch
   */
  async setCurrentBranch(branch) {
    if (this.currentBranch !== branch) {
      await this.exec(["checkout", "-q", "-f", /*"-b",*/ branch.name]);
      //here is git pull needed after switching to new branch, else works with entries from previous branch
      await this.exec(["pull"]);
      this.currentBranch = branch;
    }
  }

  async deleteBranch(name) {
    await this.setCurrentBranch(await this.defaultBranch);
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
        this.trace(`git pull ${this.name} @${this.workspace}`);
        await this.exec(["pull"]);
      } else {
        throw new Error(`Unknown content in ${this.workspace}`);
      }
    } catch (e) {
      if (e.code === "ENOENT") {
        this.trace(`git clone ${this.name} ${this.workspace}`);

        await this.exec(
          ["clone", ...this.provider.cloneOptions, this.name, this.workspace],
          {}
        );
      } else {
        throw e;
      }
    }
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
      const branch = new this.provider.branchClass(this, name);
      this._branches.set(branch.name, branch);
    }
  }
}

replaceWithOneTimeExecutionMethod(LocalRepository.prototype, "initialize");
replaceWithOneTimeExecutionMethod( LocalRepository.prototype, "initializeBranches");

