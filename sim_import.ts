const base = "image1.png";
const baseSafe = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const urlRegex = new RegExp(`!\\[([^\\]]*)\\]\\([^)]*?${baseSafe}\\)(\\{[^}]*\\})?`, "g");

const pandocOut = `![](/tmp/m2/media/image1.png){width="1in"\nheight="1in"}`;
const replacement = `![$1](/question_image/1234.png)$2`;

const res = pandocOut.replace(urlRegex, replacement);
console.log("Replaced:", res);

import { parseContent } from './lib/content-parser';
console.log("Parsed AST:", JSON.stringify(parseContent(res), null, 2));

