import { Branch, Content } from "repository-provider";
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

  async content(fileName, options = { encoding: "utf8" }) {
    return new Content(
      fileName,
      await readFile(join(this.workspace, fileName), options)
    );
  }

  /**
   * writes content into the branch
   * @param {Content[]} content
   * @return {Promise<Content[]>} written content
   */
  async writeContent(content) {
    await Promise.all(
      content.map(b =>
        mkdir(dirname(join(this.workspace, b.name), { recursive: true }))
      )
    );

    await new Promise(async (resolve, reject) => {
      let ongoing = 0;

      for (const u of content) {
        const o = createWriteStream(join(this.workspace, u.name));
        o.on("error", error => reject(error));

        o.on("finish", () => {
          ongoing--;
          if (ongoing <= 0) {
            resolve(content);
          }
        });

        (await u.getReadStream()).pipe(o);
        ongoing++;
      }
    });

    await execa("git", ["add", ...content.map(b => b.name)], this.execOptions);

    return content;
    /*
    return Promise.all(
      updates.map(b => writeFile(join(this.workspace, b.name), b.content))
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
    await this.writeContent(updates);
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
  async *entries(matchingPatterns = ["**/.*", "**/*"]) {
    for (const entry of await globby(matchingPatterns, {
      cwd: this.workspace
    })) {
      yield new Content(entry);
    }
  }

  async createPullRequest(to, message) {
    return new this.provider.pullRequestClass(this, to, "0", {
      title: "please create pull request manually"
    });
  }
}
