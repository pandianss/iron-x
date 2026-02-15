const fs = require('fs');
const path = require('path');

const directory = 'e:\\projects\\20260209-IRON\\frontend\\src';

function replaceColors(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            replaceColors(filePath);
        } else if (stats.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;

            // Replace zinc with iron
            content = content.replace(/zinc-/g, 'iron-');

            // Replace slate with iron
            content = content.replace(/slate-/g, 'iron-');

            // Replace gray with iron (only for tailwind classes usually following patterns like text-gray-*, bg-gray-*)
            // limiting to simple hyphenated pattern to avoid replacing other logical "gray" occurrences if any
            content = content.replace(/gray-/g, 'iron-');

            if (content !== originalContent) {
                console.log(`Updating ${filePath}`);
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    });
}

replaceColors(directory);
console.log('Color standardization complete.');
