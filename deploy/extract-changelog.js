#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Extract changelog content for a specific version
 * @param {string} version - The version to extract changelog for
 * @returns {string} The changelog content for the version
 */
function extractChangelogForVersion(version) {
  const changelogPath = join(rootDir, 'CHANGELOG.md');
  const content = readFileSync(changelogPath, 'utf8');
  
  // Find the version section
  const versionPattern = new RegExp(`## \\[${version.replace(/\./g, '\\.')}\\].*?\\n`, 'g');
  const match = content.match(versionPattern);
  
  if (!match) {
    throw new Error(`Version ${version} not found in CHANGELOG.md`);
  }
  
  // Extract content between this version and the next version
  const lines = content.split('\n');
  let startIndex = -1;
  let endIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Found the start of our version
    if (line.includes(`## [${version}]`)) {
      startIndex = i;
      continue;
    }
    
    // Found the start of the next version (end of our content)
    if (startIndex !== -1 && line.match(/^## \[[\d\.]+\]/)) {
      endIndex = i;
      break;
    }
  }
  
  // If no end found, go to the end of file
  if (endIndex === -1) {
    endIndex = lines.length;
  }
  
  if (startIndex === -1) {
    throw new Error(`Version ${version} not found in CHANGELOG.md`);
  }
  
  // Extract the content (skip the version header line)
  const changelogContent = lines.slice(startIndex + 1, endIndex)
    .join('\n')
    .trim();
  
  return changelogContent;
}

/**
 * Main function
 */
function main() {
  const version = process.argv[2];
  
  if (!version) {
    console.error('❌ Please provide a version number');
    console.log('Usage: node extract-changelog.js <version>');
    console.log('Example: node extract-changelog.js 3.3.46');
    process.exit(1);
  }
  
  try {
    const changelogContent = extractChangelogForVersion(version);
    console.log(changelogContent);
  } catch (error) {
    console.error('❌ Error extracting changelog:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractChangelogForVersion };