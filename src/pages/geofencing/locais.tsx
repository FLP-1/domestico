// Página de gestão de locais de trabalho
import React, { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useGeofencingTheme } from '../../hooks/useGeofencingTheme';
import { geofencingColors } from '../../design-system/tokens/geofencing-colors';
import { UnifiedCard, UnifiedBadge, UnifiedMetaInfo } from '../../components/unified';
import { Label } from '../../components/FormComponents';
import type { Theme } from '../../types/theme';

interface LocalTrabalho {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  raio: number;
  ativo: boolean;
  grupo: {
    id: string;
    nome: string;
  };
  empregador: {
    nomeCompleto: string;
  };
  criadoEm: string;
}

const Container = styled.div<{ $theme?: Theme }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div<{ $theme?: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.primary) || geofencingColors.text.primary;
  }};
  margin: 0;
`;

const Button = styled.button<{ $theme?: Theme }>`
  background: ${props =>
    props.$theme?.colors?.button?.primary?.background ||
    geofencingColors.button.primary.background};
  color: ${props =>
    props.$theme?.colors?.button?.primary?.text ||
    geofencingColors.button.primary.text};
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: ${props =>
      props.$theme?.colors?.button?.primary?.hover ||
      geofencingColors.button.primary.hover};
  }
`;

// Card removido - usar UnifiedCard
// CardHeader removido - usar title prop do UnifiedCard
// CardTitle removido - usar title prop do UnifiedCard

// StatusBadge removido - usar UnifiedBadge
// CardContent, InfoItem, Label, Value removidos - usar UnifiedMetaInfo

const Coordinates = styled.div<{ $theme?: Theme }>`
  background: ${props => {
    const background = props.$theme?.colors?.background;
    return (typeof background === 'object' && background && (background as any).secondary) || (typeof background === 'string' ? background : geofencingColors.background.secondary);
  }};
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 14px;
`;

const Actions = styled.div<{ $theme?: Theme }>`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button<{
  $variant?: 'primary' | 'secondary' | 'danger';
  $theme?: Theme;
}>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  ${props => {
    switch (props.$variant) {
      case 'danger':
        return `
          background: ${props.$theme?.colors?.button?.danger?.background || geofencingColors.button.danger.background};
          color: ${props.$theme?.colors?.button?.danger?.text || geofencingColors.button.danger.text};
          &:hover { background: ${props.$theme?.colors?.button?.danger?.hover || geofencingColors.button.danger.hover}; }
        `;
      case 'secondary':
        return `
          background: ${props.$theme?.colors?.button?.secondary?.background || geofencingColors.button.secondary.background};
          color: ${props.$theme?.colors?.button?.secondary?.text || geofencingColors.button.secondary.text};
          &:hover { background: ${props.$theme?.colors?.button?.secondary?.hover || geofencingColors.button.secondary.hover}; }
        `;
      default:
        return `
          background: ${props.$theme?.colors?.button?.primary?.background || geofencingColors.button.primary.background};
          color: ${props.$theme?.colors?.button?.primary?.text || geofencingColors.button.primary.text};
          &:hover { background: ${props.$theme?.colors?.button?.primary?.hover || geofencingColors.button.primary.hover}; }
        `;
    }
  }}
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => (props.$show ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div<{ $theme?: Theme }>`
  background: white;
  border-radius: 10px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div<{ $theme?: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2<{ $theme?: Theme }>`
  margin: 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.primary) || geofencingColors.text.primary;
  }};
`;

const CloseButton = styled.button<{ $theme?: Theme }>`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || geofencingColors.text.secondary;
  }};
`;

const Form = styled.form<{ $theme?: Theme }>`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div<{ $theme?: Theme }>`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Input = styled.input<{ $theme?: Theme }>`
  padding: 12px;
  border: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      if (typeof border === 'object' && border !== null && 'primary' in border) {
        return border.primary;
      }
      return geofencingColors.border.primary;
    }};
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${props => {
      const border = props.$theme?.colors?.border;
      if (typeof border === 'object' && border !== null && 'focus' in border) {
        return border.focus;
      }
      return geofencingColors.border.focus;
    }};
  }
