import * as path from "https://deno.land/std@0.224.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.224.0/fs/mod.ts";

import { extractEmoji, writeAppIconSet } from "./extractEmoji.ts";
import { setupOutputDirectory } from "./util.ts";
import { buildsData } from "./teller.types.ts";

if (import.meta.dirname === undefined) {
    console.error("No dirname?! WTF.");
    Deno.exit(1);
}
const ROOT_DIR = path.join(import.meta.dirname, "..");
const BUILD_DIR = path.join(ROOT_DIR, "build");
const TMP_DIR = path.join(BUILD_DIR, "tmp");
const BASE_APP = path.join(BUILD_DIR, "Teller.app");

const jsonFilepath = path.join(ROOT_DIR, "builds.json");
let jsonData: buildsData;
try {
    jsonData = JSON.parse(Deno.readTextFileSync(jsonFilepath));
} catch (error) {
    console.error(error);
    Deno.exit(1);
}

setupOutputDirectory(TMP_DIR);

if (!fs.existsSync(BASE_APP)) {
    const archivePath = path.join(BUILD_DIR, "Teller.xcarchive");
    const buildCmd = new Deno.Command("xcodebuild", {
        args: [
            "-scheme", "Teller",
            "-archivePath", archivePath,
            "archive"
        ]
    });
    console.info("Building base app...");
    const output = buildCmd.outputSync();
    if (!output.success) {
        console.error(output.stderr);
        Deno.exit(1);
    }
    Deno.renameSync(path.join(archivePath, "Products", "Applications", "Teller.app"), BASE_APP);
    Deno.removeSync(archivePath, {recursive: true});
}

fs.copySync(path.join(ROOT_DIR, "Teller", "Assets.xcassets"), path.join(TMP_DIR, "Assets.xcassets"));
setupOutputDirectory(path.join(TMP_DIR, "assets"));

for (const bd of jsonData.builds) {
    if (bd.label.length > 8) {
        console.error(`Error: “${bd.label}” is too long of a label; must be ≤ 8 characters.`);
        Deno.exit(1);
    }
    if (/[^A-Za-z0-9\-\.]/g.test(bd.label)) {
        console.error(`Error: “${bd.label}” is invalid; can only contain A-Z, a-z, 0-9, hyphens, and periods.`);
        Deno.exit(1);
    }
    console.log(`Making a build with “${bd.emoji}” labeled as “${bd.label}”...`);
    const emoData = extractEmoji(bd.emoji);
    const appIconSetPath = path.join(TMP_DIR, `${bd.label}.appiconset`);
    writeAppIconSet(emoData, appIconSetPath);
    Deno.removeSync(path.join(TMP_DIR, "Assets.xcassets", "AppIcon.appiconset"), {recursive: true});
    fs.copySync(appIconSetPath, path.join(TMP_DIR, "Assets.xcassets", "AppIcon.appiconset"));
    setupOutputDirectory(path.join(TMP_DIR, "assets", bd.label))
    const acCmd = new Deno.Command("xcrun", {
        args: [
            "actool",
            path.join(TMP_DIR, "Assets.xcassets"),
            "--compile", path.join(TMP_DIR, "assets", bd.label),
            "--platform", "macosx",
            "--minimum-deployment-target", "14.5",
            "--app-icon", "AppIcon",
            "--output-partial-info-plist", "/dev/null"
        ]
    });
    acCmd.outputSync();

    const customApp = path.join(TMP_DIR, `Teller-${bd.label}.app`);
    fs.copySync(BASE_APP, customApp);
    fs.copySync(path.join(TMP_DIR, "assets", bd.label), path.join(customApp, "Contents", "Resources"), {overwrite: true});

    const plistPath = path.join(customApp, "Contents", "Info.plist");
    const decoder = new TextDecoder("utf-8");
    ["CFBundleIdentifier", "CFBundleName"].forEach(ident => {
        const getCmd = new Deno.Command("/usr/libexec/PlistBuddy", {
            args: [
                "-c", `Print ${ident}`, plistPath
            ]
        });
        const output = getCmd.outputSync();
        const baseVal = decoder.decode(output.stdout).trimEnd();

        const setCmd = new Deno.Command("/usr/libexec/PlistBuddy", {
            args: [
                "-c", `Set ${ident} ${baseVal}-${bd.label}`, plistPath
            ]
        });
        setCmd.outputSync();
    });

    const signCmd = new Deno.Command("xcrun", {
        args: [
            "codesign",
            "--force",
            "--verbose",
            "--verify",
            "--sign", jsonData.code_signature,
            "-o", "runtime",
            "--entitlements", path.join(ROOT_DIR, "Teller", "Teller.entitlements"),
            "--timestamp",
            customApp
        ]
    });
    const _output = signCmd.outputSync();
    // console.log(new TextDecoder().decode(output.stderr));

    try {
        Deno.removeSync(path.join(BUILD_DIR, `Teller-${bd.label}.app`), {recursive: true});
    } catch {
        //no-op
    };
    Deno.renameSync(customApp, path.join(BUILD_DIR, `Teller-${bd.label}.app`));
}

Deno.removeSync(TMP_DIR, {recursive: true});
