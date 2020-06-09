import { join } from "path";
import { tmpdir } from "os";
import fs from "fs";
import { SingleGroupProvider, asArray } from "repository-provider";
import { LocalRepository } from "./local-repository.mjs";
import { LocalBranch } from "./local-branch.mjs";

const { stat } = fs.promises;

/**
 * Provider using native git executable
 *
 * @property {string} workspace
 */
export class LocalProvider extends SingleGroupProvider {
  /**
   * - GIT_CLONE_OPTIONS
   */
  static get environmentOptions() {
    return {
      GIT_CLONE_OPTIONS: {
        path: "cloneOptions",
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

  normalizeRepositoryName(name) {
    name = name.trim();
    return name;
  }

  async *repositoryGroups(name) {
    console.log("X repositoryGroups",name);
    if (name !== undefined) {
      if (name.match("^(git|http)")) {
        yield this;
      }
    }
  }

  async *branches(pattern) {
    for(const name of asArray(pattern)) {
      console.log("X branches",name);
      if (name !== undefined) {
        if (name.match("^(git|http)")) {
          yield this.branch(name);
        }
      }
    }
  }

  /**
   * using provider workspace and number of repositories to create repository workspace
   * @param {string} name
   * @param {string} workspace where to place the repos workspace @see #newWorkspacePath
   */
  async repository(name, workspace) {
    console.log("REPOSITORY", name);

    if (name === undefined) {
      return undefined;
    }
    name = this.normalizeRepositoryName(name);
    if (name.length < 2) {
      return undefined;
    }

    let repository = this._repositories.get(name);
    if (repository === undefined) {
      try {
        repository = new this.repositoryClass(this, name, {
          workspace: workspace ? workspace : await this.newWorkspacePath()
        });

        await repository.initialize();

        this._repositories.set(repository.name, repository);
      } catch {}
    }

    return repository;
  }

  async branch(name) {
    console.log("BRANCH", name);

    if (name === undefined) {
      return undefined;
    }

    const repository = await this.repository(name);

    console.log("BRANCH REPOSITORY", repository);

    if (repository === undefined) {
      return undefined;
    }

    const m = name.match(/#(.+)$/);

    return repository.branch(m ? m[1] : repository.defaultBranchName);
  }
}

export default LocalProvider;
