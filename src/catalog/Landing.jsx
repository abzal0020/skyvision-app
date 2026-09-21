import React from 'react';
import {FaIndustry, FaShoppingBag, FaTruck, FaComments, FaRegFolderOpen, FaArrowRight} from 'react-icons/fa';
import './landing.css';

export default function Landing({lang = 'ru'}) {
  const zh = lang === 'zh';
  const roles = zh ? [
    [FaIndustry, '工厂与供应商', '展示产品与生产实力', '发布产品、产能与报价，上传工厂照片和质量文件，与采购商直接沟通。'],
    [FaShoppingBag, '采购商', '寻找合适的合作伙伴', '比较工厂产品与报价，咨询供货条件，向供应商发送采购申请。'],
    [FaTruck, '物流与货运代理', '为货物安排运输', '发布运输报价，与客户商议路线，并参与订单沟通。'],
  ] : [
    [FaIndustry, 'Заводам и поставщикам', 'Покажите свой товар', 'Размещайте продукцию, объёмы и цены. Добавляйте фото производства и документы, общайтесь с покупателями напрямую.'],
    [FaShoppingBag, 'Покупателям', 'Найдите своего поставщика', 'Сравнивайте продукцию и предложения заводов. Уточняйте условия, запрашивайте документы и отправляйте заявки.'],
    [FaTruck, 'Логистам и экспедиторам', 'Предложите перевозку', 'Публикуйте тарифы, обсуждайте маршруты с клиентами и подключайтесь к работе над поставкой.'],
  ];
  const steps = zh ? [
    ['登录平台', '创建个人账户，填写个人资料并添加或加入企业。'],
    ['寻找合作伙伴', '查看产品和运输报价，建立联系，讨论合作条件。'],
    ['共同推进订单', '在订单中邀请合作企业，交流信息并保存相关文件。'],
  ] : [
    ['Войдите в платформу', 'Создайте личный аккаунт, заполните профиль и добавьте свою компанию или присоединитесь к существующей.'],
    ['Найдите партнёров', 'Выберите товар или перевозку, добавьте контакты и обсудите условия в переписке.'],
    ['Работайте над поставкой', 'Пригласите компании в сделку. Обсуждайте детали и собирайте документы в одном месте.'],
  ];
  return <div className="sv landing">
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-intro">
        <span className="sv-eyebrow">{zh ? '哈萨克斯坦与中国 · 商务平台' : 'КАЗАХСТАН И КИТАЙ · ПЛАТФОРМА ДЛЯ БИЗНЕСА'}</span>
        <h1 id="landing-title">{zh ? <>找到合作伙伴。<br/><em>一起做生意。</em></> : <>Находите партнёров.<br/><em>Работайте вместе.</em></>}</h1>
        <p className="landing-lead">{zh ? 'SkyVision 连接工厂、采购商与物流企业。产品、运输、商务沟通与订单文件，都在同一个平台。' : 'SkyVision объединяет заводы, покупателей и логистов. Товары, перевозки, деловое общение и документы по поставкам — на одной платформе.'}</p>
        <a className="landing-explore" href="#how-it-works">{zh ? '了解平台使用流程' : 'Как устроена платформа'} <FaArrowRight aria-hidden="true"/></a>
        <p className="landing-entry-note">{zh ? '点击页面顶部的“登录平台”开始使用。新用户可在登录页面注册。' : 'Начните с кнопки «Войти в платформу» вверху страницы. Если аккаунта ещё нет, там же можно зарегистрироваться.'}</p>
      </div>
      <div className="landing-network" aria-label={zh ? '工厂、采购商和物流共同参与供货' : 'Завод, покупатель и логист работают над одной поставкой'}>
        <div className="landing-network-label">SKYVISION <span>{zh ? '商务连接' : 'ДЕЛОВЫЕ СВЯЗИ'}</span></div>
        <div className="landing-partner"><span className="landing-icon"><FaIndustry aria-hidden="true"/></span><div><strong>{zh ? '工厂' : 'Завод'}</strong><span>{zh ? '产品 · 价格 · 质量文件' : 'Продукция · Цены · Сертификаты'}</span></div></div>
        <div className="landing-connection" aria-hidden="true"><span/>↕<span/></div>
        <div className="landing-partner featured"><span className="landing-icon"><FaShoppingBag aria-hidden="true"/></span><div><strong>{zh ? '采购商' : 'Покупатель'}</strong><span>{zh ? '采购申请 · 条件 · 合同' : 'Заявка · Условия · Договор'}</span></div></div>
        <div className="landing-connection" aria-hidden="true"><span/>↕<span/></div>
        <div className="landing-partner"><span className="landing-icon"><FaTruck aria-hidden="true"/></span><div><strong>{zh ? '物流公司' : 'Логист'}</strong><span>{zh ? '路线 · 运价 · 运输' : 'Маршрут · Тариф · Перевозка'}</span></div></div>
        <div className="landing-network-footer"><FaComments aria-hidden="true"/> {zh ? '共同沟通' : 'Общая переписка'} <span>·</span> <FaRegFolderOpen aria-hidden="true"/> {zh ? '订单文件' : 'Документы сделки'}</div>
      </div>
    </section>
    <section className="landing-section" id="participants">
      <div className="landing-section-heading"><span className="sv-eyebrow">{zh ? '平台参与者' : 'ДЛЯ КОГО'}</span><h2>{zh ? '每个参与者都有自己的工作空间' : 'У каждого своя роль. Платформа одна.'}</h2></div>
      <div className="landing-roles">{roles.map(([Icon, title, heading, description]) => <article key={title}><span className="landing-role-title"><Icon aria-hidden="true"/>{title}</span><h3>{heading}</h3><p>{description}</p></article>)}</div>
    </section>
    <section className="landing-section landing-process" id="how-it-works">
      <div className="landing-section-heading"><span className="sv-eyebrow">{zh ? '如何开始' : 'КАК ЭТО РАБОТАЕТ'}</span><h2>{zh ? '从认识到合作' : 'От знакомства — к совместной работе'}</h2><p>{zh ? '个人账户用于建立联系，企业工作空间用于业务协作。' : 'Личный аккаунт — для общения. Кабинет компании — для работы от её имени.'}</p></div>
      <ol className="landing-steps">{steps.map(([title, text], i) => <li key={title}><span aria-hidden="true">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
    </section>
    <section className="landing-documents"><span className="landing-document-icon"><FaRegFolderOpen aria-hidden="true"/></span><div><span className="sv-eyebrow">{zh ? '订单工作空间' : 'РАБОЧЕЕ ПРОСТРАНСТВО СДЕЛКИ'}</span><h2>{zh ? '沟通与文件，保留完整上下文' : 'Переписка и документы — рядом с делом'}</h2><p>{zh ? '在订单中邀请合作企业，商议供货细节，上传合同、签字扫描件与运输文件，并查看文件版本和操作记录。' : 'Приглашайте партнёров в сделку, обсуждайте поставку, прикрепляйте договоры, подписанные сканы и перевозочные документы. Сохраняйте версии файлов и историю работы с ними.'}</p></div></section>
  </div>;
}
