import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const SP = SHOTS;
const browser = await chromium.launch(LAUNCH);
const page = await (await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errors=[]; page.on('pageerror', e=>errors.push(e.message));
await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
await page.addStyleTag({content: ':root,html[data-rot]{--sr:30px !important;--sl:30px !important}'});
await page.click('#btnNew'); await page.waitForTimeout(300);
for (let i=0;i<5;i++){ if(await page.$('#msgLayer .tap')) await page.click('#msgLayer .win'); await page.waitForTimeout(120); }
await page.evaluate(() => { for(const k of ['zeri','kyabetsu','mikan','enoki','kusa']) S.items[k]=3; const mk=(bug)=>({bug, si:BUGS[bug].plan.length-1, prog:0, hunger:60, wet:60, clean:70, tick:now(), pending:false, from:'宗像大社', born:'taisha', bornSlot:'yoru', since:dayKey(), ind:{hp:1,atk:1,def:1,spd:1,heal:1}, log:newLog(), tot:newLog(), place:'beranda', trouble:null, dirt:[], foods:[], soak:0, hideUntil:0, deco:[{id:1,k:'eda_nagai',x:60,y:50}], mat:null, soilAge:10, known:true, pers:'makezu', name:'のこのこ', size:51, sex:'オス', moves:['stag','stag_atk']}); S.boxes=['wide','futsu','ami']; S.cases=[mk('nokogiri'), mk('ageha'), mk('kamakiri')]; for(const b of ['nokogiri','ageha','kamakiri']) S.dex[b]={found:dayKey(), where:'x', known:1, adult:dayKey()}; const h = new Date(now()).getHours(); S.demoOff += ((22 - h + 24) % 24) * 3600e3; save(); });
await page.click('#rtabs [data-t=home]'); await page.waitForTimeout(200); await page.click('#rtItems'); await page.waitForTimeout(450); await page.screenshot({ path: `${SP}/v20-items.png` });
console.log(await page.evaluate(() => { const d = document.getElementById('itemsPanel').getBoundingClientRect(), t = document.getElementById('rtabs').getBoundingClientRect(); return {panelRight: Math.round(d.right), tagLeft: Math.round(t.left), panelW: Math.round(d.width)}; }));
await page.click('#rtItems'); await page.waitForTimeout(400); await page.screenshot({ path: `${SP}/v20-home.png` });
for (const i of [0,1,2]) { await page.click(`.case[data-i="${i}"]`); await page.waitForTimeout(700); await page.screenshot({ path: `${SP}/v20-obs${i}.png` }); await page.click('#btnBack'); await page.waitForTimeout(200); }
console.log('ERRORS', errors.length ? errors : 'none');
await browser.close();
