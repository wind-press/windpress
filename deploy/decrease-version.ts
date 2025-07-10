#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Decrease version script for WordPress.org deployment
 * 
 * This script decreases the minor version number by 1 in all relevant files
 * to convert from Pro version format to Free version format.
 * 
 * Pro version format: X.Y.Z (e.g., 3.3.48)
 * Free version format: X.(Y-1).Z (e.g., 3.2.48)
 */

import { dirname, join } from "jsr:@std/path@1";

interface VersionMatch {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Get the working directory (project root)
 */
function getWorkingDirectory(): string {
  const scriptDir = dirname(new URL(import.meta.url).pathname);
  return join(scriptDir, '..');
}

/**
 * Parse version string into components
 */
function parseVersion(version: string): VersionMatch {
  const match = version.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3])
  };
}

/**
 * Decrease minor version by 1
 */
function decreaseMinorVersion(version: VersionMatch): string {
  return `${version.major}.${version.minor - 1}.${version.patch}`;
}

/**
 * Step 1: Update constant.php
 * 
 * Pattern: `public const VERSION = 'X.Y.Z';`
 * Decrease Y by 1.
 */
async function step1(): Promise<void> {
  console.log('📝 Step 1: Updating constant.php...');
  
  const workDir = getWorkingDirectory();
  const filePath = join(workDir, 'constant.php');
  
  try {
    const content = await Deno.readTextFile(filePath);
    const pattern = /public const VERSION = '(\d+)\.(\d+)\.(\d+)';/;
    const match = content.match(pattern);
    
    if (!match) {
      throw new Error('Version pattern not found in constant.php');
    }
    
    const fullVersion = `${match[1]}.${match[2]}.${match[3]}`;
    const version = parseVersion(fullVersion);
    const newVersion = decreaseMinorVersion(version);
    
    const updatedContent = content.replace(
      pattern,
      `public const VERSION = '${newVersion}';`
    );
    
    await Deno.writeTextFile(filePath, updatedContent);
    console.log(`   ✓ Updated version: ${fullVersion} → ${newVersion}`);
    
  } catch (error) {
    console.error(`   ❌ Error updating constant.php: ${error.message}`);
    throw error;
  }
}

/**
 * Step 2: Update windpress.php
 * 
 * Pattern: `* Version:             X.Y.Z`
 * Decrease Y by 1.
 */
async function step2(): Promise<void> {
  console.log('📝 Step 2: Updating windpress.php...');
  
  const workDir = getWorkingDirectory();
  const filePath = join(workDir, 'windpress.php');
  
  try {
    const content = await Deno.readTextFile(filePath);
    const pattern = /\* Version:\s+(\d+)\.(\d+)\.(\d+)/;
    const match = content.match(pattern);
    
    if (!match) {
      throw new Error('Version pattern not found in windpress.php');
    }
    
    const fullVersion = `${match[1]}.${match[2]}.${match[3]}`;
    const version = parseVersion(fullVersion);
    const newVersion = decreaseMinorVersion(version);
    
    const updatedContent = content.replace(
      pattern,
      `* Version:             ${newVersion}`
    );
    
    await Deno.writeTextFile(filePath, updatedContent);
    console.log(`   ✓ Updated version: ${fullVersion} → ${newVersion}`);
    
  } catch (error) {
    console.error(`   ❌ Error updating windpress.php: ${error.message}`);
    throw error;
  }
}

/**
 * Step 3: Update readme.txt stable tag
 * 
 * Pattern: `Stable tag: X.Y.Z`
 * Decrease Y by 1.
 */
async function step3(): Promise<void> {
  console.log('📝 Step 3: Updating readme.txt stable tag...');
  
  const workDir = getWorkingDirectory();
  const filePath = join(workDir, 'readme.txt');
  
  try {
    const content = await Deno.readTextFile(filePath);
    const pattern = /Stable tag: (\d+)\.(\d+)\.(\d+)/;
    const match = content.match(pattern);
    
    if (!match) {
      throw new Error('Stable tag pattern not found in readme.txt');
    }
    
    const fullVersion = `${match[1]}.${match[2]}.${match[3]}`;
    const version = parseVersion(fullVersion);
    const newVersion = decreaseMinorVersion(version);
    
    const updatedContent = content.replace(
      pattern,
      `Stable tag: ${newVersion}`
    );
    
    await Deno.writeTextFile(filePath, updatedContent);
    console.log(`   ✓ Updated stable tag: ${fullVersion} → ${newVersion}`);
    
  } catch (error) {
    console.error(`   ❌ Error updating readme.txt stable tag: ${error.message}`);
    throw error;
  }
}

