import { render, screen } from '@testing-library/react';
import Home from './catalog/Home';
jest.mock('react-router-dom', () => ({Link: ({to, children, ...props}) => <a href={to} {...props}>{children}</a>}));
test('home leads customers to prices and supports Chinese', () => {
  const {rerender} = render(<Home lang="ru" openModal={() => {}} />);
  expect(screen.getByRole('link', {name: /Смотреть заводы и цены/})).toHaveAttribute('href','/prices');
  rerender(<Home lang="zh" openModal={() => {}} />);
  expect(screen.getByRole('link', {name: /查看工厂与价格/})).toHaveAttribute('href','/prices');
});
