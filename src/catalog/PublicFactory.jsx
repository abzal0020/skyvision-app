import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFactory } from './api';
import FactoryView from './FactoryView';
import useAdmin from './useAdmin';
export default function PublicFactory({ lang }) {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true });
  const { admin } = useAdmin();
  useEffect(() => { let active = true; setState({ loading: true }); getFactory(slug === 'bestkostanai' ? 'best-kostanai' : slug).then(row => { if (active) setState({ row }); }).catch(error => { if (active) setState({ error: error.message }); }); return () => { active = false; }; }, [slug]);
  if (state.loading) return <div className="sv sv-card" role="status">{lang === 'zh' ? '加载中…' : 'Загрузка…'}</div>;
  if (!state.row) return <div className="sv sv-card"><h1>{lang === 'zh' ? '工厂暂不可用' : 'Завод недоступен'}</h1><p>{lang === 'zh' ? '请返回目录或稍后重试。' : 'Вернитесь в каталог или повторите попытку позже.'}</p><Link to="/prices">{lang === 'zh' ? '返回目录' : 'К каталогу'}</Link></div>;
  return <FactoryView content={state.row.content} lang={lang} adminId={admin ? state.row.id : null} />;
}
