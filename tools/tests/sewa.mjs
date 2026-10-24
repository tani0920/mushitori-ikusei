import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const SP = SHOTS;
const browser = await chromium.launch(LAUNCH);
const page = await (await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
const click = async sel => { const el = await page.waitForSelector(sel); await el.evaluate(e => e.scrollIntoView({block:'center'})); await page.waitForTimeout(60); await el.click(); };
const shot = async n => page.screenshot({ path: `${SP}/${n}.png` });
const tapMsg = async () => { for (let i = 0; i < 20; i++) { if (await page.$('#msgLayer input')) return; const a = await page.$('#msgLayer .ans button'); if (a) { await a.click(); await page.waitForTimeout(120); continue; } if (await page.$('#msgLayer .tap')) { await page.click('#msgLayer .win', {position:{x:20,y:20}}); await page.waitForTimeout(120); continue; } return; } };
const st = (i=0) => page.evaluate(i => { const c = S.cases[i]; return c && { bug:c.bug, si:c.si, prog:Math.round(c.prog), genki:genkiOf(c), stage:stageOf(c).k, hunger:Math.round(c.hunger), wet:Math.round(c.wet), clean:Math.round(c.clean), soak:Math.round(c.soak||0), dirt:(c.dirt||[]).length, foods:(c.foods||[]).length, over:c.log.over, pers:c.pers, name:c.name }; }, i);
const toClient = (x, y) => page.evaluate(([x,y]) => { const svg = document.getElementById('sceneSvg'); const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(svg.getScreenCTM()); return {x:q.x, y:q.y}; }, [x,y]);
const scrollScene = () => page.evaluate(() => document.getElementById('scene').scrollIntoView({block:'start'}));
const objCenter = () => page.evaluate(() => { const r = document.getElementById('toolObj').getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2}; });
const HOT = {yubi:{x:-6, y:-26}, fukin:{x:0, y:0}, kiri:{x:-16, y:-30}, esa:{x:0, y:0}};
// 道具をつかんで、hot が viewBox(x,y) に来る位置まで運ぶ
const grabTo = async (tool, x, y) => { await click(`[data-tool=${tool}]`); await page.waitForTimeout(120); await scrollScene(); await page.waitForTimeout(350); const o = await objCenter(); const t = await toClient(x, y); await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(t.x - HOT[tool].x, t.y - HOT[tool].y, {steps:6}); };
const care = async (i=0) => {
  if (await page.$('[data-tool=esa]:not([disabled])')) { await grabTo('esa', 50, 40); await shot('v6-esa-drag'); await page.mouse.up(); await page.waitForTimeout(300); await tapMsg(); }
  for (let k = 0; k < 10; k++) { const s = await st(i); const band = await page.evaluate(i => WET_BAND[BUGS[S.cases[i].bug].shape], i); if (s.wet >= band[0] + 5) break;
    await grabTo('kiri', 50, 62); await page.waitForTimeout(700); if (k === 0) await shot('v6-kiri-hold'); await page.mouse.up(); await page.waitForTimeout(250); await tapMsg(); }
  const dirt = await page.evaluate(i => (S.cases[i].dirt||[]).map(d => [d.x, d.y]).concat((S.cases[i].foods||[]).filter(f=>f.old).map(f=>[f.x,f.y])), i);
  if (dirt.length) { await grabTo('fukin', dirt[0][0], dirt[0][1]);
    for (const [x,y] of dirt) { const q = await toClient(x, y); for (let k = 0; k < 8; k++) await page.mouse.move(q.x + (k%2?4:-4), q.y + (k%3), {steps:2}); }
    await shot('v6-fukin-drag'); await page.mouse.up(); await page.waitForTimeout(400); await tapMsg(); }
};
const openCase = async i => { await click('#rtabs [data-t=home]'); await page.waitForTimeout(200); await click(`.case[data-i="${i}"]`); await page.waitForTimeout(900); if (await page.$('#evLayer')) { await page.waitForTimeout(4500); await page.click('#evLayer'); await page.waitForTimeout(300); await tapMsg(); if (await page.$('.full .close')) { await click('.full .close'); await page.waitForTimeout(300); if (await page.$('#msgLayer input')) { await page.fill('#msgLayer input', 'テスト'); await click('#msgLayer .ans button'); await tapMsg(); } } await page.waitForTimeout(300); } };

await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
await click('#btnNew'); await page.waitForTimeout(300); await tapMsg();
await page.evaluate(() => { S.money += 300; for(const k in ITEMS) S.items[k] = 10; save(); });
await click('#tabs [data-t=out]'); await page.selectOption('#demoSpot', 'akama'); await click('#btnDemoGo'); await tapMsg();
for (let t = 0; t < 3; t++) { await click('#btnFind'); await page.waitForTimeout(1800); if (await page.$('#bTake')) { await click('#bTake'); await tapMsg(); if (await page.$('#msgLayer .ans')) { await (await page.$$('#msgLayer .ans button'))[0].click(); await page.waitForTimeout(150); await (await page.$$('#msgLayer .ans button'))[0].click(); await tapMsg(); } break; } else if (await page.$('#btnAgain')) await click('#btnAgain'); }
await click('#btnLeave'); await click('#tabs [data-t=opt]'); await page.waitForTimeout(150); await click('[data-h="6"]'); await click('[data-h="6"]'); await click('[data-h="6"]');
await openCase(0); await shot('v6-obs'); console.log('before:', await st());
// 空いている場所をタップしても何も起きない
await scrollScene(); let p = await toClient(50, 50); await page.mouse.click(p.x, p.y); await page.waitForTimeout(200); console.log('tap txt:', await page.$eval('#obsTxt', e => e.textContent.slice(0,30)));
// きりふきを動かしているだけでは出ない
await grabTo('kiri', 30, 60); const w0 = (await st()).wet; for (let k = 0; k < 6; k++) { const q = await toClient(30 + k*8, 60); await page.mouse.move(q.x + 16, q.y + 30, {steps:3}); await page.waitForTimeout(60); } const w1 = (await st()).wet; await page.mouse.up(); await page.waitForTimeout(200); await tapMsg(); console.log('moving spray wet:', w0, '->', w1);
await care(0); console.log('after care:', await st());
// ゆび：かくれ家をのぞく
const H = await page.evaluate(() => HIDE_POS[hideKind(BUGS[S.cases[0].bug])]); await grabTo('yubi', H.x, H.y); await page.mouse.up(); await page.waitForTimeout(900); console.log('peek:', await page.$eval('#obsTxt', e => e.textContent.slice(0,30)));
for (let d = 0; d < 10; d++) { await click('#btnBack'); await click('#tabs [data-t=opt]'); await page.waitForTimeout(150); await click('[data-h="24"]'); await page.waitForTimeout(250); await openCase(0); const s = await st(); console.log('day', d+1, s.stage, s.si, 'prog', s.prog, 'genki', s.genki, 'dirt', s.dirt, s.pers||''); if (s.stage === 'adult' && s.name) break; await care(0); }
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
