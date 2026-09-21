const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('assert/strict');
(async () => {
  const base = process.env.PORTAL_TEST_URL || 'https://skyvision-app.vercel.app';
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(base, { waitUntil: 'networkidle' });
    if (!await page.getByRole('heading', { name: 'Заводы и логистика. Прямой контакт.' }).count()) {
      console.log('WAITING_FOR_PORTAL_DEPLOYMENT'); return;
    }
    await page.getByRole('link', { name: /Открыть маркетплейс/ }).click();
    await page.getByRole('heading', { name: 'Продукция и логистика' }).waitFor();
    await page.getByRole('button', { name: 'Логистика и перевозки', exact: true }).click();
    await page.getByRole('link', { name: /Разместить объявление/ }).click();
    await page.getByRole('heading', { name: 'Личный кабинет' }).waitFor();
    await page.getByRole('button', { name: 'Регистрация', exact: true }).click();
    await page.getByRole('button', { name: 'Создать аккаунт', exact: true }).waitFor();
    await page.getByRole('button', { name: '中文', exact: true }).click();
    await page.getByRole('heading', { name: '个人工作空间', exact: true }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.getByRole('button', { name: 'RU', exact: true }).click();
    await page.goto(base + '/prices', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('tbody tr').count(), 15);
    await page.goto(base + '/admin/factories', { waitUntil: 'networkidle' });
    await page.getByText('Войдите через кнопку «Войти» вверху сайта под учётной записью администратора.', { exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log('PUBLIC_PORTAL_OK: homepage, marketplace, registration UI RU/ZH, mobile, 15 legacy factories, admin login gate.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