`;

const Select = styled.select<{ $theme?: Theme }>`
  padding: 12px;
  border: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      if (typeof border === 'object' && border !== null && 'primary' in border) {
        return border.primary;
      }
      return geofencingColors.border.primary;
    }};
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${props => {
      const border = props.$theme?.colors?.border;
      if (typeof border === 'object' && border !== null && 'focus' in border) {
        return border.focus;
      }
      return geofencingColors.border.focus;
    }};
  }
`;

const Loading = styled.div<{ $theme?: Theme }>`
  text-align: center;
  padding: 40px;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || geofencingColors.text.secondary;
  }};
`;

const Error = styled.div<{ $theme?: Theme }>`
  background: ${props => {
    const error = props.$theme?.colors?.status?.error;
    return (error && typeof error === 'object' && error.background) || geofencingColors.status.error.background;
  }};
  color: ${props => {
    const error = props.$theme?.colors?.status?.error;
    return (error && typeof error === 'object' && error.text) || geofencingColors.status.error.text;
  }};
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const EmptyState = styled.div<{ $theme?: Theme }>`
  text-align: center;
  padding: 40px;
`;

const EmptyStateTitle = styled.h3<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.primary) || geofencingColors.text.primary;
  }};
  margin: 0 0 10px 0;
`;

const EmptyStateText = styled.p<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || geofencingColors.text.secondary;
  }};
  margin: 0;
`;

