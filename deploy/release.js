#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Get the current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Update version in a file with specific pattern
 */
function updateVersionInFile(filePath, version, patterns) {
  console.log(`Updating version in ${filePath}...`);
  
  let content = readFileSync(filePath, 'utf8');
  
  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.search, 'g');
    content = content.replace(regex, pattern.replace.replace('${version}', version));
  });
  
  writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Updated ${filePath}`);
}

/**
 * Update CHANGELOG.md to replace Unreleased with current date and add new Unreleased section
 */
function updateChangelog(version) {
  console.log('Updating CHANGELOG.md...');
  
  const changelogPath = join(rootDir, 'CHANGELOG.md');
  let content = readFileSync(changelogPath, 'utf8');
  
  // Replace [Unreleased] with [version] - date and add new [Unreleased] section
  const currentDate = getCurrentDate();
  const unreleasedPattern = /## \[Unreleased\]/g;
  const replacement = `## [Unreleased]

## [${version}] - ${currentDate}`;
  
  content = content.replace(unreleasedPattern, replacement);
  
  writeFileSync(changelogPath, content, 'utf8');
  console.log(`✓ Updated CHANGELOG.md`);
}

/**
 * Execute git commands
 */
function executeGitCommands(version) {
  console.log('Creating git commit and tag...');
  
  try {
    // Add all changes
    console.log('Adding files to git...');
    execSync('git add .', { stdio: 'inherit', cwd: rootDir });
    
    // Commit changes following the pattern "Update VERSION for x.x.x"
    const commitMessage = `Update VERSION for ${version}`;
    console.log(`Committing changes: ${commitMessage}`);
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit', cwd: rootDir });
    
    // Create tag
    const tagName = `${version}`;
    console.log(`Creating tag: ${tagName}`);
    execSync(`git tag ${tagName}`, { stdio: 'inherit', cwd: rootDir });
    
    console.log('✓ Git commit and tag created successfully');
    
  } catch (error) {
    console.error('❌ Error during git operations:', error.message);
    throw error;
  }
}

/**
 * Main release function
 */
function release() {
  // Get version from command line argument
  const version = process.argv[2];
  
  if (!version) {
    console.error('❌ Please provide a version number');
    console.log('Usage: node release.js <version>');
    console.log('Example: node release.js 3.3.46');
    process.exit(1);
  }
  
  // Validate version format (basic semver check)
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(version)) {
    console.error('❌ Invalid version format. Please use semantic versioning (e.g., 3.3.46)');
    process.exit(1);
  }
  
  console.log(`🚀 Starting release process for version ${version}...`);
  
  try {
    // Update readme.txt
    updateVersionInFile(join(rootDir, 'readme.txt'), version, [
      {
        search: 'Stable tag: [0-9]+\\.[0-9]+\\.[0-9]+',
        replace: `Stable tag: ${version}`
      }
    ]);
    
    // Update constant.php
    updateVersionInFile(join(rootDir, 'constant.php'), version, [
      {
        search: "public const VERSION = '[0-9]+\\.[0-9]+\\.[0-9]+';",
        replace: `public const VERSION = '${version}';`
      }
    ]);
    
    // Update windpress.php
    updateVersionInFile(join(rootDir, 'windpress.php'), version, [
      {
        search: ' \\* Version:\\s+[0-9]+\\.[0-9]+\\.[0-9]+',
        replace: ` * Version:             ${version}`
      }
    ]);
    
    // Update CHANGELOG.md
    updateChangelog(version);
    
    // Execute git commands
    executeGitCommands(version);
    
    console.log('✅ Release process completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Push changes: git push && git push --tags');
    
  } catch (error) {
    console.error('❌ Error during release process:', error.message);
    process.exit(1);
  }
}

// Run the release process
release();