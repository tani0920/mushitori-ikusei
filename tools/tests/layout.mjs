import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const browser = await chromium.launch(LAUNCH);
for (const [w,h,sr] of [[844,390,0],[844,390,30],[740,360,30],[1180,820,0]]) {
const page = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
if (sr) await page.addStyleTag({content: `:root,html[data-rot]{--sr:${sr}px !important;--sl:${sr}px !important}`});
await page.click('#btnNew'); await page.waitForTimeout(300);
for (let i=0;i<5;i++){ if(await page.$('#msgLayer .tap')) await page.click('#msgLayer .win'); await page.waitForTimeout(120); }
await page.evaluate(() => { S.cases[0] = {bug:'kabuto', si:1, prog:10, hunger:60, wet:40, clean:70, tick:now(), pending:false, from:'宗像大社', born:'taisha', bornSlot:'yoru', since:dayKey(), ind:{hp:1,atk:1,def:1,spd:1,heal:1}, log:newLog(), tot:newLog(), place:'genkan', trouble:null, dirt:[], foods:[], soak:0, hideUntil:0, deco:[], mat:null, soilAge:10, known:true}; S.dex.kabuto={found:dayKey(), where:'宗像大社', known:1}; save(); });
await page.click('#rtabs [data-t=home]'); await page.waitForTimeout(200); await page.click('.case[data-i="0"]'); await page.waitForTimeout(700);
const m = await page.evaluate(() => { const v = document.getElementById('view'), sc = document.getElementById('scene').getBoundingClientRect(), hud = document.getElementById('hud').getBoundingClientRect(), r = document.querySelector('.obsR').getBoundingClientRect(), rt = document.getElementById('rtabs').getBoundingClientRect();
  return {hScroll: v.scrollWidth - v.clientWidth, vScroll: v.scrollHeight - v.clientHeight, sceneTop: Math.round(sc.top), hudBottom: Math.round(hud.bottom), obsRRight: Math.round(r.right), tagsLeft: Math.round(rt.left), sceneH: Math.round(sc.height)}; });
console.log(w, h, sr, m);
await page.screenshot({ path: `${SHOTS}/v19-${w}-${sr}.png` });
await page.close(); }
await browser.close();
