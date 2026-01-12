import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './home';

// Mock del componente Hero
vi.mock('../components/organisms/hero', () => ({
  default: () => <div data-testid="hero-component">Hero Component</div>,
}));

describe('HomePage', () => {
  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  };

  it('should render the Hero component', () => {
    renderHomePage();

    expect(screen.getByTestId('hero-component')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    const { container } = renderHomePage();

    expect(container).toBeInTheDocument();
  });
});
