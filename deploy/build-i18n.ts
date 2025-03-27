import gettextParser from "npm:gettext-parser";
import { readFileSync, writeFileSync } from 'node:fs';

const input = readFileSync('./languages/windpress.pot');

let po = gettextParser.po.parse(input);

let content = `(() => {\n`;

for (const key in po.translations['']) {
    if (key === '') {
        continue;
    }
    content += `\twp.i18n.__("${po.translations[''][key].msgid.replace(/"/g, '\\"')}", "windpress");\n`;
}

content += `});\n`;

// let it readable on GitHub Actions
console.log(content);

// (() => {});
writeFileSync('./src/Admin/i18n.js', content);
