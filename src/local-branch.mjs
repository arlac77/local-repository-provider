import { join, dirname } from "path";
import globby from "globby";
import fs, { createWriteStream } from "fs";
import { FileSystemEntry } from "content-entry";
import { Branch } from "repository-provider";
const { mkdir } = fs.promises;

/**
 * @property {string} workspace
 */
export class LocalBranch extends Branch {
  get workspace() {
    return this.repository.workspace;
  }

  /**
   * writes ContentEntries into the branch
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
        const o = createWriteStream(join(this.workspace, u.name));
        o.on("error", error => reject(error));

        o.on("finish", () => {
          ongoing--;
          if (ongoing <= 0) {
            resolve();
          }
        });

        (await u.getReadStream()).pipe(o);
        ongoing++;
      }
    });

    await this.repository.exec(["add", ...entries.map(b => b.name)]);

    return entries;
  }

  /**
   * Excutes:
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
   * Search for patch in the branch
   * @param {string[]} matchingPatterns
   * @return {Iterable<Entry>} matching branch path names
   */
  async *entries(matchingPatterns = ["**/.*", "**/*"]) {
    await this.repository.setCurrentBranch(this);
    for (const name of await globby(matchingPatterns, {
      cwd: this.workspace
    })) {
      yield new this.entryClass(name, this.workspace);
    }
  }

  /**
   * Search for patch in the branch
   * @param {string} name
   * @return {Entry} matching branch path names
   */
  async entry(name) {
    await this.repository.setCurrentBranch(this);

    const entry = new FileSystemEntry(name, this.workspace);
    if (await entry.getExists()) {
      return entry;
    }
    throw new Error(`file not found: ${name}`);
  }

  async createPullRequest(to, message) {
    return new this.provider.pullRequestClass(this, to, "0", {
      title: `please create pull request manually from ${this.url}`
    });
  }

  get entryClass() {
    return FileSystemEntry;
  }
}
