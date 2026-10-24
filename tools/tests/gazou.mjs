// 絵（画像）になった虫が、ケースの中と虫かご一覧でちゃんと出るか。スクリーンショット k-*.png を目で見る
import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const browser = await chromium.launch(LAUNCH);
const page = await (await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
await page.click('#btnNew'); await page.waitForTimeout(300);
for (let i=0;i<5;i++){ if(await page.$('#msgLayer .tap')) await page.click('#msgLayer .win'); await page.waitForTimeout(120); }
for (const [tag, hour, deco] of [['night', 22, [{id:1,k:'eda_nagai',x:60,y:50}]], ['floor', 22, []], ['day', 13, []]]) {
  await page.evaluate(([hour, deco]) => { const mk=(bug)=>({bug, si:BUGS[bug].plan.length-1, prog:0, hunger:80, wet:60, clean:90, tick:now(), pending:false, from:'宗像大社', born:'taisha', bornSlot:'yoru', since:dayKey(), ind:{hp:1,atk:1,def:1,spd:1,heal:1}, log:newLog(), tot:newLog(), place:'beranda', trouble:null, dirt:[], foods:[], soak:0, hideUntil:0, deco, mat:'mat_fuyo', soilAge:10, known:true, pers:'makezu', name:'カブ太', size:70, sex:'オス', moves:['beetle']}); S.boxes=['wide']; S.cases=[mk('kabuto')]; S.dex.kabuto={found:dayKey(), where:'x', known:1, adult:dayKey()}; S.demoOff = 0; const h = new Date(now()).getHours(); S.demoOff += ((hour - h + 24) % 24) * 3600e3; save(); }, [hour, deco]);
  await page.evaluate(() => { const v=document.querySelector('#rtabs [data-t=home]'); v.click(); });
  await page.waitForTimeout(250);
  if (tag === 'night') await page.screenshot({ path: `${SHOTS}/k-home.png` });
  await page.click('.case[data-i="0"]'); await page.waitForTimeout(900);
  await page.screenshot({ path: `${SHOTS}/k-${tag}.png` });
}
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
