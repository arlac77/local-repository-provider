import { Provider, Repository, Branch } from "repository-provider";
import { LocalRepository } from "./local-repository";
import { LocalBranch } from "./local-branch";
import { join } from "path";
import { tmpdir } from "os";

const { stat } = require("fs").promises;

/**
 * Provider using native git executable
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

  /**
   * Generate path for a new workspace
   * For the livetime of the provider always genrate new names
   * @return {string} path
   */
  async newWorkspacePath() {
    do {
      this._nextWorkspace =
        this._nextWorkspace === undefined ? 1 : this._nextWorkspace + 1;

      let w = join(this.workspace, `r${this._nextWorkspace}`);
      try {
        const s = await stat(w);
      } catch (e) {
        return w;
      }
    } while (true);
  }

  /**
   * using provider workspace and number of repositories to create repository workspace
   * @param {string} name
   */
  async repository(name) {
    let r = this.repositories.get(name);
    if (r === undefined) {
      if (name === undefined) {
        return undefined;
      }

      r = new this.repositoryClass(this, name);
      await r.initialize(await this.newWorkspacePath());
      this.repositories.set(name, r);
    }

    return r;
  }
}
