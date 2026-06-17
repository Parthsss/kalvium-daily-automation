#!/usr/bin/env node

/**
 * Helper script to prepare auth.json for GitHub Secrets
 * This ensures the JSON is properly minified for safe pasting
 */

const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, 'auth.json');

if (!fs.existsSync(authPath)) {
  console.error('❌ auth.json not found!');
  console.error('   Run: node login.js first');
  process.exit(1);
}

try {
  const authContent = fs.readFileSync(authPath, 'utf-8');
  const authJson = JSON.parse(authContent);
  
  // Minify the JSON (remove all whitespace)
  const minified = JSON.stringify(authJson);
  
  console.log('✅ auth.json is valid JSON');
  console.log(`📊 Size: ${minified.length} characters`);
  console.log('\n📋 Copy the content below and paste it into your AUTH_STATE GitHub Secret:\n');
  console.log('---START---');
  console.log(minified);
  console.log('---END---');
  console.log('\n💡 Instructions:');
  console.log('1. Select and copy everything between ---START--- and ---END---');
  console.log('2. Go to GitHub: Settings → Secrets → AUTH_STATE');
  console.log('3. Paste the copied content');
  console.log('4. Click Update secret\n');
  
} catch (error) {
  console.error('❌ Error reading auth.json:', error.message);
  process.exit(1);
}
