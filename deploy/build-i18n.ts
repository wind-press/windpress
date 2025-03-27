import gettextParser from "npm:gettext-parser";
import { readFileSync, writeFileSync } from 'node:fs';

const input = readFileSync('./languages/windpress.pot');

let po = gettextParser.po.parse(input);

let content = `<?php exit; \n`;

for (const key in po.translations['']) {
    if (key === '') {
        continue;
    }
    content += `__("${po.translations[''][key].msgid.replace(/"/g, '\\"')}", "windpress");\n`;
}

// let it readable on GitHub Actions
console.log(content);

writeFileSync('./i18n.php', content);