export default function LocaisTrabalho() {
  // TODO: Implementar autenticação adequada
  // const { data: session } = useSession();
  const router = useRouter();
  const themeObject = useGeofencingTheme();
  const theme = { colors: themeObject.colors };
  const themeLoading = themeObject.loading;
  const [locais, setLocais] = useState<LocalTrabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLocal, setEditingLocal] = useState<LocalTrabalho | null>(null);
  const [grupos, setGrupos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    raio: 200,
    grupoId: '',
  });

  useEffect(() => {
    // TODO: Implementar autenticação adequada
    // if (!session) {
    //   router.push('/login');
    //   return;
    // }

    loadLocais();
    loadGrupos();
  }, [router]);

  const loadLocais = async () => {
    try {
      const response = await fetch('/api/geofencing/locais');
      if (response.ok) {
        const data = await response.json();
        setLocais(data.locais);
      } else {
        setError('Erro ao carregar locais');
      }
    } catch (err) {
      setError('Erro ao carregar locais');
    } finally {
      setLoading(false);
    }
  };

  const loadGrupos = async () => {
    try {
      const response = await fetch('/api/user/groups');
      if (response.ok) {
        const data = await response.json();
        setGrupos(data.grupos || []);
      }
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingLocal
        ? '/api/geofencing/locais'
        : '/api/geofencing/locais';
      const method = editingLocal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...(editingLocal && { id: editingLocal.id }),
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingLocal(null);
        setFormData({ nome: '', endereco: '', raio: 200, grupoId: '' });
        loadLocais();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao salvar local');
      }
    } catch (err) {
      setError('Erro ao salvar local');
    }
  };

  const handleEdit = (local: LocalTrabalho) => {
    setEditingLocal(local);
    setFormData({
      nome: local.nome,
      endereco: local.endereco,
      raio: local.raio,
      grupoId: local.grupo.id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Tem certeza que deseja excluir este local?')) return;

    try {
      const response = await fetch('/api/geofencing/locais', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        loadLocais();
      } else {
        setError('Erro ao excluir local');
      }
    } catch (err) {
      setError('Erro ao excluir local');
    }
  };

  const openModal = () => {
    setEditingLocal(null);
    setFormData({ nome: '', endereco: '', raio: 200, grupoId: '' });
    setShowModal(true);
  };

  // Loading state para tema
  if (themeLoading || !theme) {
    return (
      <Container>
        <Loading $theme={theme || { colors: { text: { secondary: '#666' } } }}>
          Carregando tema...
        </Loading>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Loading $theme={theme}>Carregando locais de trabalho...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title $theme={theme}>
          <span role='img' aria-label='office'>
            🏢
          </span>{' '}
          Locais de Trabalho
        </Title>
        <Button $theme={theme} onClick={openModal}>
          <span role='img' aria-label='plus'>
            ➕
          </span>{' '}
          Novo Local
        </Button>
      </Header>

      {error && <Error $theme={theme}>{error}</Error>}

      {locais.length === 0 ? (
        <UnifiedCard theme={theme} variant='default' size='md'>
          <EmptyState $theme={theme}>
            <EmptyStateTitle $theme={theme}>
              Nenhum local de trabalho encontrado
            </EmptyStateTitle>
            <EmptyStateText $theme={theme}>
              Clique em &quot;Novo Local&quot; para adicionar o primeiro local
              de trabalho.
            </EmptyStateText>
          </EmptyState>
        </UnifiedCard>
      ) : (
        locais.map((local: any) => (
          <UnifiedCard
            key={local.id}
            theme={theme}
            variant='default'
            size='md'
            title={local.nome}
            footer={
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <UnifiedBadge 
                  variant={local.ativo ? 'success' : 'error'} 
                  size="sm" 
                  theme={theme}
                >
                  {local.ativo ? 'Ativo' : 'Inativo'}
                </UnifiedBadge>
                <ActionButton $theme={theme} onClick={() => handleEdit(local)}>
                  <span role='img' aria-label='edit'>
                    ✏️
                  </span>{' '}
                  Editar
                </ActionButton>
                <ActionButton
                  $variant='danger'
                  $theme={theme}
                  onClick={() => handleDelete(local.id)}
                >
                  <span role='img' aria-label='delete'>
                    🗑️
                  </span>{' '}
                  Excluir
                </ActionButton>
              </div>
            }
          >
            <UnifiedMetaInfo
              items={[
                { label: 'Endereço', value: local.endereco },
                { label: 'Grupo', value: local.grupo.nome },
                { label: 'Raio', value: `${local.raio}m` },
                { 
                  label: 'Coordenadas', 
                  value: (
                    <Coordinates $theme={theme}>
                      Lat: {local.latitude.toFixed(8)}
                      <br />
                      Lon: {local.longitude.toFixed(8)}
                    </Coordinates>
                  )
                },
              ]}
              variant="grid"
              size="sm"
              theme={theme}
            />
          </UnifiedCard>
        ))
      )}

      <Modal $show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle $theme={theme}>
              {editingLocal ? 'Editar Local' : 'Novo Local'}
            </ModalTitle>
            <CloseButton $theme={theme} onClick={() => setShowModal(false)}>
              ×
            </CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Nome do Local</Label>
              <Input
                $theme={theme}
                type='text'
                value={formData.nome}
                onChange={(e: any) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                required
                placeholder='Ex: Escritório Central'
              />
            </FormGroup>

            <FormGroup>
              <Label>Endereço</Label>
              <Input
                $theme={theme}
                type='text'
                value={formData.endereco}
                onChange={(e: any) =>
                  setFormData({ ...formData, endereco: e.target.value })
                }
                required
                placeholder='Ex: Rua das Flores, 123, São Paulo, SP'
              />
            </FormGroup>

            <FormGroup>
              <Label>Grupo</Label>
              <Select
                $theme={theme}
                value={formData.grupoId}
                onChange={(e: any) =>
                  setFormData({ ...formData, grupoId: e.target.value })
                }
                required
                aria-label='Selecionar grupo'
              >
                <option value=''>Selecione um grupo</option>
                {grupos.map((grupo: any) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Raio (metros)</Label>
              <Input
                $theme={theme}
                type='number'
                value={formData.raio}
                onChange={(e: any) =>
                  setFormData({ ...formData, raio: parseInt(e.target.value) })
                }
                min='50'
                max='1000'
                required
              />
            </FormGroup>

            <Actions>
              <ActionButton $theme={theme} type='submit'>
                {editingLocal ? 'Atualizar' : 'Criar'} Local
              </ActionButton>
              <ActionButton
                type='button'
                $variant='secondary'
                $theme={theme}
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </ActionButton>
            </Actions>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
}
