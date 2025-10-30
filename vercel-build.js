const { execSync } = require('child_process');

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Build the project
console.log('\nBuilding project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\nBuild completed successfully!');
} catch (error) {
  console.error('\nBuild failed:', error);
  process.exit(1);
}
