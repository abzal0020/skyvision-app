import { listingPrice, saveListing } from './api';
import { supabase } from '../lib/supabaseClient';
jest.mock('../lib/supabaseClient', () => ({ supabase: { from: jest.fn() } }));

test('missing prices are negotiable, but zero remains an explicit price', () => {
  expect(listingPrice({ price: null }, false)).toBe('По запросу');
  expect(listingPrice({ price: 0, currency: 'USD', unit: 'tonne' }, false)).toBe('0 USD / т');
});

test('an outdated editor does not silently report a successful save', async () => {
  const chain = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }) };
  supabase.from.mockReturnValue(chain);
  await expect(saveListing('company-a', { kind: 'product', price: '' }, { id: 'listing-a', version: 4 })).rejects.toThrow('CONFLICT');
  expect(chain.eq).toHaveBeenCalledWith('company_id', 'company-a');
  expect(chain.eq).toHaveBeenCalledWith('version', 4);
});

test('switching a logistics listing to a product restores FCA and preserves zero', async () => {
  const chain = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { id: 'new' }, error: null }) };
  supabase.from.mockReturnValue(chain);
  await saveListing('company-a', { kind: 'product', basis: 'route', price: '0' });
  expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ company_id: 'company-a', basis: 'FCA', price: 0 }));
});
