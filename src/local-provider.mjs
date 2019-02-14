import { Provider, Repository, Branch } from "repository-provider";
import { LocalRepository } from "./local-repository";
import { LocalBranch } from "./local-branch";
import { join } from "path";
import { tmpdir } from "os";
import fs from "fs";
const { stat } = fs.promises;

/**
 * Provider using native git executable
 *
 * @property {string} workspace
 */
export class LocalProvider extends Provider {
  /**
   * - GIT_CLONE_OPTIONS
   */
  static optionsFromEnvironment(env) {
    if (env.GIT_CLONE_OPTIONS !== undefined) {
      return { cloneOptions: env.GIT_CLONE_OPTIONS.split(/\s+/) };
    }
    return undefined;
  }

  /**
   * Default configuration options
   * - workspace
   * - cloneOptions
   * @return {Object}
   */
  static get defaultOptions() {
    return { cloneOptions: [], workspace: tmpdir() };
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
    if (name === undefined) {
      return undefined;
    }

    let repository = this._repositories.get(name);
    if (repository === undefined) {
      repository = new this.repositoryClass(this, name, {
        workspace: await this.newWorkspacePath()
      });

      this._repositories.set(repository.name, repository);
    }

    return repository;
  }
}
