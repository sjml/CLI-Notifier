import * as fontkit from "npm:fontkit@2.0.2";
import { parseFlags } from "https://deno.land/x/cliffy@v1.0.0-rc.4/flags/mod.ts";

import { setupOutputDirectory } from "./util.ts";

export function extractEmoji(emo: string): Uint8Array {
    const fontFile = fontkit.openSync("/System/Library/Fonts/Apple Color Emoji.ttc").fonts[0];
    const emoGlyphRun = fontFile.layout(emo);
    const glyph = emoGlyphRun.glyphs[0].getImageForSize(160);
    return glyph.data;
}

export function writeSingleFile(emoData: Uint8Array, outputPath: string) {
    Deno.writeFileSync(outputPath, emoData);
}

export function writeAppIconSet(emoData: Uint8Array, outputPath: string) {
    setupOutputDirectory(outputPath);

    const baseFile = `${outputPath}/icon_160x160.png`;
    writeSingleFile(emoData, baseFile);

    const content_datums = {
        info: {
            author: "xcode",
            version: 1,
        },
        images: Array<object>(),
    };
    const SIZES = [16, 32, 128, 256, 512];
    SIZES.forEach(dim => {
        let cmd = new Deno.Command("sips", {
            args: ["-Z", String(dim), "--out", `${outputPath}/icon_${dim}x${dim}.png`, baseFile]
        });
        cmd.outputSync();

        const doubleSize = dim * 2;
        cmd = new Deno.Command("sips", {
            args: ["-Z", String(doubleSize), "--out", `${outputPath}/icon_${dim}x${dim}@2x.png`, baseFile]
        });
        cmd.outputSync();

        content_datums.images.push({
            filename: `icon_${dim}x${dim}.png`,
            idiom: "mac",
            scale: "1x",
            size: `${dim}x${dim}`
        });
        content_datums.images.push({
            filename: `icon_${dim}x${dim}@2x.png`,
            idiom: "mac",
            scale: "2x",
            size: `${dim}x${dim}`
        });
    });

    Deno.removeSync(baseFile);
    Deno.writeTextFileSync(`${outputPath}/Contents.json`, JSON.stringify(content_datums, null, 2));
}


function main() {
    try {
        const flags = parseFlags(Deno.args, {
            flags: [
                {
                    name: "emoji",
                    type: "string",
                    required: true,
                },
                {
                    name: "file",
                    type: "string",
                    conflicts: ["appiconset"]
                },
                {
                    name: "appiconset",
                    type: "string",
                    conflicts: ["file"]
                }
            ]
        });
        if (flags.flags.file === undefined && flags.flags.appiconset === undefined) {
            console.error('Error: Either "--file" or "--appiconset" must be specified.');
            Deno.exit(1);
        }

        const emoImgData = extractEmoji(flags.flags.emoji);
        if (flags.flags.file) {
            writeSingleFile(emoImgData, flags.flags.file);
            Deno.exit(0);
        }
        if (flags.flags.appiconset) {
            writeAppIconSet(emoImgData, flags.flags.appiconset);
            Deno.exit(0);
        }
    } catch (error) {
        console.error(String(error).split("\n")[0]);
        Deno.exit(1);
    }
}


if (import.meta.main) {
    main();
}
