import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const SP = SHOTS;
const browser = await chromium.launch(LAUNCH);
for (const [vw, vh, tag] of [[390, 844, 'rot'], [844, 390, 'land']]) {
const page = await (await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
// 画面上の本物の座標で、その要素の中心
const center = sel => page.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return f2c(r.left + r.width/2, r.top + r.height/2); }, sel);
const tap = async sel => { const c = await center(sel); await page.mouse.click(c.x, c.y); await page.waitForTimeout(150); };
const toClient = (x, y) => page.evaluate(([x,y]) => { const svg = document.getElementById('sceneSvg'); const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(svg.getScreenCTM()); return {x:q.x, y:q.y}; }, [x,y]);
const tapMsg = async () => { for (let i = 0; i < 20; i++) { if (await page.$('#msgLayer .ans button')) { await tap('#msgLayer .ans button'); continue; } if (await page.$('#msgLayer .tap')) { await tap('#msgLayer .win'); continue; } return; } };
await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(600);
console.log(tag, 'rotMode', await page.evaluate(() => rotMode), 'land', await page.evaluate(() => document.documentElement.classList.contains('land')));
await page.screenshot({ path: `${SP}/v16-${tag}-title.png` });
await tap('#btnNew'); await page.waitForTimeout(300); await tapMsg();
await page.evaluate(() => { S.cases[0] = {bug:'kabuto', si:1, prog:10, hunger:60, wet:40, clean:70, tick:now(), pending:false, from:'宗像大社', born:'taisha', bornSlot:'yoru', since:dayKey(), ind:{hp:1,atk:1,def:1,spd:1,heal:1}, log:newLog(), tot:newLog(), place:'genkan', wide:false, trouble:null, dirt:[{x:60,y:30,hp:3,k:'fun'}], foods:[], soak:0, hideUntil:0, deco:[{id:1,k:'ie_kabu',x:24,y:50}], mat:null, soilAge:10, known:true}; S.dex.kabuto={found:dayKey(), where:'宗像大社', known:1}; save(); });
await tap('#tabs [data-t=home]'); await page.screenshot({ path: `${SP}/v16-${tag}-home.png` });
await tap('.case[data-i="0"]'); await page.waitForTimeout(800); await page.screenshot({ path: `${SP}/v16-${tag}-obs.png` });
// きりふき：道具をつかんで、土の上で止める
await tap('[data-tool=kiri]'); await page.waitForTimeout(400);
const w0 = await page.evaluate(() => Math.round(S.cases[0].wet));
let o = await center('#toolObj'), t = await toClient(50, 66);
await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(t.x, t.y, {steps:8}); await page.waitForTimeout(1200); await page.screenshot({ path: `${SP}/v16-${tag}-kiri.png` }); await page.mouse.up(); await page.waitForTimeout(300); await tapMsg();
const w1 = await page.evaluate(() => S.cases[0].wetZ.map(Math.round));
// ふきん：よごれをこする
await tap('[data-tool=fukin]'); await page.waitForTimeout(400); o = await center('#toolObj'); t = await toClient(60, 30);
await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(t.x, t.y, {steps:8}); for (let k=0;k<8;k++) await page.mouse.move(t.x + (k%2?5:-5), t.y + (k%2?3:-3), {steps:2}); await page.mouse.up(); await page.waitForTimeout(400); await tapMsg();
const d1 = await page.evaluate(() => S.cases[0].dirt.length);
// ケースのこと
await tap('#rtCase'); await page.waitForTimeout(450); await page.screenshot({ path: `${SP}/v16-${tag}-drawer.png` });
const dr = await page.evaluate(() => { const r = document.getElementById('drawer').getBoundingClientRect(); return {left:Math.round(r.left), right:Math.round(r.right), W:document.documentElement.style.getPropertyValue('--W')}; });
const rtPos = await center('#rtCase'); await tap('#rtCase'); await page.waitForTimeout(400); await tap('#rtItems'); await page.waitForTimeout(450); await page.screenshot({ path: `${SP}/v16-${tag}-items.png` }); await tap('#rtItems'); await page.waitForTimeout(400); await tap('#tabs [data-t=out]'); await page.waitForTimeout(300); await page.screenshot({ path: `${SP}/v16-${tag}-out.png` }); await tap('#tabs [data-t=dex]'); await page.waitForTimeout(300); await page.screenshot({ path: `${SP}/v16-${tag}-dex.png` }); await tap('#rtabs [data-t=home]'); await page.waitForTimeout(300); const homeOk = await page.evaluate(() => tab); console.log(tag, 'home', homeOk, 'rtCase hidden', await page.evaluate(() => document.getElementById('rtCase').hidden));
console.log(tag, 'wet', w0, '->', w1, 'dirt', d1, 'drawer', dr, 'ERRORS:', errors.length ? errors : 'none');
await page.close();
}
await browser.close();
