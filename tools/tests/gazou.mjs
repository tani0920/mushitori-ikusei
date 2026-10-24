// 絵（画像）になった虫を、見本ページ（?mihon=）で開いてたしかめる。
// エラーが出ないか・床で歩きまわるか・ねているときは動かないか。スクリーンショット k-*.png は目で見る
import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const browser = await chromium.launch(LAUNCH);
const page = await (await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const pos = () => page.evaluate(() => { const r = document.querySelector('#bugMove image').getBoundingClientRect(); return Math.round(r.left); });
await page.goto(BASE + '?mihon=kabuto&t=' + Date.now()); await page.waitForTimeout(800);
await page.screenshot({ path: `${SHOTS}/k-mihon-yoru.png` });
const xs = []; for (let i = 0; i < 8; i++) { xs.push(await pos()); await page.waitForTimeout(1000); }
console.log('夜の床 x:', xs.join(' '), Math.max(...xs) - Math.min(...xs) > 5 ? '→ 動いた' : '→ 動かない！');
if (Math.max(...xs) - Math.min(...xs) <= 5) errors.push('床で歩かない');
await page.screenshot({ path: `${SHOTS}/k-mihon-yoru2.png` });
await page.click('#mihonBar [data-k=eda]'); await page.waitForTimeout(1500); await page.screenshot({ path: `${SHOTS}/k-mihon-eda.png` });
await page.click('#mihonBar [data-v=hiru]'); await page.waitForTimeout(600);
const h1 = await pos(); await page.waitForTimeout(2500); const h2 = await pos();
console.log('昼（土の中でねる）:', h1, h2, h1 === h2 ? '→ 動かない（OK）' : '→ 動いた！');
if (h1 !== h2) errors.push('ねているのに動いた');
await page.screenshot({ path: `${SHOTS}/k-mihon-hiru.png` });
// 観察（試作）：部品を組み立てて動かす画面
await page.click('#mihonZoom'); await page.waitForTimeout(800);
const n = await page.evaluate(() => [...document.querySelectorAll('.zoomL image')].filter(i => i.getBBox().width > 0).length);
console.log('観察の部品:', n); if (n < 7) errors.push('観察の部品が足りない');
for (const k of ['[data-a=clean]', '[data-m=eat]', '[data-m=nemui]']) { await page.click('.zoomL ' + k); await page.waitForTimeout(900); }
await page.screenshot({ path: `${SHOTS}/k-zoom.png` });
await page.click('.zoomL [data-x]');
console.log('セーブ:', await page.evaluate(() => localStorage.getItem(SAVE_KEY) ? 'のこった！' : 'なし（OK）'));
if (await page.evaluate(() => localStorage.getItem(SAVE_KEY))) errors.push('見本ページがセーブした');
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
