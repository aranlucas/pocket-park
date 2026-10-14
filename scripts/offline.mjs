import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const files = ["/", "/index.html", "/icon.svg", "/manifest.webmanifest"];

async function getAssetNames() {
  try {
    return await readdir("dist/assets");
  } catch {
    return [];
  }
}

const assetNames = await getAssetNames();

for (const name of assetNames) {
  files.push("/assets/" + name);
}

const hash = createHash("sha256");

async function getFileContents() {
  const results = await Promise.all(
    files.map(async (file) => {
      if (file === "/") {
        return null;
      }

      try {
        return await readFile("dist" + file);
      } catch {
        return null;
      }
    }),
  );

  return results.filter((r) => r !== null);
}

const fileContents = await getFileContents();

for (const content of fileContents) {
  hash.update(content);
}

const cache = "pocket-park-" + hash.digest("hex").slice(0, 12);

await writeFile(
  "dist/sw.js",
  `const CACHE=${JSON.stringify(cache)};const FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pocket-park-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.open(CACHE).then(c=>c.match(e.request,{ignoreVary:true})).then(hit=>hit||fetch(e.request)));});`,
);
