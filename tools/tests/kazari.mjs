import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const SP = SHOTS;
const browser = await chromium.launch(LAUNCH);
const page = await (await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
const click = async sel => { const el = await page.waitForSelector(sel); await el.evaluate(e => e.scrollIntoView({block:'center'})); await page.waitForTimeout(60); await el.click(); };
const shot = async n => page.screenshot({ path: `${SP}/${n}.png` });
const tapMsg = async () => { for (let i = 0; i < 20; i++) { if (await page.$('#msgLayer input')) return; const a = await page.$('#msgLayer .ans button'); if (a) { await a.click(); await page.waitForTimeout(120); continue; } if (await page.$('#msgLayer .tap')) { await page.click('#msgLayer .win', {position:{x:20,y:20}}); await page.waitForTimeout(120); continue; } return; } };
const toClient = (x, y) => page.evaluate(([x,y]) => { const svg = document.getElementById('sceneSvg'); const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(svg.getScreenCTM()); return {x:q.x, y:q.y}; }, [x,y]);
const scrollScene = () => page.evaluate(() => document.getElementById('scene').scrollIntoView({block:'start'}));
const objCenter = () => page.evaluate(() => { const r = document.getElementById('toolObj').getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2}; });
const stDeco = () => page.evaluate(() => ({ deco:S.cases[0].deco.map(d => [d.k, Math.round(d.x), Math.round(d.y)]), mat:S.cases[0].mat, foods:S.cases[0].foods.map(f => [f.k, Math.round(f.x), Math.round(f.y)]), items:{ie_kabu:S.items.ie_kabu, eda_kunugi:S.items.eda_kunugi, mat_fuyo:S.items.mat_fuyo} }));
await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
await click('#btnNew'); await page.waitForTimeout(300); await tapMsg();
await page.evaluate(() => { S.money += 500; for(const k in ITEMS) if(!ITEMS[k].cat) S.items[k] = 10; save(); });
await click('#tabs [data-t=out]'); await page.selectOption('#demoSpot', 'taisha'); await click('#btnDemoGo'); await tapMsg();
for (let t = 0; t < 3; t++) { await click('#btnFind'); await page.waitForTimeout(1800); if (await page.$('#bTake')) { await click('#bTake'); await tapMsg(); if (await page.$('#msgLayer .ans')) { await (await page.$$('#msgLayer .ans button'))[0].click(); await page.waitForTimeout(150); await (await page.$$('#msgLayer .ans button'))[0].click(); await tapMsg(); } break; } else if (await page.$('#btnAgain')) await click('#btnAgain'); }
await click('#btnLeave'); await click('#rtabs [data-t=home]'); await page.waitForTimeout(200);
// お店でかざりを買う
await click('#tabs [data-t=shop]'); await page.waitForTimeout(200); await shot('v7-shop');
for (const k of ['ie_kabu','eda_kunugi','ha_hana','mat_fuyo','ko_ishi']) await click(`[data-k=${k}]`);
await click('#rtabs [data-t=home]'); await page.waitForTimeout(200); await click('.case[data-i="0"]'); await page.waitForTimeout(900);
// かざり：きりかぶを置く
await click('[data-tool=kazari]'); await page.waitForTimeout(150); await shot('v7-pick'); await click('[data-deco=ie_kabu]'); await page.waitForTimeout(300); await scrollScene(); await page.waitForTimeout(300);
let o = await objCenter(); let t = await toClient(25, 48); await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(t.x, t.y - 10, {steps:6}); await page.mouse.up(); await page.waitForTimeout(300); await tapMsg();
// 枝も置く
await click('[data-deco=eda_kunugi]'); await page.waitForTimeout(300); await scrollScene(); await page.waitForTimeout(300); o = await objCenter(); t = await toClient(75, 48); await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(t.x, t.y - 10, {steps:6}); await page.mouse.up(); await page.waitForTimeout(300); await tapMsg();
// マット
await click('[data-deco=mat_fuyo]'); await page.waitForTimeout(200); await tapMsg(); await page.waitForTimeout(300);
console.log('placed:', await stDeco()); await scrollScene(); await shot('v7-decorated');
// 置いたきりかぶを直接つまんで動かす
let d = await page.evaluate(() => S.cases[0].deco[0]); let from = await toClient(d.x, d.y - 8); let to = await toClient(50, 48);
await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(to.x, to.y, {steps:8}); await shot('v7-dragging'); await page.mouse.up(); await page.waitForTimeout(400);
console.log('moved:', await stDeco(), await page.$eval('#obsTxt', e => e.textContent.slice(0,30)));
// 枝をしまう
d = await page.evaluate(() => S.cases[0].deco.find(x => x.k === 'eda_kunugi')); from = await toClient(d.x, d.y - 8); const bin = await page.evaluate(() => { const r = document.getElementById('scene').getBoundingClientRect(); return {x:r.right - 40, y:r.bottom - 24}; });
await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(bin.x, bin.y, {steps:8}); await page.mouse.up(); await page.waitForTimeout(400);
console.log('binned:', await stDeco());
// エサを置いて動かす
await click('[data-tool=esa]'); await page.waitForTimeout(150); await scrollScene(); await page.waitForTimeout(300); o = await objCenter(); t = await toClient(60, 40); await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(t.x, t.y, {steps:6}); await page.mouse.up(); await page.waitForTimeout(300); await tapMsg();
const f = await page.evaluate(() => S.cases[0].foods[0]); from = await toClient(f.x, f.y); to = await toClient(30, 42); await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(to.x, to.y, {steps:8}); await page.mouse.up(); await page.waitForTimeout(400);
console.log('food moved:', await stDeco());
// 夜にして、枝にのぼるか（枝をもう一度置く）
await click('[data-tool=kazari]'); await page.waitForTimeout(150); await click('[data-deco=eda_kunugi]'); await page.waitForTimeout(300); await scrollScene(); await page.waitForTimeout(300); o = await objCenter(); t = await toClient(75, 48); await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(t.x, t.y - 10, {steps:6}); await page.mouse.up(); await page.waitForTimeout(300); await tapMsg();
await page.evaluate(() => { const c = S.cases[0]; c.si = 3; c.prog = 0; c.pending = false; c.ind = {hp:1,atk:1,def:1,spd:1,heal:1}; finalize(c); c.hideUntil = 0; c.pers = 'futsu'; const h = new Date(now()).getHours(); S.demoOff += ((22 - h + 24) % 24) * 3600 * 1000; save(); });
await click('#btnBack'); await click('.case[data-i="0"]'); await page.waitForTimeout(900); await scrollScene(); await shot('v7-night-perch'); console.log('night:', await page.$eval('#obsTxt', e => e.textContent.slice(0,40)));
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
