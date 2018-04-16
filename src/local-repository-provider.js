import { Provider, Repository, Branch } from 'repository-provider';
import { LocalRepository } from './local-repository';
import { LocalBranch } from './local-branch';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Provider using native git
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

  async repository(name) {
    let r = this.repositories.get(name);
    if (r === undefined) {
      r = new this.repositoryClass(this, name);
      await r.initialize(
        join(this.workspace, `r${this.repositories.size + 1}`)
      );
      this.repositories.set(name, r);
    }

    return r;
  }
}
