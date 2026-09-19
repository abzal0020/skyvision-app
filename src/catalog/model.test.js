import { dap, numberOrNull, stampPrices, validateFactory, emptyFactory, pair, safeUrl } from './model';
test('DAP needs a price and named route; zero freight is valid', () => {
  expect(dap({fca:''},{destination:pair('Хоргос'),rate:38})).toBeNull();
  expect(dap({fca:190},{destination:pair(),rate:38})).toBeNull();
  expect(dap({fca:190},{destination:pair('Хоргос'),rate:''})).toBeNull();
  expect(dap({fca:'190.25'},{destination:pair('Хоргос'),rate:'38.50'})).toBe(228.75);
  expect(dap({fca:'190'},{destination:pair('Хоргос'),rate:0})).toBe(190);
  expect(numberOrNull(-1)).toBeNull();
});
test('text changes do not refresh historical price dates', () => {
  const old={products:[{id:'a',fca:190,updatedAt:'2025-01-01',needsReview:true}]};
  expect(stampPrices({...old,description:pair('новый текст')},old).products[0]).toEqual(old.products[0]);
  const changed=stampPrices({products:[{...old.products[0],fca:200}]},old).products[0];
  expect(changed.needsReview).toBe(false);
  expect(changed.updatedAt).not.toBe(old.products[0].updatedAt);
});
test('invalid publication and negative prices are rejected', () => {
  const doc={...emptyFactory(),name:pair('Завод')};
  expect(validateFactory(doc)).toBe('');
  expect(validateFactory(doc,true)).not.toBe('');
  expect(validateFactory({...doc,products:[{name:pair('Мука'),fca:-10}]})).not.toBe('');
});
test('asset links reject executable and protocol-relative URLs', () => {
  expect(safeUrl('javascript:alert(1)')).toBe('');
  expect(safeUrl('//untrusted.example')).toBe('');
  expect(safeUrl('/docs/report.pdf')).toBe('/docs/report.pdf');
});
