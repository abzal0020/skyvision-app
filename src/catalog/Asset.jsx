import React, { useEffect, useState } from 'react';
import { assetUrl } from './api';
import { localized } from './model';
export default function Asset({ asset, lang = 'ru' }) {
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => { let active = true; setFailed(false); assetUrl(asset).then(u => { if (active) setUrl(u); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, [asset.path, asset.url]); // eslint-disable-line react-hooks/exhaustive-deps
  const title = localized(asset.title, lang);
  if (failed) return <p role="status">{lang === 'zh' ? '文件暂不可用' : 'Файл временно недоступен'}</p>;
  if (!url) return <div className="sv-placeholder">…</div>;
  if (asset.type === 'image') return <a href={url} target="_blank" rel="noreferrer"><img loading="lazy" src={url} alt={title} onError={() => setFailed(true)} /></a>;
  if (asset.type === 'video') return <video controls preload="none" src={url} aria-label={title} onError={() => setFailed(true)} />;
  return <a className="sv-document" href={url} target="_blank" rel="noreferrer">↗ {title || (lang === 'zh' ? '文件' : 'Документ')} <small>PDF</small></a>;
}
