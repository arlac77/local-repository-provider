import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execa } from "execa";
import { SingleGroupProvider, asArray } from "repository-provider";
import { LocalRepository } from "./local-repository.mjs";
import { LocalBranch } from "./local-branch.mjs";

/**
 * Provider using native git executable.
 * Known environment variables.
 * - GIT_CLONE_OPTIONS
 * @property {string} workspace
 */
export class LocalProvider extends SingleGroupProvider {
  /**
   * We are called local.
   * @return {string} local
   */
  static get name() {
    return "local";
  }

  /**
   * Default configuration options.
   * - workspace
   * - cloneOptions defaults to ["--depth", "8", "--no-single-branch"]
   * @return {Object}
   */
  static attributes = {
    // @ts-ignore
    ...super.attributes,
    cloneOptions: {
      env: "GIT_CLONE_OPTIONS",
      set: value => (typeof value === "object" ? value : value.split(/\s+/)),
      default: ["--depth", "8", "--no-single-branch"]
    },
    workspace: {
      default: tmpdir(),
      type: "string"
    }
  };

  /**
   * Generate path for a new workspace.
   * For the livetime of the provider always genrate new names
   * @param {string} name
   * @return {string} path
   */
  newWorkspacePath(name) {
    const hash = createHash("md5");
    hash.update(name);
    return join(this.workspace, hash.digest("hex"));
  }

  normalizeRepositoryName(name) {
    return name.trim().replace(/#.*$/, "");
  }

  /**
   * List branches for a given set of patterns.
   * Only delivers branches for valid complete git urls.
   * @param {string|string[]} patterns
   */
  async *branches(patterns) {
    for (const pattern of asArray(patterns)) {
      const branch = await this.branch(pattern);
      if (branch) {
        yield branch;
      }
    }
  }

  async createRepository(name, options) {
    const workspace = this.newWorkspacePath(name);
    await mkdir(workspace, { recursive: true });
    const repo = await super.createRepository(name, { workspace });
    await execa("git", ["init"], { cwd: workspace });
    return repo;
  }

  /**
   * List repositories for a given set of patterns.
   * Only delivers repositories for valid complete git urls.
   * @param {string[]|string} [patterns]
   */
  async *repositories(patterns) {
    for (const pattern of asArray(patterns)) {
      const repository = await this.repository(pattern);
      if (repository) {
        yield repository;
      }
    }
  }

  /**
   * Using provider workspace and number of repositories to create repository workspace.
   * @param {string} name
   * @param {string} [workspace] where to place the repos workspace
   */
  async repository(name, workspace) {
    if (name === undefined) {
      return;
    }
    name = this.normalizeRepositoryName(name);
    if (name.length < 2) {
      return;
    }

    let repository = await super.repository(name);
    if (repository === undefined) {
      try {
        repository = new this.repositoryClass(this, name, {
          workspace: workspace || this.newWorkspacePath(name)
        });

        await repository.initialize();
      } catch (err) {
        this.error(err);
        return;
      }
    }

    return repository;
  }

  async branch(name) {
    if (name === undefined) {
      return;
    }

    const repository = await this.repository(name);

    if (repository === undefined) {
      return;
    }

    const i = name.indexOf("#");

    return repository.branch(
      i >= 0 ? name.substring(i + 1) : repository.defaultBranchName
    );
  }

  get repositoryClass() {
    return LocalRepository;
  }

  get branchClass() {
    return LocalBranch;
  }
}

export default LocalProvider;
