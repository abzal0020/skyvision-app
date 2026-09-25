import {render, screen} from '@testing-library/react';
import Home from './catalog/Home';
jest.mock('react-router-dom', () => ({Link: ({to, children, ...props}) => <a href={to} {...props}>{children}</a>}));
test('corporate homepage has working information and catalog links in both languages', () => {
 const {rerender}=render(<Home lang="ru"/>);
 expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Производство.');
 expect(screen.getByRole('link',{name:/О компании/})).toHaveAttribute('href','#about');
 expect(screen.getByRole('link',{name:/Посмотреть цены/})).toHaveAttribute('href','/prices');
 rerender(<Home lang="zh"/>);
 expect(screen.getByRole('heading',{level:1})).toHaveTextContent('生产、贸易');
 expect(screen.getByRole('link',{name:/查看价格/})).toHaveAttribute('href','/prices');
});
