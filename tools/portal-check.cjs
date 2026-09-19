const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs');
const assert = require('assert/strict');
const base = process.env.PORTAL_TEST_URL || 'http://127.0.0.1:4173';
const password = process.env.PORTAL_QA_PASSWORD;
const errors = [];
async function waitText(page, text) { await page.getByText(text, { exact: false }).first().waitFor({ timeout: 20000 }); }
async function login(page, suffix) {
  await page.goto(base + '/portal');
  await page.getByLabel('Email', { exact: true }).fill(`skyvision-portal-qa-${suffix}@example.invalid`);
  await page.getByLabel('Пароль', { exact: true }).fill(password);
  await page.locator('main').getByRole('button', { name: 'Войти', exact: true }).click();
  await page.getByRole('heading', { name: 'Добро пожаловать в SkyVision' }).waitFor({ timeout: 25000 });
}
async function company(page, name, activity) {
  await page.getByLabel('Название компании', { exact: true }).fill(name);
  await page.getByLabel('Город', { exact: true }).fill('Астана');
  if (activity !== 'Завод') { await page.getByLabel('Завод', { exact: true }).uncheck(); await page.getByLabel(activity, { exact: true }).check(); }
  await page.getByRole('button', { name: 'Создать компанию', exact: true }).click();
  await page.getByRole('heading', { name: 'Рабочий кабинет', exact: true }).waitFor({ timeout: 20000 });
}
(async () => {
  fs.mkdirSync('qa', { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const contexts = await Promise.all([0, 1, 2].map(() => browser.newContext({ viewport: { width: 1440, height: 1000 } })));
  const [a, b, c] = await Promise.all(contexts.map(ctx => ctx.newPage()));
  [a, b, c].forEach(p => p.on('pageerror', e => errors.push(e.message)));
  try {
    await a.goto(base + '/marketplace');
    await a.getByRole('heading', { name: 'Продукция и логистика' }).waitFor();
    await a.getByRole('button', { name: '中文', exact: true }).click();
    await a.getByRole('heading', { name: '产品与物流市场' }).waitFor();
    await a.getByRole('button', { name: 'RU', exact: true }).click();
    await login(a, 'a'); await company(a, 'QA Portal Factory', 'Завод');
    await a.getByRole('link', { name: 'Мои объявления', exact: true }).click();
    await a.getByRole('button', { name: 'Добавить объявление' }).click();
    await a.getByLabel('Название на русском', { exact: true }).fill('QA Кормовая мука');
    await a.getByLabel('Название на китайском', { exact: true }).fill('QA 饲料面粉');
    await a.getByLabel('Описание на русском', { exact: true }).fill('Тестовое объявление. Будет удалено после проверки.');
    await a.getByLabel('Цена — пусто, если по запросу', { exact: true }).fill('190');
    await a.getByLabel('Публикация', { exact: true }).selectOption('published');
    await a.getByRole('button', { name: 'Сохранить объявление', exact: true }).click();
    await a.getByRole('heading', { name: 'QA Кормовая мука', exact: true }).waitFor();
    await a.screenshot({ path: 'qa/portal-listings.png', fullPage: true });
    await login(b, 'b'); await company(b, 'QA Portal Buyer', 'Покупатель');
    await b.goto(base + '/marketplace');
    const card = b.locator('article').filter({ has: b.getByRole('heading', { name: 'QA Кормовая мука', exact: true }) });
    await card.getByRole('button', { name: 'Связаться с компанией', exact: true }).click();
    await card.getByLabel('Объём, маршрут и пожелания', { exact: true }).fill('Нужны 100 тонн в Хоргос. Уточните стоимость доставки.');
    await card.getByRole('button', { name: 'Отправить заявку', exact: true }).click();
    await b.getByRole('heading', { name: 'Переписка', exact: true }).waitFor({ timeout: 20000 });
    const threadUrl = b.url();
    await b.getByLabel('Ваше сообщение', { exact: true }).fill('Здравствуйте, подтвердите наличие.');
    await b.getByRole('button', { name: 'Отправить', exact: true }).click();
    await waitText(b, 'Здравствуйте, подтвердите наличие.');
    await a.goto(base + '/portal/requests');
    await a.getByRole('link', { name: /QA Кормовая мука/ }).click();
    await waitText(a, 'Здравствуйте, подтвердите наличие.');
    await a.getByLabel('Ваше сообщение', { exact: true }).fill('Добрый день! Продукция есть в наличии.');
    await a.getByRole('button', { name: 'Отправить', exact: true }).click();
    await waitText(b, 'Добрый день! Продукция есть в наличии.');
    await a.screenshot({ path: 'qa/portal-thread.png', fullPage: true });
    await login(c, 'c');
    await c.goto(threadUrl);
    assert.equal(await c.getByText('Здравствуйте, подтвердите наличие.', { exact: true }).count(), 0);
    await a.goto(base + '/portal/company');
    await a.getByLabel('Email', { exact: true }).fill('skyvision-portal-qa-c@example.invalid');
    await a.getByLabel('Роль', { exact: true }).selectOption('viewer');
    await a.getByRole('button', { name: 'Создать приглашение', exact: true }).click();
    const invitation = a.getByLabel('Ссылка приглашения', { exact: true });
    await invitation.waitFor();
    const inviteUrl = await invitation.inputValue();
    await c.goto(inviteUrl);
    await c.getByRole('button', { name: 'Принять приглашение', exact: true }).click();
    await c.getByRole('heading', { name: 'Рабочий кабинет', exact: true }).waitFor({ timeout: 20000 });
    await c.goto(threadUrl);
    await waitText(c, 'У вас доступ только для просмотра.');
    assert.equal(await c.getByRole('button', { name: 'Отправить', exact: true }).count(), 0);
    await c.goto(base + '/portal/listings');
    await c.getByRole('heading', { name: 'QA Кормовая мука', exact: true }).waitFor();
    assert.equal(await c.getByRole('button', { name: 'Редактировать', exact: true }).count(), 0);
    await c.goto(base + '/admin/factories');
    await c.getByText(/Нет доступа|нет доступа|Недостаточно прав|недостаточно прав|администратор/i).first().waitFor();
    await b.setViewportSize({ width: 390, height: 844 });
    await b.goto(base + '/portal');
    await b.getByRole('heading', { name: 'Рабочий кабинет', exact: true }).waitFor();
    await b.getByRole('button', { name: '中文', exact: true }).click();
    await b.getByRole('heading', { name: '工作概览', exact: true }).waitFor();
    assert.equal(await b.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'mobile overflow');
    await b.screenshot({ path: 'qa/portal-mobile-zh.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PORTAL_OK: public RU/ZH, 2 company accounts, listing, request, bidirectional chat, email-bound invitation, viewer restrictions, admin gate, mobile Chinese; no JS errors.');
  } catch (e) {
    await Promise.all([a, b, c].map((p, i) => p.screenshot({ path: `qa/portal-failure-${i}.png`, fullPage: true }).catch(() => {})));
    console.error(e.message);
    console.error('Pages:', a.url(), b.url(), c.url());
    console.error((await a.locator('main').innerText()).slice(-2000));
    process.exitCode = 1;
  } finally { await browser.close(); }
})();
