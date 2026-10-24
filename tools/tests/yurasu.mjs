import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const SP = SHOTS;
const browser = await chromium.launch(LAUNCH);
const page = await (await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
const click = async sel => { const el = await page.waitForSelector(sel); await el.evaluate(e => e.scrollIntoView({block:'center'})); await page.waitForTimeout(60); await el.click(); };
const tapMsg = async () => { for (let i = 0; i < 20; i++) { if (await page.$('#msgLayer input')) return; const a = await page.$('#msgLayer .ans button'); if (a) { await a.click(); await page.waitForTimeout(120); continue; } if (await page.$('#msgLayer .tap')) { await page.click('#msgLayer .win', {position:{x:20,y:20}}); await page.waitForTimeout(120); continue; } return; } };
const toClient = (x, y) => page.evaluate(([x,y]) => { const svg = document.getElementById('sceneSvg'); const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(svg.getScreenCTM()); return {x:q.x, y:q.y}; }, [x,y]);
const st = () => page.evaluate(() => { const c = S.cases[0]; return {over:c.log.over, hide:(c.hideUntil||0) > now(), txt:document.getElementById('obsTxt').textContent.slice(0,40)}; });
await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
await click('#btnNew'); await page.waitForTimeout(300); await tapMsg();
await page.evaluate(() => { S.money += 300; for(const k in ITEMS) S.items[k] = 10; save(); });
await click('#tabs [data-t=out]'); await page.selectOption('#demoSpot', 'taisha'); await click('#btnDemoGo'); await tapMsg();
for (let t = 0; t < 3; t++) { await click('#btnFind'); await page.waitForTimeout(1800); if (await page.$('#bTake')) { await click('#bTake'); await tapMsg(); if (await page.$('#msgLayer .ans')) { await (await page.$$('#msgLayer .ans button'))[0].click(); await page.waitForTimeout(150); await (await page.$$('#msgLayer .ans button'))[0].click(); await tapMsg(); } break; } else if (await page.$('#btnAgain')) await click('#btnAgain'); }
await click('#btnLeave'); await click('#rtabs [data-t=home]'); await page.waitForTimeout(200); await click('.case[data-i="0"]'); await page.waitForTimeout(900);
await click('[data-tool=furu]'); await page.evaluate(() => document.getElementById('scene').scrollIntoView({block:'start'})); await page.waitForTimeout(100);
console.log('tools:', await page.$$eval('.tools .tbtn', b => b.map(x => x.textContent.trim())));
// 小さくゆらす（1往復）→ 反応なし
let p = await toClient(50, 50); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 30, p.y, {steps:4}); await page.screenshot({ path: `${SP}/v5-furu.png` }); await page.mouse.move(p.x - 30, p.y, {steps:4}); await page.mouse.up(); await page.waitForTimeout(400);
console.log('small:', await st());
// 大きくゆらす（6往復）→ 反応あり
await page.mouse.move(p.x, p.y); await page.mouse.down(); for (let i = 0; i < 6; i++) { await page.mouse.move(p.x + 40, p.y, {steps:3}); await page.mouse.move(p.x - 40, p.y, {steps:3}); } await page.mouse.up(); await page.waitForTimeout(1800);
console.log('big:', await st());
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
