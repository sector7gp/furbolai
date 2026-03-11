const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    let version;
    try {
        // Try to get the latest git tag
        version = execSync('git describe --tags --abbrev=0').toString().trim();
    } catch (e) {
        // Fallback to git hash if no tags found
        version = execSync('git rev-parse --short HEAD').toString().trim();
    }

    const versionData = {
        version: version,
        buildDate: new Date().toISOString()
    };

    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(publicDir, 'version.json'),
        JSON.stringify(versionData, null, 2)
    );
    console.log(`Version ${version} captured to public/version.json`);
} catch (error) {
    console.error('Error capturing git version:', error.message);
    // Dynamic fallback to package.json version if git fails
    const pkg = require('../package.json');
    const versionData = {
        version: pkg.version || 'unknown',
        buildDate: new Date().toISOString()
    };
    fs.writeFileSync(
        path.join(__dirname, '../public/version.json'),
        JSON.stringify(versionData, null, 2)
    );
}
