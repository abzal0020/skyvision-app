import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import Account from './Account';
import {supabase} from '../lib/supabaseClient';
import {registrationDefaults} from './registration';
jest.mock('react-router-dom',()=>({Link:({to,children})=><a href={to}>{children}</a>}));
jest.mock('../lib/supabaseClient',()=>({supabase:{auth:{signUp:jest.fn(),signInWithPassword:jest.fn()}}}));
beforeEach(()=>{jest.clearAllMocks();supabase.auth.signUp.mockResolvedValue({data:{session:null},error:null});});
function fillForm(){
 fireEvent.click(screen.getByRole('button',{name:'Регистрация',exact:true}));
 fireEvent.click(screen.getByLabelText('Другое'));
 for(const [name,value] of [['company_name','Test company'],['country','CN'],['city','Shanghai'],['full_name','Test User'],['position','Manager'],['phone','+861234567890'],['email','test@example.com'],['password','ExamplePassword123'],['confirm_password','ExamplePassword123']]) {
  fireEvent.change(document.querySelector(`[name="${name}"]`),{target:{value}});
 }
}
test('registration saves business type and company/contact data for use after email confirmation',async()=>{
 render(<Account zh={false}/>);fillForm();
 fireEvent.click(screen.getByRole('button',{name:'Создать аккаунт'}));
 await waitFor(()=>expect(supabase.auth.signUp).toHaveBeenCalledTimes(1));
 const payload=supabase.auth.signUp.mock.calls[0][0];
 expect(payload.options.data.registration).toEqual({version:1,business_type:'other',company_name:'Test company',country:'CN',city:'Shanghai',full_name:'Test User',phone:'+861234567890',position:'Manager'});
 expect(payload.options.data.registration).not.toHaveProperty('password');
 expect(registrationDefaults({user_metadata:payload.options.data})).toEqual({name:'Test company',name_zh:'',country:'CN',city:'Shanghai',activities:['other'],full_name:'Test User',headline:'Manager'});
 expect(await screen.findByRole('status')).toHaveTextContent('восстановите его');
});
test('password mismatch does not submit registration and keeps fields',()=>{
 render(<Account zh={false}/>);fillForm();
 fireEvent.change(document.querySelector('[name="confirm_password"]'),{target:{value:'DifferentPassword'}});
 fireEvent.click(screen.getByRole('button',{name:'Создать аккаунт'}));
 expect(screen.getByRole('alert')).toHaveTextContent('Пароли не совпадают');
 expect(supabase.auth.signUp).not.toHaveBeenCalled();
 expect(document.querySelector('[name="company_name"]')).toHaveValue('Test company');
});
test('all business types are available in Chinese and do not assign access roles',()=>{
 render(<Account zh/>);
 fireEvent.click(screen.getByRole('button',{name:'注册',exact:true}));
 expect(screen.getAllByRole('radio')).toHaveLength(4);
 const defaults=registrationDefaults({user_metadata:{registration:{business_type:'admin',country:'invalid',role:'owner'}}});
 expect(defaults.activities).toEqual(['factory']);
 expect(defaults.country).toBe('KZ');
 expect(defaults).not.toHaveProperty('role');
});
