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

  async content(fileName, options = {}) {
    try {
      const d = readFile(join(this.workspace, fileName), {
        encoding: "utf8"
      });

      return new Content(fileName, await d);
    } catch (e) {
      if (options.ignoreMissing) {
        return new Content(fileName, "");
      }
      throw e;
    }
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
  async commit(message, updates, options = {}) {
    await Promise.all(
      updates.map(b => makeDir(dirname(join(this.workspace, b.path))))
    );

    await Promise.all(
      updates.map(b => writeFile(join(this.workspace, b.path), b.content))
    );

    const execaOptions = {
      cwd: this.workspace
    };

    await execa("git", ["add", ...updates.map(b => b.path)], execaOptions);
    await execa("git", ["commit", "-m", message], execaOptions);
    await execa(
      "git",
      ["push", "--set-upstream", "origin", this.name],
      execaOptions
    );
  }

  async list() {
    return (await globby(["**/.*", "**/*"], { cwd: this.workspace })).map(f => {
      return { path: f, type: "blob" };
    });
  }

  async createPullRequest(to, message) {
    return new this.provider.pullRequestClass(this.repository, "0", {
      title: "please create pull request manually"
    });
  }
}
