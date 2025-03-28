// https://developer.wordpress.org/apis/internationalization/#internationalizing-javascript

import gettextParser from "npm:gettext-parser";
import { readFileSync, writeFileSync } from 'node:fs';

const input = readFileSync('./languages/windpress.pot');

let po = gettextParser.po.parse(input);

let body = '';

for (const key in po.translations['']) {
    if (key) {
        // escape single quote
        // body += `\t__('${po.translations[''][key].msgid.replace(/'/g, "\\'")}', 'windpress');\n`;
        body += `\twp.i18n.__('${po.translations[''][key].msgid.replace(/'/g, "\\'")}', 'windpress');\n`;
    }
}

// const content = `(() => {\n\tconst { __, _x, _n, sprintf } = wp.i18n;\n${body}});`;
const content = `(() => {\n${body}});`;

// let it readable on GitHub Actions
console.log(content);

// (() => {const { __, _x, _n, sprintf } = wp.i18n;});
writeFileSync('./src/Admin/wp-i18n.js', content);
