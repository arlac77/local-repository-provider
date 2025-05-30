import { join, dirname } from "node:path";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { pipeline } from "node:stream";
import { globby } from "globby";
import { Branch, CommitResult } from "repository-provider";
import { FileSystemEntry } from "content-entry-filesystem";
import { ContentEntry } from "content-entry";

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
          mkdir(dirname(join(this.workspace, b.name)), { recursive: true })
        )
      );
    } catch (e) {
      // TODO how can this happen ?
      if (e.code !== "EEXIST") {
        throw e;
      }
    }

    await /** @type {Promise<void>} */ (
      new Promise(async (resolve, reject) => {
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
      })
    );

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
    return new CommitResult("");
  }

  /**
   * Deliver all matchine entires for a given pattern.
   * @param {string[]|string} matchingPatterns
   * @return {AsyncGenerator<ContentEntry>} matching branch path names
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
      yield new FileSystemEntry(name, this.workspace);
    }
  }

  /**
   * Search for path in the branch.
   * @param {string} name
   * @return {Promise<ContentEntry>} matching branch path names
   */
  async entry(name) {
    await this.owner.setCurrentBranch(this);

    const entry = new FileSystemEntry(name, this.workspace);
    if (await entry.isExistent) {
      // @ts-ignore
      return entry;
    }
    throw new Error(`file not found: ${name}`);
  }

  /**
   * Search for path in the branch.
   * @param {string} name
   * @return {Promise<ContentEntry|undefined>} matching branch path names
   */
  async maybeEntry(name) {
    await this.owner.setCurrentBranch(this);

    const entry = new FileSystemEntry(name, this.workspace);
    if (await entry.isExistent) {
      // @ts-ignore
      return entry;
    }
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
