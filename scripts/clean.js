#!/usr/bin/env node

/**
 * Clean script to remove build artifacts and cache
 * Run this when you encounter build or runtime issues
 */

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

console.log('🧹 Cleaning build artifacts and cache...');

// Remove .next directory
const nextDir = join(projectRoot, '.next');
if (existsSync(nextDir)) {
  console.log('📁 Removing .next directory...');
  rmSync(nextDir, { recursive: true, force: true });
}

// Remove node_modules (optional)
const nodeModulesDir = join(projectRoot, 'node_modules');
if (existsSync(nodeModulesDir)) {
  console.log('📦 Removing node_modules...');
  rmSync(nodeModulesDir, { recursive: true, force: true });
}

// Clear npm/pnpm cache
console.log('🗑️  Clearing package manager cache...');
try {
  execSync('pnpm store prune', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Could not clear pnpm cache, continuing...');
}

console.log('✅ Cleanup complete!');
console.log('📝 Next steps:');
console.log('   1. Run: pnpm install');
console.log('   2. Run: pnpm build');
console.log('   3. Run: pnpm dev'); 