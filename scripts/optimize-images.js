import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');

function walkSvgFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSvgFiles(full, acc);
    else if (entry.name.toLowerCase().endsWith('.svg')) acc.push(full);
  }
  return acc;
}

function destFor(src) {
  const parsed = path.parse(src);
  const rel = path.relative(ROOT, src).replaceAll('\\', '/');

  if (rel.startsWith('src/assets/icons/')) {
    return path.join(ROOT, 'public/assets/icons', `${parsed.name}.webp`);
  }
  if (rel.startsWith('src/assets/images/')) {
    return path.join(ROOT, 'public/assets/images', `${parsed.name}.webp`);
  }
  if (rel.startsWith('asset-sources/goalkeeper/')) {
    const rest = rel.replace('asset-sources/goalkeeper/', '').replace(/\.svg$/i, '.webp');
    return path.join(ROOT, 'public/assets/goalkeeper', rest);
  }
  return path.join(parsed.dir, `${parsed.name}.webp`);
}

function sizeFor(src) {
  if (src.includes(`${path.sep}icons${path.sep}`)) return 256;
  if (src.includes('botao_kick')) return 256;
  return 512;
}

async function convertSvg(src) {
  const dest = destFor(src);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!FORCE && fs.existsSync(dest)) {
    const srcStat = fs.statSync(src);
    const destStat = fs.statSync(dest);
    if (destStat.mtimeMs >= srcStat.mtimeMs && destStat.size > 1000) {
      return { src, dest, skipped: true, bytes: destStat.size };
    }
  }

  const size = sizeFor(src);
  const svg = fs.readFileSync(src);
  await sharp(svg, { density: 72, limitInputPixels: false })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 80, alphaQuality: 85, effort: 4 })
    .toFile(dest);

  return { src, dest, skipped: false, bytes: fs.statSync(dest).size };
}

async function runPool(items, limit, worker) {
  const results = [];
  let index = 0;
  async function next() {
    const current = index++;
    if (current >= items.length) return;
    results[current] = await worker(items[current]);
    await next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

const files = [
  ...walkSvgFiles(path.join(ROOT, 'asset-sources/goalkeeper')),
  ...walkSvgFiles(path.join(ROOT, 'src/assets/icons')),
  path.join(ROOT, 'src/assets/images/ball.svg'),
  path.join(ROOT, 'src/assets/images/botao_kick.svg'),
].filter((f) => fs.existsSync(f));

console.log(`Otimizando ${files.length} SVGs para WebP...`);
const started = Date.now();
const results = await runPool(files, 3, convertSvg);

let converted = 0;
let skipped = 0;
let totalBytes = 0;
for (const result of results) {
  totalBytes += result.bytes;
  if (result.skipped) skipped += 1;
  else {
    converted += 1;
    const srcSize = fs.statSync(result.src).size;
    console.log(
      `  ${path.relative(ROOT, result.dest)}  ${(srcSize / 1024).toFixed(0)}KB -> ${(result.bytes / 1024).toFixed(1)}KB`
    );
  }
}

console.log(
  `\nPronto em ${((Date.now() - started) / 1000).toFixed(1)}s: ${converted} convertidos, ${skipped} reaproveitados, total WebP ${(totalBytes / 1024 / 1024).toFixed(2)} MB`
);
