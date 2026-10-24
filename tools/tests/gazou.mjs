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
// 虫めがね：枝にとまったカブトムシの触角にかざすと、くわしいようすが文に出る
await page.click('#mihonBar [data-v=yoru]'); await page.waitForTimeout(500);
if (!(await page.$('#mihonBar [data-k=eda][data-v=false]'))) { await page.click('#mihonBar [data-k=eda]'); await page.waitForTimeout(600); }
await page.click('[data-tool=megane]'); await page.waitForTimeout(400);
// カブトムシは向きをかえることがあるので、触角の場所をはかりなおして、3回までかざす
let lt = '';
for (let tryN = 0; tryN < 3 && !/虫めがねで見ると…触角/.test(lt); tryN++) {
  const o = await page.evaluate(() => { const r = document.getElementById('toolObj').getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2}; });
  const a = await page.evaluate(() => { const r = document.querySelector('#bugG [data-r=ant]').getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2}; });
  await page.mouse.move(o.x, o.y); await page.mouse.down();
  for (let i = 1; i <= 6; i++) { await page.mouse.move(o.x + (a.x - o.x)*i/6, o.y + (a.y - o.y)*i/6); await page.waitForTimeout(20); }
  await page.mouse.up(); await page.waitForTimeout(700);
  lt = await page.$eval('#obsTxt', e => e.textContent);
}
console.log('虫めがね:', lt.slice(0, 40)); if (!/虫めがねで見ると…触角/.test(lt)) errors.push('虫めがねで触角が見えない');
await page.screenshot({ path: `${SHOTS}/k-megane.png` });
// 道具の列から、虫めがねをそのままドラッグして使える
await page.click('[data-tool=yubi]'); await page.waitForTimeout(500);
const tb = await page.evaluate(() => { const r = document.querySelector('#toolTray [data-tool=megane]').getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2}; });
const a2 = await page.evaluate(() => { const r = document.querySelector('#bugG [data-r=ant]').getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2}; });
await page.mouse.move(tb.x, tb.y); await page.mouse.down();
for (let i = 1; i <= 12; i++) { await page.mouse.move(tb.x + (a2.x - tb.x)*i/12, tb.y + (a2.y - tb.y)*i/12); await page.waitForTimeout(30); }
await page.mouse.up(); await page.waitForTimeout(700);
const lt2 = await page.$eval('#obsTxt', e => e.textContent), on2 = await page.$eval('#toolTray [data-tool=megane]', e => e.classList.contains('on'));
console.log('列からドラッグ:', on2, lt2.slice(0, 30)); if (!on2 || !/虫めがねで見ると/.test(lt2)) errors.push('道具の列からドラッグできない');
await page.screenshot({ path: `${SHOTS}/k-tray.png` });
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
