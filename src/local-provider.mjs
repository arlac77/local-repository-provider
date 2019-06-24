import { join } from "path";
import { tmpdir } from "os";
import fs from "fs";
import { Provider } from "repository-provider";
import { LocalRepository } from "./local-repository.mjs";
import { LocalBranch } from "./local-branch.mjs";

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
  static get environmentOptions() {
    return {
      GIT_CLONE_OPTIONS: {
        path: 'cloneOptions',
        parse: value => value.split(/\s+/)
      }
    };
  }

  /**
   * Default configuration options
   * - workspace
   * - cloneOptions defaults to ["--depth", "10", "--no-single-branch"]
   * @return {Object}
   */
  static get defaultOptions() {
    return {
      cloneOptions: ["--depth", "10", "--no-single-branch"],
      workspace: tmpdir()
    };
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
   * @param {string} workspace where to place the repos workspace @see #newWorkspacePath
   */
  async repository(name, workspace) {
    if (name === undefined) {
      return undefined;
    }

    let repository = this._repositories.get(name);
    if (repository === undefined) {
      repository = new this.repositoryClass(this, name, {
        workspace: workspace ? workspace : await this.newWorkspacePath()
      });

      this._repositories.set(repository.name, repository);
    }

    return repository;
  }
}

export default LocalProvider;
