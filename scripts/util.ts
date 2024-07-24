import { ensureDirSync } from "https://deno.land/std@0.224.0/fs/mod.ts";

export function setupOutputDirectory(path: string) {
    try {
        Deno.removeSync(path, {recursive: true});
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
          throw err;
        }
    }
    ensureDirSync(path);
}
