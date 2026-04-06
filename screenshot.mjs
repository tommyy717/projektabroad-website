import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, 'temporary screenshots');

// Mac Chrome path
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Auto-increment filename, never overwrite
function nextScreenshotPath(label) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const files = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png'));
  const nums = files.map(f => {
    const m = f.match(/^screenshot-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  });
  const n = nums.length ? Math.max(...nums) + 1 : 1;
  const suffix = label ? `-${label}` : '';
  return path.join(SCREENSHOTS_DIR, `screenshot-${n}${suffix}.png`);
}

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });

// Let scroll-triggered animations settle
await new Promise(r => setTimeout(r, 400));

const outPath = nextScreenshotPath(label);
await page.screenshot({ path: outPath, fullPage: false });
console.log(outPath);

await browser.close();
