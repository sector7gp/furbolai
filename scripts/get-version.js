const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    const pkg = require('../package.json');
    let version = pkg.version || '0.0.0';
    let gitHash = 'no-git';

    try {
        gitHash = execSync('git rev-parse --short HEAD').toString().trim();
    } catch (e) {
        // Ignorar si git falla
    }

    const versionData = {
        version: version,
        gitHash: gitHash,
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
    console.log(`Version ${version} (git: ${gitHash}) captured to public/version.json`);
} catch (error) {
    console.error('Error capturing version:', error.message);
}
