import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pages=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){if(item.name==='.git')continue;const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(p.endsWith('.html'))pages.push(p)}}
walk(root);
const errors=[];
for(const file of pages){const html=fs.readFileSync(file,'utf8');if(!/<title>[^<]+<\/title>/.test(html))errors.push(`${file}: missing title`);if(!/<meta name="description"/.test(html))errors.push(`${file}: missing description`);for(const m of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)){let target=m[1].split(/[?#]/)[0];if(target==='/')target='/index.html';else if(target.endsWith('/'))target+='index.html';const local=path.join(root,target);if(!fs.existsSync(local))errors.push(`${file}: broken ${m[1]}`)}}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Validated ${pages.length} HTML pages with local links and assets.`);
