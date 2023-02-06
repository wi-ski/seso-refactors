import * as invariant from "invariant";
import { Project } from "ts-morph";

import type { FSWatcher } from "chokidar";
import type { ProjectOptions } from "ts-morph";
// See: https://gist.github.com/petehunt/bee47e20701329792153453409b1922b

type TSMorphWatcherFsEvent = {
  path: string;
  type: "add" | "change" | "unlink";
};

type TSMorphWatcherEvent = TSMorphWatcherFsEvent | { type: "ready" };

class PromiseSignal<T> {
  private promise: Promise<T>;
  private resolve?: (value: T) => void;
  private resolved = false;

  constructor() {
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  public getPromise() {
    return this.promise;
  }

  public notify(value: T) {
    invariant(!this.resolved, "already resolved");
    this.resolved = true;
    this.resolve(value);
  }
}

export class TSMorphWatcher {
  private eventQueue: TSMorphWatcherEvent[] = [];
  private lastError: Error | null = null;
  private ready = false;
  private signal = new PromiseSignal<void>();
  private started = false;
  private project: Project;

  constructor(
    private projectOptions: ProjectOptions,
    private watcher: FSWatcher
  ) {
    this.project = new Project(projectOptions);
  }

  public async stop() {
    this.started = false;
  }

  public async getNext(): Promise<Project> {
    if (this.lastError) {
      const lastError = this.lastError;
      this.lastError = null;
      throw lastError;
    }

    if (!this.started) {
      console.log("Initiating watching fresh...");
      await this.start();
    }

    if (this.eventQueue.length === 0) {
      console.log("Starting promise signal...");
      // await this.signal.getPromise();
      console.log("Promise signal good...");
    }

    const eventQueue = this.eventQueue;
    this.eventQueue = [];
    this.signal = new PromiseSignal();

    for (const event of eventQueue) {
      if (event.type === "add") {
        console.log(`File watch change - add: ${event.path}`);
        this.project.addSourceFileAtPath(event.path);
      } else if (event.type === "change") {
        console.log(`File watch change - change: ${event.path}`);
        const path = event.path.toLowerCase();
        if (path.indexOf("tsconfig") > -1 && path.endsWith(".json")) {
          // create a fresh project when the tsconfig changes
          this.project = new Project(this.projectOptions);
        } else {
          const sourceFile = this.project.getSourceFile(event.path);
          if (sourceFile) {
            await sourceFile.refreshFromFileSystem();
          }
        }
      } else if (event.type === "unlink") {
        console.log(`File watch change - unlink: ${event.path}`);
        const sourceFile = this.project.getSourceFile(event.path);
        if (sourceFile) {
          this.project.removeSourceFile(sourceFile);
        }
      } else {
        // on ready, do nothing.
      }
    }
    console.log("Returning watched project...");
    return this.project;
  }

  private pushEvent(event: TSMorphWatcherEvent) {
    this.eventQueue.push(event);
    if (this.eventQueue.length === 1) {
      this.signal.notify();
    }
    setTimeout(() => this.getNext(), 100);
  }

  private async start() {
    console.log("Staring file watcher server binding...");
    invariant(!this.started, "already started");
    this.started = true;

    this.ready = false;
    console.log("Constructing project, this could take a while...");
    this.project = new Project(this.projectOptions);
    console.log("Project built...");

    this.watcher.on("ready", () => {
      this.ready = true;
      this.pushEvent({ type: "ready" });
    });

    this.watcher.on("add", (path) => {
      if (!this.ready) {
        return;
      }

      this.pushEvent({ path, type: "add" });
    });

    this.watcher.on("change", async (path) => {
      this.pushEvent({ path, type: "change" });
    });

    this.watcher.on("unlink", (path) => {
      this.pushEvent({ path, type: "unlink" });
    });

    this.watcher.on("error", (err) => {
      this.lastError = err;
    });
    console.log("Watch good to go...");
  }
}
// example usage:
// const watcher = new TsMorphWatcher({
//   tsConfigFilePath: require.resolve("../tsconfig.json"),
// });

// while (true) {
//   // getNext() waits until there is a change and returns a ts-morph Project instance.
//   // during getNext() it will update the project with any changes from the filesystem.
//   // getNext() will return a fresh Project instance if any file named tsconfig.json
//   // changes.
//   const project = await watcher.getNext();
//   // do something with project
// }
