import { Branch, Content } from "repository-provider";
import { join, dirname } from "path";
import makeDir from "make-dir";
import globby from "globby";
import execa from "execa";
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
    await Promise.all(
      updates.map(b => makeDir(dirname(join(this.workspace, b.path))))
    );

    await Promise.all(
      updates.map(b => writeFile(join(this.workspace, b.path), b.content))
    );

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
   * @return {Object }[] matching branch path names
   */
  async *list(matchingPatterns = ["**/.*", "**/*"]) {
    for (const entry of await globby(matchingPatterns, {
      cwd: this.workspace
    })) {
      yield { path: entry, type: "blob" };
    }
  }

  async createPullRequest(to, message) {
    return new this.provider.pullRequestClass(this.repository, "0", {
      title: "please create pull request manually"
    });
  }
}
