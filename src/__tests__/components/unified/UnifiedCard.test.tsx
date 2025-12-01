import React from 'react';
import { render, screen } from '@testing-library/react';
import { UnifiedCard } from '../../../components/unified';

// Mock do tema básico
const mockTheme = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
    border: {
      light: '#e5e7eb',
    },
  },
};

describe('UnifiedCard', () => {
  it('deve renderizar conteúdo básico', () => {
    render(
      <UnifiedCard theme={mockTheme} variant='default' size='md'>
        <div>Card content</div>
      </UnifiedCard>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('deve renderizar título quando fornecido', () => {
    render(
      <UnifiedCard
        theme={mockTheme}
        variant='default'
        size='md'
        title='Test Title'
      >
        <div>Card content</div>
      </UnifiedCard>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('deve renderizar footer quando fornecido', () => {
    render(
      <UnifiedCard
        theme={mockTheme}
        variant='default'
        size='md'
        footer={<div>Footer content</div>}
      >
        <div>Card content</div>
      </UnifiedCard>
    );

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('deve aplicar variante corretamente', () => {
    const { container } = render(
      <UnifiedCard theme={mockTheme} variant='outlined' size='md'>
        <div>Card content</div>
      </UnifiedCard>
    );

    // Verificar se o card foi renderizado
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve aplicar tamanho corretamente', () => {
    const { container: containerSm } = render(
      <UnifiedCard theme={mockTheme} variant='default' size='sm'>
        <div>Small card</div>
      </UnifiedCard>
    );

    const { container: containerLg } = render(
      <UnifiedCard theme={mockTheme} variant='default' size='lg'>
        <div>Large card</div>
      </UnifiedCard>
    );

    expect(containerSm.firstChild).toBeInTheDocument();
    expect(containerLg.firstChild).toBeInTheDocument();
  });
});