/**
 * Step 4: Update readme.txt changelog headers
 * 
 * Handle version headers produced by update-readme-changelog.ts
 * Patterns:
 * - `= X.Y.Z =` (legacy format)
 * - `= X.Y.Z - YYYY-MM-DD =` (current format with date)
 * Decrease Y by 1 while preserving the date.
 */
async function step4(): Promise<void> {
  console.log('📝 Step 4: Updating readme.txt changelog headers...');
  
  const workDir = getWorkingDirectory();
  const filePath = join(workDir, 'readme.txt');
  
  try {
    let content = await Deno.readTextFile(filePath);
    let updateCount = 0;
    
    // Handle format with date: = X.Y.Z - YYYY-MM-DD =
    content = content.replace(/= (\d+)\.(\d+)\.(\d+) - ([0-9\-]+) =/g, (match, major, minor, patch, date) => {
      const version = parseVersion(`${major}.${minor}.${patch}`);
      const newVersion = decreaseMinorVersion(version);
      updateCount++;
      return `= ${newVersion} - ${date} =`;
    });
    
    // Handle legacy format without date: = X.Y.Z =
    content = content.replace(/= (\d+)\.(\d+)\.(\d+) =/g, (match, major, minor, patch) => {
      const version = parseVersion(`${major}.${minor}.${patch}`);
      const newVersion = decreaseMinorVersion(version);
      updateCount++;
      return `= ${newVersion} =`;
    });
    
    await Deno.writeTextFile(filePath, content);
    console.log(`   ✓ Updated ${updateCount} changelog headers`);
    
  } catch (error) {
    console.error(`   ❌ Error updating readme.txt changelog headers: ${error.message}`);
    throw error;
  }
}

/**
 * Step 5: Update readme.txt additional version references
 * 
 * Handle various version reference formats that might appear in readme.txt
 */
async function step5(): Promise<void> {
  console.log('📝 Step 5: Updating additional version references...');
  
  const workDir = getWorkingDirectory();
  const filePath = join(workDir, 'readme.txt');
  
  try {
    let content = await Deno.readTextFile(filePath);
    let updateCount = 0;
    
    // Handle [X.Y.Z] format (changelog entries)
    content = content.replace(/\[(\d+)\.(\d+)\.(\d+)\]/g, (match, major, minor, patch) => {
      const version = parseVersion(`${major}.${minor}.${patch}`);
      const newVersion = decreaseMinorVersion(version);
      updateCount++;
      return `[${newVersion}]`;
    });
    
    // Handle ## [X.Y.Z] format (markdown headers)
    content = content.replace(/## \[(\d+)\.(\d+)\.(\d+)\]/g, (match, major, minor, patch) => {
      const version = parseVersion(`${major}.${minor}.${patch}`);
      const newVersion = decreaseMinorVersion(version);
      updateCount++;
      return `## [${newVersion}]`;
    });
    
    // Handle version X.Y.Z in plain text (case-insensitive)
    content = content.replace(/version (\d+)\.(\d+)\.(\d+)/gi, (match, major, minor, patch) => {
      const version = parseVersion(`${major}.${minor}.${patch}`);
      const newVersion = decreaseMinorVersion(version);
      updateCount++;
      return match.replace(`${major}.${minor}.${patch}`, newVersion);
    });
    
    // Handle v-prefixed versions (like "v3.3.48")
    content = content.replace(/v(\d+)\.(\d+)\.(\d+)/g, (match, major, minor, patch) => {
      const version = parseVersion(`${major}.${minor}.${patch}`);
      const newVersion = decreaseMinorVersion(version);
      updateCount++;
      return `v${newVersion}`;
    });
    
    await Deno.writeTextFile(filePath, content);
    console.log(`   ✓ Updated ${updateCount} additional version references`);
    
  } catch (error) {
    console.error(`   ❌ Error updating additional version references: ${error.message}`);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting version decrease process...');
  console.log('   Converting from Pro version format to Free version format');
  console.log('   (Minor version will be decreased by 1)');
  console.log('');
  
  try {
    await step1(); // Update constant.php
    await step2(); // Update windpress.php
    await step3(); // Update readme.txt stable tag
    await step4(); // Update readme.txt changelog headers
    await step5(); // Update additional version references
    
    console.log('');
    console.log('✅ Version decrease process completed successfully!');
    console.log('   All files have been updated with the Free version format.');
    
  } catch (error) {
    console.error('');
    console.error('❌ Version decrease process failed:');
    console.error(`   ${error.message}`);
    Deno.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.main) {
  await main();
}