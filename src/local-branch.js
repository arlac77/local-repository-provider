import { Branch } from "repository-provider";
import { join, dirname } from "path";
import globby from "globby";
import execa from "execa";
import { createWriteStream } from "fs";

const { readFile, mkdir } = require("fs").promises;

/**
 * @property {string} workspace
 */
export class LocalBranch extends Branch {
  get workspace() {
    return this.repository.workspace;
  }

  get execOptions() {
    return this.repository.execOptions;
  }

  /**
   * writes Entry into the branch
   * @param {Entry[]} entry
   * @return {Promise<Entry[]>} written entries
   */
  async writeEntries(entry) {
    await Promise.all(
      entry.map(b =>
        mkdir(dirname(join(this.workspace, b.name), { recursive: true }))
      )
    );

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

    await execa("git", ["add", ...entry.map(b => b.name)], this.execOptions);

    return entry;
  }

  /**
   * Excutes:
   * - writes all updates into the workspace
   * - git add
   * - git commit
   * - git push
   * @param {string} message commit message
   * @param {Entry[]} updates file entry to be commited
   * @param {Object} options
   */
  async commit(message, entries, options) {
    await this.writeEntries(entries);
    await execa("git", ["commit", "-m", message], this.execOptions);
    await execa(
      "git",
      ["push", "--set-upstream", "origin", this.name],
      this.execOptions
    );
  }

  /**
   * Search for patch in the branch
   * @param {string[]} matchingPatterns
   * @return {Entry} matching branch path names
   */
  async *entries(matchingPatterns = ["**/.*", "**/*"]) {
    for (const name of await globby(matchingPatterns, {
      cwd: this.workspace
    })) {
      yield new this.entryClass(name, await readFile(join(this.workspace, name)));
    }
  }

  async entry(name) {
    return new this.entryClass(
      name,
      await readFile(join(this.workspace, name))
    );
  }

  async createPullRequest(to, message) {
    return new this.provider.pullRequestClass(this, to, "0", {
      title: "please create pull request manually"
    });
  }
}
