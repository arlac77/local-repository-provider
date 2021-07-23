import { join, dirname } from "path";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { pipeline } from "stream";
import { globby } from "globby";
import { FileSystemEntry } from "content-entry-filesystem";
import { Branch } from "repository-provider";

/**
 * @property {string} workspace
 */
export class LocalBranch extends Branch {
  get workspace() {
    return this.repository.workspace;
  }

  /**
   * Writes ContentEntries into the branch
   * @param {ContentEntry[]} entries
   * @return {Promise<ContentEntry[]>} written entries
   */
  async writeEntries(entries) {
    await this.repository.setCurrentBranch(this);
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

    await this.repository.exec(["add", ...entries.map(entry => entry.name)]);

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
   */
  async commit(message, entries, options) {
    await this.writeEntries(entries);
    await this.repository.exec(["commit", "-m", message]);
    await this.repository.push("--set-upstream", "origin", this.name);
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

    await this.repository.setCurrentBranch(this);
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
    await this.repository.setCurrentBranch(this);

    const entry = new FileSystemEntry(name, this.workspace);
    if (await entry.getExists()) {
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
    await this.repository.setCurrentBranch(this);

    const entry = new FileSystemEntry(name, this.workspace);
    if (await entry.getExists()) {
      return entry;
    }
    return undefined;
  }

  async removeEntries(entries) {
    await this.repository.exec(["delete", ...entries.map(entry => entry.name)]);
  }

  async createPullRequest(to, message) {
    return new this.provider.pullRequestClass(this, to, "0", {
      title: `please create pull request manually from ${this.url}`
    });
  }

  get entryClass() {
    return FileSystemEntry;
  }

  get fullCondensedName() {
    return this.isDefault
      ? this.repository.condensedName
      : `${this.repository.condensedName}#${this.name}`;
  }
}
