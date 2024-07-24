import * as path from "https://deno.land/std@0.224.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.224.0/fs/mod.ts";

import { setupOutputDirectory } from "./util.ts";
import { buildsData } from "./teller.types.ts";

if (import.meta.dirname === undefined) {
  console.error("No dirname?! WTF.");
  Deno.exit(1);
}
if (Deno.env.get("HOME") === undefined) {
  console.error("No $HOME? WTF.");
  Deno.exit(1);
}
const ROOT_DIR = path.join(import.meta.dirname, "..");
const BUILD_DIR = path.join(ROOT_DIR, "build");
const INSTALL_DIR = path.join(Deno.env.get("HOME")!, "Applications", "tellers");

const jsonFilepath = path.join(ROOT_DIR, "builds.json");
let jsonData: buildsData;
try {
  jsonData = JSON.parse(Deno.readTextFileSync(jsonFilepath));
} catch (error) {
  console.error(error);
  Deno.exit(1);
}

setupOutputDirectory(INSTALL_DIR);

const appList: string[] = [];
for (const entry of Deno.readDirSync(BUILD_DIR)) {
  if (!entry.isDirectory) {
    continue;
  }
  if (/^Teller.*\.app$/g.test(entry.name)) {
    appList.push(entry.name);
  }
}
appList.forEach((app) => {
  const appPath = path.join(BUILD_DIR, app);
  const destPath = path.join(INSTALL_DIR, app);
  fs.copySync(appPath, destPath, { overwrite: true });
});

const tellerPath = path.join(
  jsonData.usr_bin.replace("$HOME", Deno.env.get("HOME")!),
  "teller",
);
Deno.copyFileSync(
  path.join(ROOT_DIR, "scripts", "teller-wrapper.sh"),
  tellerPath,
);
Deno.chmodSync(tellerPath, 0o755);

console.log(
  "Now going to run test notifications so you can get permissions out of the way.",
);
appList.forEach((app) => {
  console.log(`    First execution of ${app}...`);
  const instPath = path.join(INSTALL_DIR, app);
  const runCmd = new Deno.Command(
    path.join(instPath, "Contents", "MacOS", "Teller"),
    {
      // deno-fmt-ignore
      args: [
            "--message", `Notifications work for ${app}!`,
            "--title", `${app.replace(/\.[^/.]+$/, "")} Notification`
        ],
    },
  );
  runCmd.outputSync();
});
