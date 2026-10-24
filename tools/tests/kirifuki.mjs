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
const st = () => page.evaluate(() => { const c = S.cases[0]; return {wetZ:c.wetZ.map(Math.round), soakZ:c.soakZ.map(Math.round), wet:Math.round(c.wet), stress:Math.round(c.stress), genki:genkiOf(c), soilAge:Math.round(c.soilAge||0), big:obsSession && obsSession.big && obsSession.big.step, txt:document.getElementById('obsTxt').textContent.slice(0,40)}; });
// 道具をつかんで、道具の中心を(cx,cy)クライアント座標へ
const grab = async (tool) => { if (tool) { await click(`[data-tool=${tool}]`); await page.waitForTimeout(150); } await scrollScene(); await page.waitForTimeout(350); const o = await objCenter(); await page.mouse.move(o.x, o.y); await page.mouse.down(); return o; };
const HOT = {kiri:{x:-22,y:-42}, big:{x:-6,y:30}, fukin:{x:0,y:0}};
const moveHot = async (tool, x, y, steps=8) => { const t = await toClient(x, y); await page.mouse.move(t.x - HOT[tool].x, t.y - HOT[tool].y, {steps}); };
await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
await click('#btnNew'); await page.waitForTimeout(300); await tapMsg();
await page.evaluate(() => { S.cases[0] = {bug:'kabuto', si:0, prog:0, hunger:80, wet:40, clean:60, tick:now(), pending:false, from:'宗像大社', born:'taisha', bornSlot:'hiru', since:dayKey(), ind:{hp:1,atk:1,def:1,spd:1,heal:1}, log:newLog(), tot:newLog(), place:'genkan', wide:false, trouble:null, dirt:[], foods:[], soak:0, hideUntil:0, deco:[], mat:null, soilAge:80}; S.dex.kabuto={found:dayKey(), where:'宗像大社'}; save(); });
await click('#rtabs [data-t=home]'); await click('.case[data-i="0"]'); await page.waitForTimeout(900);
console.log('start:', await st());
const bp = await page.evaluate(() => { const p = placeBug(S.cases[0], slotOf()); return {x:p.x, y:p.y}; });
// きりふき：一か所にかけつづける
await grab('kiri'); await moveHot('kiri', 90, 60); await page.waitForTimeout(3500); await shot('v10-onespot'); await page.mouse.up(); await page.waitForTimeout(300); await tapMsg(); console.log('one spot:', await st());
// きりふき：虫にかける
await grab(); await moveHot('kiri', bp.x, bp.y - 8); await page.waitForTimeout(1500); await shot('v10-spraybug'); await page.mouse.up(); await page.waitForTimeout(300); await tapMsg(); console.log('spray bug:', await st());
// きりふき：ぜんたいに
await grab(); for (const x of [10, 30, 50, 70]) { await moveHot('kiri', x, 66, 4); await page.waitForTimeout(900); } await page.mouse.up(); await page.waitForTimeout(300); await tapMsg(); console.log('spread:', await st()); await scrollScene(); await shot('v10-spread');
// 大そうじ：🤏をすばやく虫にぶつける
await grab('big'); await shot('v10-big-tool'); await moveHot('big', bp.x - 30, bp.y, 3); await moveHot('big', bp.x + 30, bp.y, 2); await page.mouse.up(); await page.waitForTimeout(300); console.log('fast hit:', await st());
// 🤏を虫の上で止める → つまむ → ひなんケースへ
await grab(); await moveHot('big', bp.x, bp.y, 10); for (let i = 0; i < 14; i++) { await moveHot('big', bp.x + (i%2), bp.y, 1); await page.waitForTimeout(90); } await shot('v10-pinch');
const ref = await page.evaluate(() => { const r = document.getElementById('refuge').getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2}; });
await page.mouse.move(ref.x + 6, ref.y - 30, {steps:10}); await page.mouse.up(); await page.waitForTimeout(400); await tapMsg(); console.log('refuge:', await st());
// 🧹で土をなでる
await grab(); await scrollScene(); await shot('v10-broom');
for (let k = 0; k < 5; k++) { await moveHot('big', 85, 76, 8); await moveHot('big', 12, 76, 8); const s2 = await st(); if (s2.big === 3) break; } await page.mouse.up(); await page.waitForTimeout(400); console.log('raked:', await st());
// 🤏をひなんケースの上で止める → もどす
await grab(); const ref2 = await page.evaluate(() => { const r = document.getElementById('refuge').getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2}; });
await page.mouse.move(ref2.x + 6, ref2.y - 30, {steps:8}); for (let i = 0; i < 10; i++) { await page.mouse.move(ref2.x + 6 + (i%2), ref2.y - 30, {steps:1}); await page.waitForTimeout(80); }
const to = await toClient(50, 40); await page.mouse.move(to.x, to.y, {steps:10}); await page.mouse.up(); await page.waitForTimeout(400); await tapMsg(); console.log('done:', await st()); await scrollScene(); await shot('v10-done');
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
