import React, {useState} from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {AuthProvider, useAuth} from './AuthContext';
import {supabase} from '../lib/supabaseClient';

jest.mock('../lib/supabaseClient', () => ({supabase: {
  auth: {getUser: jest.fn(), onAuthStateChange: jest.fn()}, from: jest.fn(),
}}));

let emit;
let profileQuery;
const deferred = () => {
  let resolve;
  const promise = new Promise(r => {resolve = r;});
  return {promise, resolve};
};
function Draft() {
  const [text, setText] = useState('');
  return <><input aria-label="name" value={text} onChange={e => setText(e.target.value)}/>
    <input aria-label="photo" type="file"/></>;
}
function Gate() {
  const {user, profile, loading} = useAuth();
  if (loading) return <p>Loading</p>;
  if (!user) return <p>Signed out</p>;
  return <><p>{user.id}:{profile?.display_name}</p><Draft/></>;
}
async function flush() {
  await act(async () => {await Promise.resolve(); jest.runOnlyPendingTimers();});
}
function event(name, id) {
  act(() => emit(name, id ? {user:{id}} : null));
}
beforeEach(() => {
  jest.useFakeTimers('legacy');
  jest.clearAllMocks();
  supabase.auth.getUser.mockResolvedValue({data:{user:{id:'alice'}}});
  supabase.auth.onAuthStateChange.mockImplementation(callback => {
    emit = callback;
    return {data:{subscription:{unsubscribe:jest.fn()}}};
  });
  profileQuery = jest.fn().mockResolvedValue({data:{display_name:'Alice'},error:null});
  supabase.from.mockReturnValue({select:() => ({eq:() => ({maybeSingle:profileQuery})})});
});
afterEach(() => {jest.useRealTimers();});

test('refocus and token refresh preserve unsaved text and selected file', async () => {
  render(<AuthProvider><Gate/></AuthProvider>);
  await flush();
  const input = screen.getByLabelText('name');
  const photo = screen.getByLabelText('photo');
  const file = new File(['photo'], 'factory.png', {type:'image/png'});
  fireEvent.change(input, {target:{value:'Unsaved profile'}});
  fireEvent.change(photo, {target:{files:[file]}});
  for (const name of ['SIGNED_IN','TOKEN_REFRESHED','USER_UPDATED','SIGNED_IN']) {
    event(name, 'alice');
    await flush();
    expect(screen.getByLabelText('name')).toBe(input);
    expect(input).toHaveValue('Unsaved profile');
    expect(screen.getByLabelText('photo')).toBe(photo);
    expect(photo.files[0]).toBe(file);
  }
  expect(profileQuery).toHaveBeenCalledTimes(1);
});

test('switching accounts clears the previous account draft', async () => {
  render(<AuthProvider><Gate/></AuthProvider>);
  await flush();
  fireEvent.change(screen.getByLabelText('name'), {target:{value:'Alice private draft'}});
  event('SIGNED_IN','bob');
  expect(screen.queryByLabelText('name')).not.toBeInTheDocument();
  await flush();
  expect(screen.getByLabelText('name')).toHaveValue('');
  event('SIGNED_OUT');
  expect(screen.getByText('Signed out')).toBeInTheDocument();
});

test('a late initial user response cannot undo logout', async () => {
  const initial = deferred();
  supabase.auth.getUser.mockReturnValue(initial.promise);
  render(<AuthProvider><Gate/></AuthProvider>);
  event('SIGNED_OUT');
  await act(async () => initial.resolve({data:{user:{id:'alice'}}}));
  await flush();
  expect(screen.getByText('Signed out')).toBeInTheDocument();
  expect(profileQuery).not.toHaveBeenCalled();
});

test('late profile responses cannot overwrite a different account', async () => {
  const oldProfile = deferred();
  profileQuery.mockReturnValueOnce(oldProfile.promise)
    .mockResolvedValueOnce({data:{display_name:'Bob'},error:null});
  render(<AuthProvider><Gate/></AuthProvider>);
  await flush();
  event('SIGNED_IN','bob');
  await flush();
  expect(screen.getByText('bob:Bob')).toBeInTheDocument();
  await act(async () => oldProfile.resolve({data:{display_name:'Alice'},error:null}));
  expect(screen.getByText('bob:Bob')).toBeInTheDocument();
});

