const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    const pkg = require('../package.json');
    let version = pkg.version || '0.0.0';
    let gitHash = 'no-git';
    let branch = 'no-branch';

    try {
        gitHash = execSync('git rev-parse --short HEAD').toString().trim();
        branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

        // Si el nombre de la rama parece una versión (v1.2.3 o 1.2.3), usarlo
        const versionPattern = /^v?\d+(\.\d+)+$/;
        if (versionPattern.test(branch)) {
            version = branch.startsWith('v') ? branch : `v${branch}`;
        } else {
            // Asegurar que la versión de package.json tenga el prefijo 'v'
            version = version.startsWith('v') ? version : `v${version}`;
        }
    } catch (e) {
        // Fallback a package.json si git falla
        version = version.startsWith('v') ? version : `v${version}`;
    }

    const versionData = {
        version: version,
        gitHash: gitHash,
        branch: branch,
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
    console.log(`Version ${version} (branch: ${branch}, git: ${gitHash}) captured to public/version.json`);
} catch (error) {
    console.error('Error capturing version:', error.message);
}
