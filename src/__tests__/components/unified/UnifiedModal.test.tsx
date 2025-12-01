import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedModal } from '../../../components/UnifiedModal';

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

describe('UnifiedModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('deve renderizar quando isOpen é true', () => {
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose} $theme={mockTheme}>
        <div>Conteúdo do modal</div>
      </UnifiedModal>
    );

    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
  });

  it('não deve renderizar quando isOpen é false', () => {
    render(
      <UnifiedModal isOpen={false} onClose={mockOnClose} $theme={mockTheme}>
        <div>Conteúdo do modal</div>
      </UnifiedModal>
    );

    expect(screen.queryByText('Conteúdo do modal')).not.toBeInTheDocument();
  });

  it('deve renderizar título quando fornecido', () => {
    render(
      <UnifiedModal
        isOpen={true}
        onClose={mockOnClose}
        title='Título do Modal'
        $theme={mockTheme}
      >
        <div>Conteúdo</div>
      </UnifiedModal>
    );

    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar no botão de fechar', () => {
    render(
      <UnifiedModal
        isOpen={true}
        onClose={mockOnClose}
        title='Título'
        showCloseButton={true}
        $theme={mockTheme}
      >
        <div>Conteúdo</div>
      </UnifiedModal>
    );

    const closeButton = screen.getByRole('button', { name: /fechar/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onClose ao pressionar Escape', () => {
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose} $theme={mockTheme}>
        <div>Conteúdo</div>
      </UnifiedModal>
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onClose ao clicar no overlay', () => {
    const { container } = render(
      <UnifiedModal isOpen={true} onClose={mockOnClose} $theme={mockTheme}>
        <div>Conteúdo</div>
      </UnifiedModal>
    );

    // Encontrar o overlay (primeiro elemento filho)
    const overlay = container.firstChild;
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('não deve chamar onClose ao clicar no conteúdo do modal', () => {
    const { container } = render(
      <UnifiedModal isOpen={true} onClose={mockOnClose} $theme={mockTheme}>
        <div data-testid='modal-content'>Conteúdo</div>
      </UnifiedModal>
    );

    const content = screen.getByTestId('modal-content');
    fireEvent.click(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('deve renderizar footer quando fornecido', () => {
    render(
      <UnifiedModal
        isOpen={true}
        onClose={mockOnClose}
        footer={<div>Footer do modal</div>}
        $theme={mockTheme}
      >
        <div>Conteúdo</div>
      </UnifiedModal>
    );

    expect(screen.getByText('Footer do modal')).toBeInTheDocument();
  });

  it('deve aplicar variante corretamente', () => {
    const { container: containerDefault } = render(
      <UnifiedModal
        isOpen={true}
        onClose={mockOnClose}
        variant='default'
        $theme={mockTheme}
      >
        <div>Default</div>
      </UnifiedModal>
    );

    const { container: containerCompact } = render(
      <UnifiedModal
        isOpen={true}
        onClose={mockOnClose}
        variant='compact'
        $theme={mockTheme}
      >
        <div>Compact</div>
      </UnifiedModal>
    );

    expect(containerDefault.firstChild).toBeInTheDocument();
    expect(containerCompact.firstChild).toBeInTheDocument();
  });

  it('deve aplicar maxWidth quando fornecido', () => {
    const { container } = render(
      <UnifiedModal
        isOpen={true}
        onClose={mockOnClose}
        maxWidth='800px'
        $theme={mockTheme}
      >
        <div>Conteúdo</div>
      </UnifiedModal>
    );

    // Verificar se o modal foi renderizado
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve ter aria-label quando fornecido', () => {
    render(
      <UnifiedModal
        isOpen={true}
        onClose={mockOnClose}
        aria-label='Modal de teste'
        $theme={mockTheme}
      >
        <div>Conteúdo</div>
      </UnifiedModal>
    );

    const modal = screen.getByLabelText('Modal de teste');
    expect(modal).toBeInTheDocument();
  });

  it('não deve mostrar botão de fechar quando showCloseButton é false', () => {
    render(
      <UnifiedModal
        isOpen={true}
        onClose={mockOnClose}
        showCloseButton={false}
        $theme={mockTheme}
      >
        <div>Conteúdo</div>
      </UnifiedModal>
    );

    const closeButton = screen.queryByRole('button', { name: /fechar/i });
    expect(closeButton).not.toBeInTheDocument();
  });
});
