import { render, screen } from '@testing-library/react';
import Home from './catalog/Home';
jest.mock('react-router-dom', () => ({Link: ({to, children, ...props}) => <a href={to} {...props}>{children}</a>}));
test('home leads companies to the marketplace and supports Chinese', () => {
  const {rerender} = render(<Home lang="ru" openModal={() => {}} />);
  expect(screen.getByRole('link', {name: /Открыть маркетплейс/})).toHaveAttribute('href','/marketplace');
  rerender(<Home lang="zh" openModal={() => {}} />);
  expect(screen.getByRole('link', {name: /浏览市场/})).toHaveAttribute('href','/marketplace');
});
