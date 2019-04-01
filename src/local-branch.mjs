import { Branch } from "repository-provider";
import { join, dirname } from "path";
import globby from "globby";
import fs, { createWriteStream } from "fs";
import { FileSystemEntry } from "content-entry";
const { readFile, mkdir } = fs.promises;

/**
 * @property {string} workspace
 */
export class LocalBranch extends Branch {
  get workspace() {
    return this.repository.workspace;
  }

  async activate() {
    await this.repository.exec(["checkout", this.name]);
  }

  /**
   * writes Entry into the branch
   * @param {Entry[]} entry
   * @return {Promise<Entry[]>} written entries
   */
  async writeEntries(entry) {
    try {
      await Promise.all(
        entry.map(b =>
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

      for (const u of entry) {
        const o = createWriteStream(join(this.workspace, u.name));
        o.on("error", error => reject(error));

        o.on("finish", () => {
          ongoing--;
          if (ongoing <= 0) {
            resolve(entry);
          }
        });

        (await u.getReadStream()).pipe(o);
        ongoing++;
      }
    });

    await this.repository.exec(["add", ...entry.map(b => b.name)]);

    return entry;
  }

  /**
   * Excutes:
   * - writes all updates into the workspace
   * - git add
   * - git commit
   * - git push
   * @param {string} message commit message
   * @param {Entry[]} entries file entries to be commited
   * @param {Object} options
   */
  async commit(message, entries, options) {
    await this.writeEntries(entries);
    await this.repository.exec(["commit", "-m", message]);
    await this.repository.exec(["push", "--set-upstream", "origin", this.name]);
  }

  /**
   * Search for patch in the branch
   * @param {string[]} matchingPatterns
   * @return {Iterable<Entry>} matching branch path names
   */
  async *entries(matchingPatterns = ["**/.*", "**/*"]) {
    await this.activate();
    for (const name of await globby(matchingPatterns, {
      cwd: this.workspace
    })) {
      yield new this.entryClass(name, this.workspace);
    }
  }

  /**
   * Search for patch in the branch
   * @return {Entry} matching branch path names
   */
  async entry(name) {
    await this.activate();

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
