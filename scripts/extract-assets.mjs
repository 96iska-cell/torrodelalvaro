import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const html = fs.readFileSync('index.html', 'utf8');
const outDir = 'assets/images';
fs.mkdirSync(outDir, { recursive: true });
const seen = new Map();
const manifest = [];
const re = /<img\s+src="data:image\/([^;]+);base64,([^"]+)"\s+alt="([^"]*)"(?:\s+class="([^"]*)")?\s*\/?>/g;
let match;
while ((match = re.exec(html))) {
  const [, rawType, data, alt, className = ''] = match;
  const ext = rawType === 'jpeg' ? 'jpg' : rawType;
  const buffer = Buffer.from(data, 'base64');
  const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 10);
  let file = seen.get(hash);
  if (!file) {
    const slug = alt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image';
    file = `${slug}-${hash}.${ext}`;
    fs.writeFileSync(path.join(outDir, file), buffer);
    seen.set(hash, file);
  }
  manifest.push({ alt, className, file, bytes: buffer.length });
}
console.log(JSON.stringify(manifest, null, 2));
