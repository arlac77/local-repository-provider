import { BasicEntry } from "repository-provider";
import { join } from "path";
import { createWriteStream } from "fs";


export class FileSystemEntry extends BasicEntry {
  constructor(name, baseDir) {
    super(name);
    Object.defineProperties(this, { baseDir: { value: baseDir } });
  }

  async getReadStream(options) {
    return createWriteStream(join(this.baseDir, this.name),options);
  }
}
