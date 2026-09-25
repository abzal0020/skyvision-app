const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.LANDING_TEST_URL||'http://127.0.0.1:4173';
 try {
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('heading',{level:1,name:/Производство/}).waitFor();
  assert.equal(await page.locator('.landing-network').count(),0);
  assert.equal(await page.getByRole('link',{name:'Вход в портал',exact:true}).count(),1);
  await page.screenshot({path:'qa/corporate-home.png',fullPage:true});
  await page.getByRole('link',{name:'Вход в портал',exact:true}).click();
  await page.getByRole('heading',{name:'Личный кабинет',exact:true}).waitFor();
  await page.getByRole('button',{name:'Регистрация',exact:true}).click();
  for(const role of ['Производство','Экспедитор','Покупатель','Другое']) await page.getByRole('radio',{name:role,exact:true}).check();
  await page.screenshot({path:'qa/corporate-registration.png',fullPage:true});
  for(const width of [390,320]) {
   await page.setViewportSize({width,height:844});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`registration ${width}`);
  }
  // Inspect the request locally without registering a real user or sending email.
  let submitted;
  await page.route('**/auth/v1/signup**',async route=>{
   submitted=route.request().postDataJSON();
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user:{id:'00000000-0000-4000-8000-000000000099',email:'qa@example.com'},session:null})});
  });
  for(const [name,value] of [['company_name','QA Company'],['city','Shanghai'],['full_name','QA Person'],['position','Manager'],['phone','+861234567890'],['email','qa@example.com'],['password','ExamplePassword123'],['confirm_password','ExamplePassword123']]) await page.locator(`[name="${name}"]`).fill(value);
  await page.locator('[name="country"]').selectOption('CN');
  await page.getByRole('button',{name:'Создать аккаунт',exact:true}).click();
  await page.getByRole('status').filter({hasText:'восстановите его'}).waitFor();
  assert.equal(submitted.data.registration.business_type,'other');
  assert.equal(submitted.data.registration.company_name,'QA Company');
  assert.equal(submitted.data.registration.phone,'+861234567890');
  await page.getByRole('button',{name:'中文',exact:true}).click();
  assert.equal(await page.getByRole('radio').count(),4);
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('heading',{level:1,name:/生产、贸易/}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Chinese homepage');
  await page.getByRole('button',{name:'RU',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'qa/corporate-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('CORPORATE_OK: single portal entry, no old diagram, 4 business types, registration payload, RU/ZH, mobile, no JS errors. Signup request mocked; no email sent.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
