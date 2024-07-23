import * as fontkit from "npm:fontkit@2.0.2";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { ImageMagick, initialize, MagickGeometry, MagickFormat, PixelInterpolateMethod } from "https://deno.land/x/imagemagick_deno@0.0.26/mod.ts";

const fontFile = fontkit.openSync("/System/Library/Fonts/Apple Color Emoji.ttc").fonts[0];

if (Deno.args.length < 2) {
    console.error("Needs two arguments: [:emoji:] [name]");
    Deno.exit(1);
}

const emo = fontFile.layout(Deno.args[0]);
const glyph = emo.glyphs[0].getImageForSize(160);
const glyphData = glyph.data;

await initialize();

const content_datums = {
    info: {
        author: "xcode",
        version: 1,
    },
    images: Array<object>(),
};

const iconset = `${Deno.args[1]}.appiconset`;
await ensureDir(iconset);

const SIZES = [ 16, 32, 128, 256, 512];
SIZES.forEach(dim => {
    ImageMagick.read(glyphData, img => {
        const size = new MagickGeometry(dim, dim);
        const size2x = new MagickGeometry(dim*2, dim*2);
        img.interpolate = PixelInterpolateMethod.Bilinear;
        img.resize(size2x);
        img.write(MagickFormat.Png, data => {
            Deno.writeFileSync(`${iconset}/icon_${size}@2x.png`, data);
        });
        content_datums.images.push({
            filename: `icon_${size}@2x.png`,
            idiom: "mac",
            scale: "2x",
            size: `${dim}x${dim}`
        });
        img.resize(size);
        img.write(MagickFormat.Png, data => {
            Deno.writeFileSync(`${iconset}/icon_${size}.png`, data);
        });
        content_datums.images.push({
            filename: `icon_${size}.png`,
            idiom: "mac",
            scale: "1x",
            size: `${dim}x${dim}`
        });
    });
});

Deno.writeTextFileSync(`${iconset}/Contents.json`, JSON.stringify(content_datums, null, 2));

