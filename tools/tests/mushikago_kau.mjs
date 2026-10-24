import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const SP = SHOTS;
const browser = await chromium.launch(LAUNCH);
const page = await (await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
const click = async sel => { const el = await page.waitForSelector(sel); await el.evaluate(e => e.scrollIntoView({block:'center'})); await page.waitForTimeout(60); await el.click(); };
const tapMsg = async () => { const out=[]; for (let i = 0; i < 20; i++) { const a = await page.$('#msgLayer .ans button'); if (a) { out.push(await page.$eval('#msgLayer .win', e=>e.textContent.slice(0,50))); await a.click(); await page.waitForTimeout(120); continue; } if (await page.$('#msgLayer .tap')) { out.push(await page.$eval('#msgLayer .win', e=>e.textContent.slice(0,50))); await page.click('#msgLayer .win', {position:{x:20,y:20}}); await page.waitForTimeout(120); continue; } return out; } return out; };
await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(600);
await page.screenshot({ path: `${SP}/v17-title.png` });
await click('#btnNew'); await page.waitForTimeout(300); await tapMsg();
console.log('boxes', await page.evaluate(() => [S.boxes, S.cases.length]));
await click('#rtabs [data-t=home]'); await page.waitForTimeout(200); await page.screenshot({ path: `${SP}/v17-home1.png` });
// おみせで虫かごを2つ買う
await page.evaluate(() => { S.money = 400; for(const k in ITEMS) if(!ITEMS[k].cat) S.items[k] = 5; save(); hud(); });
await click('#tabs [data-t=shop]'); await page.waitForTimeout(200); await page.screenshot({ path: `${SP}/v17-shop.png` });
await click('[data-box=ami]'); await tapMsg(); await click('[data-box=dx]'); await tapMsg();
console.log('after buy', await page.evaluate(() => [S.boxes, S.cases.length, S.money]));
await click('[data-box=ki]'); console.log('replace ask', await tapMsg()); console.log('after replace', await page.evaluate(() => S.boxes));
// 虫をつかまえる（2つの空きがあるとき、虫かごをえらぶ）
await click('#tabs [data-t=out]'); await page.selectOption('#demoSpot', 'akama'); await click('#btnDemoGo'); await tapMsg();
for (let k = 0; k < 2; k++) for (let t = 0; t < 3; t++) { if (!(await page.$('#btnFind:not([disabled])'))) break; await click('#btnFind'); await page.waitForTimeout(1800); if (await page.$('#bTake:not([disabled])')) { await click('#bTake'); console.log('take', await tapMsg()); break; } else if (await page.$('#bLeave')) { await click('#bLeave'); } else if (await page.$('#btnAgain')) await click('#btnAgain'); }
await click('#btnLeave'); await page.waitForTimeout(300); await page.screenshot({ path: `${SP}/v17-home3.png` });
console.log('cases', await page.evaluate(() => S.cases.map((c,i)=> c ? c.bug + '@' + S.boxes[i] : null)));
// 観察：パネルを開いて閉じる
const idx = await page.evaluate(() => S.cases.findIndex(Boolean));
await click(`.case[data-i="${idx}"]`); await page.waitForTimeout(800); await page.screenshot({ path: `${SP}/v17-obs.png` });
await page.click('#rtCase'); await page.waitForTimeout(400); await page.screenshot({ path: `${SP}/v17-drawer.png` }); await page.click('#rtCase'); await page.waitForTimeout(500);
console.log('closed vis', await page.evaluate(() => getComputedStyle(document.getElementById('drawer')).visibility));
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
