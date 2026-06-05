#!/usr/bin/env node
/**
 * Workaround for Next.js 15 bug:
 * Static pages inside nested route groups don't emit page_client-reference-manifest.js,
 * but vercel build's file tracer expects the file to exist, causing an ENOENT crash.
 *
 * This script creates a valid empty manifest for any affected routes after `next build`.
 * Safe to run on every build — skipped if the file already exists.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MISSING_MANIFESTS = [
  '.next/server/app/(root)/(marketing)/page_client-reference-manifest.js',
]

for (const relPath of MISSING_MANIFESTS) {
  const absPath = path.join(__dirname, '..', relPath)
  if (!fs.existsSync(absPath)) {
    fs.mkdirSync(path.dirname(absPath), { recursive: true })
    // Valid empty RSC manifest — same format Next.js generates for pages with no client refs
    const routeKey = relPath
      .replace('.next/server/app/', '')
      .replace('/page_client-reference-manifest.js', '/page')
    const content = `self.__RSC_MANIFEST=Object.assign(self.__RSC_MANIFEST||{},{"${routeKey}":{ssrModuleMapping:{},edgeSSRModuleMapping:{},clientModules:{},entryCSSFiles:{}}});`
    fs.writeFileSync(absPath, content)
    console.log(`[postbuild] Created missing manifest: ${relPath}`)
  } else {
    console.log(`[postbuild] Manifest already exists, skipping: ${relPath}`)
  }
}
