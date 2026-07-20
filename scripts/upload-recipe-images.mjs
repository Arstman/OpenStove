#!/usr/bin/env node
/**
 * Upload recipe AVIFs from a local folder to Vercel Blob.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=vercel_blob_xxx \
 *   node scripts/upload-recipe-images.mjs \
 *     --dir ../OpenStoveVercel/public/images
 *
 * After upload, set PUBLIC_IMAGE_BASE_URL in Vercel to the printed base URL
 * (typically https://<store>.public.blob.vercel-storage.com/recipes).
 */

import { put } from '@vercel/blob';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    dir: { type: 'string' },
    prefix: { type: 'string', default: 'recipes' },
  },
});

const sourceDir = values.dir;
const prefix = values.prefix || 'recipes';

if (!sourceDir) {
  console.error('Missing --dir path to folder containing .avif files');
  process.exit(1);
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Set BLOB_READ_WRITE_TOKEN in the environment');
  process.exit(1);
}

const files = (await readdir(sourceDir)).filter(
  name => extname(name).toLowerCase() === '.avif'
);

if (files.length === 0) {
  console.error(`No .avif files found in ${sourceDir}`);
  process.exit(1);
}

console.log(`Uploading ${files.length} files from ${sourceDir}…`);

let baseUrl = '';

for (const file of files) {
  const pathname = `${prefix}/${file}`;
  const body = await readFile(join(sourceDir, file));
  const blob = await put(pathname, body, {
    access: 'public',
    contentType: 'image/avif',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  if (!baseUrl) {
    baseUrl = blob.url.slice(0, blob.url.lastIndexOf('/'));
  }
  console.log(`✓ ${file} → ${blob.url}`);
}

console.log('\nDone.');
console.log(`Set PUBLIC_IMAGE_BASE_URL=${baseUrl}`);
console.log(
  '(Filenames in recipe frontmatter are resolved against this base.)'
);
