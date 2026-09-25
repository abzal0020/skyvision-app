import React from 'react';
import {Link} from 'react-router-dom';
import './landing.css';

export default function Landing({lang='ru'}) {
  const zh=lang==='zh';
  return <div className="corporate-home">
    <section className="corporate-banner" aria-labelledby="corporate-title" style={{backgroundImage:"linear-gradient(90deg,rgba(6,26,49,.94) 0%,rgba(8,37,62,.8) 46%,rgba(9,30,48,.22) 100%),url(/photos/harvest/harvest/photo1.jpeg)"}}>
      <div className="corporate-banner-inner">
        <span>SKYVISION · {zh?'哈萨克斯坦与中国':'КАЗАХСТАН И КИТАЙ'}</span>
        <h1 id="corporate-title">{zh?<>生产、贸易<br/>与物流</>:<>Производство.<br/>Торговля. Логистика.</>}</h1>
        <p>{zh?'连接企业，推动合作。':'Объединяем компании для совместной работы.'}</p>
        <a href="#about" className="corporate-button">{zh?'关于我们':'О компании'} <span aria-hidden="true">→</span></a>
      </div>
    </section>
    <section className="corporate-section corporate-about" id="about">
      <div><span className="corporate-kicker">{zh?'关于我们':'О КОМПАНИИ'}</span><h2>{zh?'SkyVision — 企业合作平台':'SkyVision — пространство делового сотрудничества'}</h2></div>
      <div><p>{zh?'SkyVision 是连接哈萨克斯坦与中国企业的商务平台。在这里，生产企业、采购商和货运代理可以寻找合作伙伴，讨论产品供应与运输。':'SkyVision — деловая платформа для компаний Казахстана и Китая. Здесь производители, покупатели и экспедиторы находят партнёров и обсуждают поставки продукции и перевозки.'}</p><p>{zh?'报价、申请、沟通和订单文件在独立门户中处理。您可以通过页面顶部的入口登录或注册。':'Для работы с предложениями, заявками, перепиской и документами предусмотрен отдельный портал. Вход и регистрация доступны через кнопку вверху страницы.'}</p></div>
    </section>
    <section className="corporate-services" id="services"><div className="corporate-section">
      <span className="corporate-kicker">{zh?'业务方向':'НАПРАВЛЕНИЯ РАБОТЫ'}</span><h2>{zh?'产品供应与运输':'Поставки продукции и перевозки'}</h2>
      <div className="corporate-service-grid">{(zh?[
        ['01','产品','工厂目录、饲料原料及其他产品的特点和报价。'],
        ['02','物流','运输报价、供货路线及与货运代理的协作。'],
        ['03','企业门户','企业资料、申请、商务沟通与订单文件。'],
      ]:[
        ['01','Продукция','Каталог заводов, характеристики и предложения по кормовой муке и другой продукции.'],
        ['02','Логистика','Предложения по перевозкам, маршруты поставок и взаимодействие с экспедиторами.'],
        ['03','Деловой портал','Страницы компаний, заявки, общение с партнёрами и документы по поставкам.'],
      ]).map(([n,title,text])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </div></section>
    <section className="corporate-section corporate-bottom"><div><span className="corporate-kicker">{zh?'产品目录':'КАТАЛОГ ПРОДУКЦИИ'}</span><h2>{zh?'工厂与价格':'Заводы и цены'}</h2><p>{zh?'查看工厂信息、产品与报价。':'Ознакомьтесь с заводами, продукцией и опубликованными ценами.'}</p><Link to="/prices" className="corporate-text-link">{zh?'查看价格':'Посмотреть цены'} →</Link></div><div><span className="corporate-kicker">{zh?'联系我们':'КОНТАКТЫ'}</span><h2>{zh?'保持联系':'На связи с вами'}</h2><p>{zh?'有关平台与合作的问题，请联系我们。':'Свяжитесь с нами по вопросам платформы и сотрудничества.'}</p><a href="tel:+77715252683" className="corporate-text-link">+7 771 525 2683</a></div></section>
  </div>;
}
