import { Branch, Content } from "repository-provider";
import { join, dirname } from "path";
import makeDir from "make-dir";
import globby from "globby";
import execa from "execa";
import { createWriteStream, promises } from "fs";

const { readFile, writeFile } = require("fs").promises;

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

  async content(fileName, options = { encoding: "utf8" }) {
    return new Content(
      fileName,
      await readFile(join(this.workspace, fileName), options)
    );
  }

  async write(updates) {
    await Promise.all(
      updates.map(b => makeDir(dirname(join(this.workspace, b.path))))
    );

    return new Promise((resolve, reject) => {
      let ongoing = 0;

      for (const u of updates) {
        const o = createWriteStream(join(this.workspace, u.path));
        o.on('error', error => reject(error));

        o.on("finish", () => {
          ongoing--;
          if(ongoing <= 0) {
            resolve();
          }
          //console.error("All writes are now complete.");
        });

        u.toStream().pipe(o);
        ongoing++;

        //console.log(`pipe into ${join(this.workspace, u.path)}`);
      }
    });

    /*
    return Promise.all(
      updates.map(b => writeFile(join(this.workspace, b.path), b.content))
    );
    */
  }

  /**
   * Excutes:
   * - writes all updates into the workspace
   * - git add
   * - git commit
   * - git push
   * @param {string} message commit message
   * @param {Content[]} updates file content to be commited
   * @param {Object} options
   */
  async commit(message, updates, options) {
    await this.write(updates);
    await execa("git", ["add", ...updates.map(b => b.path)], this.execOptions);
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
   * @return {Content} matching branch path names
   */
  async *list(matchingPatterns = ["**/.*", "**/*"]) {
    for (const entry of await globby(matchingPatterns, {
      cwd: this.workspace
    })) {
      yield new Content(entry);
    }
  }

  async createPullRequest(to, message) {
    return new this.provider.pullRequestClass(this.repository, "0", {
      title: "please create pull request manually"
    });
  }
}
