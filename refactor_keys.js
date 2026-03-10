const fs = require('fs');
let code = fs.readFileSync('src/app/players/page.tsx', 'utf8');

const replacements = [
    { p: /\bjugador\b/g, r: 'player' },
    { p: /\bcelular\b/g, r: 'mobil' },
    { p: /\bfecha_nacimiento\b/g, r: 'birth' },
    { p: /\bposiciones\b/g, r: 'pos' },
    { p: /\bef\b/g, r: 'fitness' },
    { p: /\bcd\b/g, r: 'defensive' },
    { p: /\bintensidad\b/g, r: 'strengths' },
    { p: /\bestado\b/g, r: 'status' }
];

replacements.forEach(({ p, r }) => {
    code = code.replace(p, r);
});

fs.writeFileSync('src/app/players/page.tsx', code);
console.log('Refactor complete');
