const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.LANDING_TEST_URL || 'http://127.0.0.1:4173';
 try {
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('heading',{level:1,name:/Находите партнёров/}).waitFor();
  assert.equal(await page.getByRole('link',{name:'Войти в платформу',exact:true}).count(),1);
  assert.equal(await page.locator('main a[href="/portal"],main a[href="/marketplace"]').count(),0);
  await page.screenshot({path:'qa/landing-desktop.png',fullPage:true});
  await page.getByRole('link',{name:'Войти в платформу',exact:true}).click();
  await page.getByRole('heading',{name:'Личный кабинет',exact:true}).waitFor();
  await page.getByRole('button',{name:'Регистрация',exact:true}).click();
  await page.getByRole('button',{name:'Создать аккаунт',exact:true}).waitFor();
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'中文',exact:true}).click();
  await page.getByRole('heading',{level:1,name:/找到合作伙伴/}).waitFor();
  assert.equal(await page.getByRole('link',{name:'登录平台',exact:true}).count(),1);
  for(const lang of ['zh','ru']) {
   if(lang==='ru') await page.getByRole('button',{name:'RU',exact:true}).click();
   for(const width of [390,320]) {
    await page.setViewportSize({width,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Overflow ${lang} ${width}`);
   }
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'qa/landing-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('LANDING_OK: single entry, login and registration, RU/ZH, mobile 320/390px, no JS errors.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
