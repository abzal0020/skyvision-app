// попытка корректно получить конструктор Busboy в любой сборке
let Busboy;
try {
  // CommonJS require
  const b = require('busboy');
  if (typeof b === 'function') Busboy = b;
  else if (b && typeof b.default === 'function') Busboy = b.default;
  else if (b && typeof b.Busboy === 'function') Busboy = b.Busboy;
  else Busboy = null;
} catch (e) {
  console.error('require(busboy) failed', e);
  Busboy = null;
}

if (!Busboy) {
  // Если Busboy не доступен — бросаем понятную ошибку, чтобы увидеть её в логах
  throw new Error('Busboy not available; ensure "busboy" is in dependencies and Node runtime is used.');
}
