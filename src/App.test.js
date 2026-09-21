import { render, screen } from '@testing-library/react';
import Home from './catalog/Home';
test('home explains the platform in Russian and Chinese without duplicate entry links', () => {
  const {rerender} = render(<Home lang="ru" />);
  expect(screen.getByRole('heading', {level:1})).toHaveTextContent('Находите партнёров.');
  expect(screen.getByRole('link', {name:/Как устроена платформа/})).toHaveAttribute('href','#how-it-works');
  expect(screen.getAllByRole('link')).toHaveLength(1);
  rerender(<Home lang="zh" />);
  expect(screen.getByRole('heading', {level:1})).toHaveTextContent('找到合作伙伴。');
  expect(screen.getByRole('link', {name:/了解平台使用流程/})).toHaveAttribute('href','#how-it-works');
});
