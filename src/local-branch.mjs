import { join, dirname } from "path";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { pipeline } from "stream";
import { globby } from "globby";
import { Branch } from "repository-provider";
import { FileSystemEntry } from "content-entry-filesystem";

/**
 * @property {string} workspace
 */
export class LocalBranch extends Branch {
  get workspace() {
    return this.owner.workspace;
  }

  /**
   * Writes ContentEntries into the branch
   * @param {ContentEntry[]} entries
   * @return {Promise<ContentEntry[]>} written entries
   */
  async writeEntries(entries) {
    await this.owner.setCurrentBranch(this);
    try {
      await Promise.all(
        entries.map(b =>
          mkdir(dirname(join(this.workspace, b.name), { recursive: true }))
        )
      );
    } catch (e) {
      // TODO how can this happen ?
      if (e.code !== "EEXIST") {
        throw e;
      }
    }

    await new Promise(async (resolve, reject) => {
      let ongoing = 0;

      for (const u of entries) {
        ongoing++;

        pipeline(
          await u.getReadStream(),
          createWriteStream(join(this.workspace, u.name)),
          err => {
            if (err) {
              reject(err);
            } else {
              ongoing--;
              if (ongoing <= 0) {
                resolve();
              }
            }
          }
        );
      }
    });

    await this.owner.exec(["add", ...entries.map(entry => entry.name)]);

    return entries;
  }

  /**
   * Executes:
   * - writes all updates into the workspace
   * - git add
   * - git commit
   * - git push --set-upstream origin
   * @param {string} message commit message
   * @param {ContentEntry[]} entries file entries to be commited
   * @param {Object} options
   * @param {boolean} options.push exec push after commit
   */
  async commit(message, entries, options = { push: true }) {
    await this.writeEntries(entries);
    await this.owner.exec(["commit", "-m", message]);
    if (options.push) {
      await this.owner.push("--set-upstream", "origin", this.name);
    }
  }

  /**
   * Deliver all matchine entires for a given pattern.
   * @param {string[]} matchingPatterns
   * @return {Iterable<ContentEntry>} matching branch path names
   */
  async *entries(matchingPatterns = ["**/*"]) {
    if (!Array.isArray(matchingPatterns)) {
      matchingPatterns = [matchingPatterns];
    }
    matchingPatterns.push("!.git");

    await this.owner.setCurrentBranch(this);
    for (const name of await globby(matchingPatterns, {
      cwd: this.workspace,
      dot: true
    })) {
      yield new this.entryClass(name, this.workspace);
    }
  }

  /**
   * Search for path in the branch.
   * @param {string} name
   * @return {ContentEntry} matching branch path names
   */
  async entry(name) {
    await this.owner.setCurrentBranch(this);

    const entry = new FileSystemEntry(name, this.workspace);
    if (await entry.isExistent) {
      return entry;
    }
    throw new Error(`file not found: ${name}`);
  }

  /**
   * Search for path in the branch.
   * @param {string} name
   * @return {ContentEntry} matching branch path names
   */
  async maybeEntry(name) {
    await this.owner.setCurrentBranch(this);

    const entry = new FileSystemEntry(name, this.workspace);
    if (await entry.isExistent) {
      return entry;
    }
    return undefined;
  }

  async removeEntries(entries) {
    await this.owner.exec(["delete", ...entries.map(entry => entry.name)]);
  }

  async createPullRequest(to, message) {
    return new this.provider.pullRequestClass(this, to, "0", {
      title: `please create pull request manually from ${this.url}`
    });
  }

  get fullCondensedName() {
    return this.isDefault
      ? this.owner.condensedName
      : `${this.owner.condensedName}#${this.name}`;
  }
}
