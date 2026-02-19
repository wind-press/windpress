#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Update readme.txt with changelog from CHANGELOG.md
 * 
 * This script reads the CHANGELOG.md file and updates the changelog section
 * in readme.txt with the content from the CHANGELOG.md file.
 */

import { dirname, join } from "jsr:@std/path@1";

interface ChangelogEntry {
  version: string;
  date: string;
  content: string;
}

/**
 * Map section headers to appropriate prefixes
 * Based on Keep a Changelog standard: https://keepachangelog.com/en/1.1.0/
 */
function getSectionPrefix(section: string): string {
  const sectionMap: Record<string, string> = {
    'Added': 'New',
    'Changed': 'Improve', 
    'Deprecated': 'Deprecated',
    'Removed': 'Remove',
    'Fixed': 'Fix',
    'Security': 'Security'
  };

  return sectionMap[section] || 'Note';
}

/**
 * Detect markdown reference-style link definitions, e.g.:
 * [unreleased]: https://example.com/compare
 */
function isReferenceLinkDefinition(line: string): boolean {
  return /^\[[^\]]+\]:\s+\S+/.test(line.trim());
}

/**
 * Parse CHANGELOG.md and extract version entries
 */
function parseChangelog(changelogContent: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = changelogContent.split('\n');
  
  let currentEntry: ChangelogEntry | null = null;
  let inEntry = false;
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match version headers like "## [3.3.44] - 2025-07-09"
    const versionMatch = line.match(/^## \[(.+?)\] - (.+)$/);
    if (versionMatch) {
      // Save previous entry if exists
      if (currentEntry) {
        entries.push(currentEntry);
      }
      
      // Start new entry
      currentEntry = {
        version: versionMatch[1],
        date: versionMatch[2],
        content: ''
      };
      inEntry = true;
      currentSection = ''; // Reset section for new entry
      continue;
    }
    
    // Stop collecting when we hit another ## or # header (not version)
    if (line.startsWith('## ') && !line.match(/^## \[.+?\] - .+$/)) {
      inEntry = false;
      continue;
    }
    
    // Skip the main headers
    if (line.startsWith('# ') || line.startsWith('All notable changes')) {
      continue;
    }
    
    // Collect content for current entry
    if (inEntry && currentEntry) {
      // Skip markdown reference links from the bottom links section.
      if (isReferenceLinkDefinition(line)) {
        continue;
      }

      // Convert markdown format to readme.txt format
      let processedLine = line;
      
      // Convert ### headers to section tracking
      if (line.startsWith('### ')) {
        currentSection = line.replace('### ', '').trim();
        continue; // Skip adding the section header to content
      }
      
      // Add appropriate prefix based on current section
      if (line.startsWith('- ') && currentSection) {
        const content = line.substring(2).trim();
        const prefix = getSectionPrefix(currentSection);
        processedLine = `- **${prefix}**: ${content}`;
      }
      
      // Keep markdown links as-is for WordPress.org parsing
      // processedLine = processedLine.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      
      // Keep markdown formatting for WordPress.org parsing
      // processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, '$1');
      
      if (processedLine.trim()) {
        currentEntry.content += (currentEntry.content ? '\n' : '') + processedLine;
      }
    }
  }
  
  // Add the last entry
  if (currentEntry) {
    entries.push(currentEntry);
  }
  
  return entries;
}

/**
 * Convert changelog entries to readme.txt format
 */
function formatForReadme(entries: ChangelogEntry[]): string {
  let result = '';
  
  for (const entry of entries) {
    // Include the date in the version header
    result += `= ${entry.version} - ${entry.date} =\n`;
    
    // Process content lines
    const lines = entry.content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        if (isReferenceLinkDefinition(trimmedLine)) {
          continue;
        }

        // Check if this is a section header (Added, Fixed, etc.)
        if (['Added', 'Fixed', 'Improved', 'Changed', 'Deprecated', 'Removed', 'Security'].includes(trimmedLine)) {
          continue; // Skip the section header itself
        }
        
        // Process the actual changelog item
        if (trimmedLine.startsWith('- ')) {
          // Keep the markdown formatting with ** for bold text
          const cleanLine = trimmedLine.substring(2).trim();
          result += `* ${cleanLine}\n`;
        } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          // Skip bold headers that are already processed
          continue;
        } else if (trimmedLine.length > 0) {
          // Keep markdown formatting for other lines
          result += `* ${trimmedLine}\n`;
        }
      }
    }
    result += '\n';
  }
  
  return result.trim();
}

/**
 * Update readme.txt with new changelog content
 */
function updateReadmeWithChangelog(readmeContent: string, changelogText: string): string {
  // Find the changelog section
  const changelogStartMatch = readmeContent.match(/== Changelog ==/);
  if (!changelogStartMatch) {
    throw new Error('Could not find "== Changelog ==" section in readme.txt');
  }
  
  const changelogStart = changelogStartMatch.index!;
  const beforeChangelog = readmeContent.substring(0, changelogStart);
  
  // Build the new changelog section
  const newChangelogSection = `== Changelog ==

Note: The Pro version has a version number with one higher minor version than the Free version.

For instance:
Free version 1.**0**.4
Pro version 1.**1**.4

${changelogText}

[See changelog for all versions.](https://github.com/wind-press/windpress/blob/main/CHANGELOG.md)`;
  
  return beforeChangelog + newChangelogSection;
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Get the project root directory
    const scriptDir = dirname(new URL(import.meta.url).pathname);
    const projectRoot = join(scriptDir, '..');
    
    // Read files
    const changelogPath = join(projectRoot, 'CHANGELOG.md');
    const readmePath = join(projectRoot, 'readme.txt');
    
    console.log('📖 Reading CHANGELOG.md...');
    const changelogContent = await Deno.readTextFile(changelogPath);
    
    console.log('📖 Reading readme.txt...');
    const readmeContent = await Deno.readTextFile(readmePath);
    
    console.log('🔄 Parsing changelog...');
    const entries = parseChangelog(changelogContent);
    console.log(`Found ${entries.length} changelog entries`);
    
    console.log('🔄 Converting to readme.txt format...');
    const readmeChangelog = formatForReadme(entries);
    
    console.log('✏️  Updating readme.txt...');
    const updatedReadme = updateReadmeWithChangelog(readmeContent, readmeChangelog);
    
    console.log('💾 Writing updated readme.txt...');
    await Deno.writeTextFile(readmePath, updatedReadme);
    
    console.log('✅ Successfully updated readme.txt with changelog from CHANGELOG.md');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    Deno.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.main) {
  await main();
}
