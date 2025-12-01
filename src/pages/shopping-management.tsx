/**
 * Página: Gestão Inteligente de Suprimentos
 * Sistema DOM - Reformulação Completa
 * 
 * Gestão inteligente de suprimentos vinculada a:
 * - Rotinas de trabalho
 * - Tarefas específicas
 * - Controle de estoque
 * - Templates por tipo de serviço
 */

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useAlertManager } from '../hooks/useAlertManager';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { UnifiedCard, UnifiedButton, UnifiedBadge, UnifiedModal } from '../components/unified';
import { FormGroup, Input, Label, Select } from '../components/FormComponents';
import EmptyState from '../components/EmptyState';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { LoadingContainer } from '../components/shared/page-components';
import { addOpacity, getThemeColor } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import type { TipoServico, CategoriaItem, UnidadeMedida } from '../services/suprimentosService';
import type { ListaSuprimentos, ItemSuprimento, TemplateLista, EstoqueDomestico, Tarefa } from '../types/suprimentos';
import { TIPOS_SERVICO, CATEGORIAS_ITEM, UNIDADES, getTipoServicoInfo } from '../constants/suprimentos';
import { formatCurrency } from '../utils/formatters';
import { tokens, getSpacing, getFontSize, getBorderRadius } from '../components/shared/tokens';
import { ContentGrid, FlexRow, FlexColumn } from '../components/shared/page-components';

// Styled Components
const ListasGrid = styled(ContentGrid)`
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  margin-top: ${getSpacing('xl')};
`;

const ListaCard = styled(UnifiedCard)<{ $theme?: Theme }>`
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => 
      addOpacity(getThemeColor(props.$theme, 'shadow', 'transparent'), 0.2)
    };
  }
`;

const ListaHeader = styled(FlexRow)`
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${getSpacing('md')};
`;

const ListaTitulo = styled.h3.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  margin: 0;
  font-size: ${getFontSize('lg')};
  font-weight: 600;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
`;

const ListaInfo = styled(FlexColumn)<{ $theme?: Theme }>`
  margin-top: ${getSpacing('md')};
  padding-top: ${getSpacing('md')};
  border-top: 1px solid ${props => 
    getThemeColor(props.$theme, 'border.light', 'transparent')
  };
`;

const InfoRow = styled(FlexRow)`
  justify-content: space-between;
  font-size: ${getFontSize('sm')};
`;

const InfoLabel = styled.span.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
`;

const InfoValue = styled.span.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  font-weight: 600;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
`;

const FiltrosContainer = styled.div`
  display: flex;
  gap: ${getSpacing('md')};
  margin-bottom: ${getSpacing('lg')};
  flex-wrap: wrap;
`;

const FiltroButton = styled(UnifiedButton)<{ $active?: boolean }>`
  ${props => props.$active && `
    opacity: 1;
    font-weight: 600;
  `}
`;

const EstoqueSection = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  margin-top: ${getSpacing('xl')};
  padding: ${getSpacing('lg')};
  background: ${props => getThemeColor(props.$theme, 'background.secondary', 'transparent')};
  border-radius: ${getBorderRadius('md')};
  border: 1px solid ${props => 
    getThemeColor(props.$theme, 'border.light', 'transparent')
  };
`;

const EstoqueGrid = styled(ContentGrid)`
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  margin-top: ${getSpacing('md')};
`;

const EstoqueItem = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme; $abaixoMinimo?: boolean }>`
  padding: ${getSpacing('md')};
  background: ${props => 
    props.$abaixoMinimo
      ? getThemeColor(props.$theme, 'status.warning.background', 'transparent')
      : getThemeColor(props.$theme, 'background.primary', 'transparent')
  };
  border: 1px solid ${props => 
    props.$abaixoMinimo
      ? getThemeColor(props.$theme, 'status.warning.border', 'transparent')
      : getThemeColor(props.$theme, 'border.light', 'transparent')
  };
  border-radius: ${getBorderRadius('md')};
`;

const EstoqueNome = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  font-weight: 600;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
  margin-bottom: ${getSpacing('sm')};
`;

const EstoqueQuantidade = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme; $abaixoMinimo?: boolean }>`
  font-size: ${getFontSize('sm')};
  color: ${props => 
    props.$abaixoMinimo
      ? getThemeColor(props.$theme, 'status.warning.text', 'transparent')
      : getThemeColor(props.$theme, 'text.secondary', 'inherit')
  };
`;

const EstoqueSectionTitle = styled.h3.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  margin: 0 0 ${getSpacing('md')} 0;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
`;

const ListaDescricao = styled.p.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  margin: ${getSpacing('sm')} 0;
  font-size: ${getFontSize('sm')};
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${getSpacing('md')};
  justify-content: flex-end;
  margin-top: ${getSpacing('lg')};
`;

const FormContainer = styled.form.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  margin-bottom: ${getSpacing('xl')};
  padding: ${getSpacing('md')};
  background: ${props => getThemeColor(props.$theme, 'background.secondary', 'transparent')};
  border-radius: ${getBorderRadius('md')};
`;

const FormTitle = styled.h4.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  margin: 0 0 ${getSpacing('md')} 0;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
`;

const FormGrid = styled(ContentGrid)`
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const FormActions = styled.div`
  margin-top: ${getSpacing('md')};
  display: flex;
  justify-content: flex-end;
`;

const SectionTitle = styled.h4.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  margin: 0 0 ${getSpacing('md')} 0;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
`;

const ItensList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${getSpacing('sm')};
`;

const ItemCard = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme; $comprado?: boolean }>`
  padding: ${getSpacing('md')};
  background: ${props => 
    props.$comprado
      ? getThemeColor(props.$theme, 'status.success.background', 'transparent')
      : getThemeColor(props.$theme, 'background.secondary', 'transparent')
  };
  border: 1px solid ${props => getThemeColor(props.$theme, 'border.light', 'transparent')};
  border-radius: ${getBorderRadius('md')};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemContent = styled.div`
  flex: 1;
`;

const ItemNome = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme; $comprado?: boolean }>`
  font-weight: 600;
  text-decoration: ${props => props.$comprado ? 'line-through' : 'none'};
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
`;

const ItemInfo = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  font-size: ${getFontSize('sm')};
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
`;

// Constantes importadas de src/constants/suprimentos.ts

// Componente memoizado para item de lista
interface ListaCardMemoProps {
  lista: ListaSuprimentos;
  stats: { total: number; comprados: number; valorEstimado: number };
  theme: Theme;
  onAbrirDetalhes: (lista: ListaSuprimentos) => void;
}

const ListaCardMemo = memo(function ListaCardMemo({ lista, stats, theme, onAbrirDetalhes }: ListaCardMemoProps) {
  const { total: totalItens, comprados: itensComprados, valorEstimado } = stats;

  return (
    <ListaCard
      key={lista.id}
      theme={theme}
      onClick={() => onAbrirDetalhes(lista)}
    >
      <ListaHeader>
        <div>
          <ListaTitulo $theme={theme}>{lista.nome}</ListaTitulo>
          <UnifiedBadge
            theme={theme}
            variant="secondary"
            size="sm"
          >
            {getTipoServicoInfo(lista.tipoServico).icon}{' '}
            {getTipoServicoInfo(lista.tipoServico).label}
          </UnifiedBadge>
        </div>
        {lista.concluida && (
          <UnifiedBadge theme={theme} variant="success" size="sm">
            Concluída
          </UnifiedBadge>
        )}
      </ListaHeader>

      {lista.descricao && (
        <ListaDescricao $theme={theme}>
          {lista.descricao}
        </ListaDescricao>
      )}

      <ListaInfo $theme={theme}>
        <InfoRow>
          <InfoLabel $theme={theme}>Itens:</InfoLabel>
          <InfoValue $theme={theme}>
            {itensComprados}/{totalItens}
          </InfoValue>
        </InfoRow>
        {valorEstimado > 0 && (
          <InfoRow>
            <InfoLabel $theme={theme}>Valor Estimado:</InfoLabel>
            <InfoValue $theme={theme}>
              {formatCurrency(valorEstimado)}
            </InfoValue>
          </InfoRow>
        )}
        {lista.orcamento && (
          <InfoRow>
            <InfoLabel $theme={theme}>Orçamento:</InfoLabel>
            <InfoValue $theme={theme}>
              {formatCurrency(lista.orcamento)}
            </InfoValue>
          </InfoRow>
        )}
      </ListaInfo>
    </ListaCard>
  );
});

// Componente memoizado para item de estoque
interface EstoqueItemMemoProps {
  item: EstoqueDomestico;
  theme: Theme;
}

const EstoqueItemMemo = memo(function EstoqueItemMemo({ item, theme }: EstoqueItemMemoProps) {
  const abaixoMinimo = Number(item.quantidadeAtual) <= Number(item.quantidadeMinima);

  return (
    <EstoqueItem key={item.id} $theme={theme} $abaixoMinimo={abaixoMinimo}>
      <EstoqueNome $theme={theme}>{item.itemNome}</EstoqueNome>
      <EstoqueQuantidade $theme={theme} $abaixoMinimo={abaixoMinimo}>
        {item.quantidadeAtual} {item.unidade} / Mínimo: {item.quantidadeMinima} {item.unidade}
      </EstoqueQuantidade>
    </EstoqueItem>
  );
});

// Desabilitar prerendering - página requer autenticação e dados dinâmicos
export const dynamic = 'force-dynamic';

import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function ShoppingManagement() {
  const router = useRouter();
  const alertManager = useAlertManager();
  const errorHandler = useErrorHandler();
  const { currentProfile } = useUserProfile();
  const profileThemeKey = currentProfile?.role?.toLowerCase();
  const themeObject = useTheme(profileThemeKey);
  const theme: Theme = { colors: themeObject.colors };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listas, setListas] = useState<ListaSuprimentos[]>([]);
  const [templates, setTemplates] = useState<TemplateLista[]>([]);
  const [estoque, setEstoque] = useState<EstoqueDomestico[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<TipoServico | 'TODOS'>('TODOS');
  const [showCriarListaModal, setShowCriarListaModal] = useState(false);
  const [showListaDetalhesModal, setShowListaDetalhesModal] = useState(false);
  const [selectedLista, setSelectedLista] = useState<ListaSuprimentos | null>(null);
  const [showEstoqueModal, setShowEstoqueModal] = useState(false);

  // Formulário de nova lista
  const [novaLista, setNovaLista] = useState({
    nome: '',
    tipoServico: 'GERAL' as TipoServico,
    templateId: '',
    vinculadaTarefa: '',
    orcamento: '',
    descricao: '',
  });

  // Formulário de novo item
  const [novoItem, setNovoItem] = useState({
    nome: '',
    categoria: 'OUTRO' as CategoriaItem,
    quantidade: '',
    unidade: 'UN' as UnidadeMedida,
    precoEstimado: '',
    fornecedor: '',
    estoqueMinimo: '',
    observacao: '',
  });

  // ✅ Carregar dados
  const loadData = useCallback(async () => {
    if (!currentProfile?.id) return;

    try {
      setLoading(true);

      // Carregar listas
      const listasRes = await fetch(
        `/api/suprimentos/listas?usuarioId=${currentProfile.id}&ativa=true`
      );
      const listasData = await listasRes.json();
      if (listasData.success) {
        setListas(listasData.listas || []);
      }

      // Carregar templates
      const templatesRes = await fetch('/api/suprimentos/templates?ativo=true');
      const templatesData = await templatesRes.json();
      if (templatesData.success) {
        setTemplates(templatesData.templates || []);
      }

      // Carregar estoque
      const estoqueRes = await fetch(
        `/api/suprimentos/estoque?usuarioId=${currentProfile.id}`
      );
      const estoqueData = await estoqueRes.json();
      if (estoqueData.success) {
        setEstoque(estoqueData.estoque || []);
      }

      // Carregar tarefas (para vincular listas)
      const tarefasRes = await fetch('/api/tasks');
      const tarefasData = await tarefasRes.json();
      if (tarefasData.success) {
        setTarefas(tarefasData.data || []);
      }
    } catch (error) {
      errorHandler.handleAsyncError(error, 'carregar dados de suprimentos');
    } finally {
      setLoading(false);
    }
  }, [currentProfile?.id, errorHandler]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ✅ Criar lista (memoizada)
  const handleCriarLista = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile?.id || !novaLista.nome.trim()) return;

    try {
      // Se tem template, criar a partir do template
      if (novaLista.templateId) {
        const response = await fetch('/api/suprimentos/listas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuarioId: currentProfile.id,
            nome: novaLista.nome || undefined,
            tipoServico: novaLista.tipoServico,
            templateId: novaLista.templateId,
            vinculadaTarefa: novaLista.vinculadaTarefa || undefined,
            orcamento: novaLista.orcamento ? parseFloat(novaLista.orcamento) : undefined,
            descricao: novaLista.descricao || undefined,
          }),
        });

        const result = await response.json();
        if (result.success) {
          alertManager.showSuccess('Lista criada com sucesso!');
          setShowCriarListaModal(false);
          setNovaLista({
            nome: '',
            tipoServico: 'GERAL',
            templateId: '',
            vinculadaTarefa: '',
            orcamento: '',
            descricao: '',
          });
          loadData();
        } else {
          alertManager.showError(result.error || 'Erro ao criar lista');
        }
      } else {
        // Criar lista vazia
        const response = await fetch('/api/suprimentos/listas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuarioId: currentProfile.id,
            nome: novaLista.nome,
            tipoServico: novaLista.tipoServico,
            vinculadaTarefa: novaLista.vinculadaTarefa || undefined,
            orcamento: novaLista.orcamento ? parseFloat(novaLista.orcamento) : undefined,
            descricao: novaLista.descricao || undefined,
          }),
        });

        const result = await response.json();
        if (result.success) {
          alertManager.showSuccess('Lista criada com sucesso!');
          setShowCriarListaModal(false);
          setNovaLista({
            nome: '',
            tipoServico: 'GERAL',
            templateId: '',
            vinculadaTarefa: '',
            orcamento: '',
            descricao: '',
          });
          loadData();
        } else {
          alertManager.showError(result.error || 'Erro ao criar lista');
        }
      }
    } catch (error) {
      errorHandler.handleAsyncError(error, 'criar lista de suprimentos');
    }
  }, [currentProfile?.id, novaLista, alertManager, loadData, errorHandler]);

  // ✅ Adicionar item à lista (memoizada)
  const handleAdicionarItem = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLista || !novoItem.nome.trim() || !novoItem.quantidade) return;

    try {
      const response = await fetch('/api/suprimentos/itens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listaId: selectedLista.id,
          nome: novoItem.nome,
          categoria: novoItem.categoria,
          quantidade: parseFloat(novoItem.quantidade),
          unidade: novoItem.unidade,
          precoEstimado: novoItem.precoEstimado ? parseFloat(novoItem.precoEstimado) : undefined,
          fornecedor: novoItem.fornecedor || undefined,
          estoqueMinimo: novoItem.estoqueMinimo ? parseFloat(novoItem.estoqueMinimo) : undefined,
          observacao: novoItem.observacao || undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alertManager.showSuccess('Item adicionado com sucesso!');
        setNovoItem({
          nome: '',
          categoria: 'OUTRO',
          quantidade: '',
          unidade: 'UN',
          precoEstimado: '',
          fornecedor: '',
          estoqueMinimo: '',
          observacao: '',
        });
        loadData();
      } else {
        alertManager.showError(result.error || 'Erro ao adicionar item');
      }
    } catch (error) {
      errorHandler.handleAsyncError(error, 'adicionar item');
    }
  }, [selectedLista, novoItem, alertManager, loadData, errorHandler]);

  // ✅ Marcar item como comprado (memoizada)
  const handleMarcarComprado = useCallback(async (itemId: string) => {
    if (!currentProfile?.id) return;

    try {
      const response = await fetch('/api/suprimentos/itens', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'marcar-comprado',
          itemId,
          compradoPor: currentProfile.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alertManager.showSuccess('Item marcado como comprado!');
        loadData();
      } else {
        alertManager.showError(result.error || 'Erro ao marcar item');
      }
    } catch (error) {
      errorHandler.handleAsyncError(error, 'marcar item como comprado');
    }
  }, [currentProfile?.id, alertManager, loadData, errorHandler]);

  // ✅ Abrir detalhes da lista (memoizada)
  const handleAbrirDetalhes = useCallback((lista: ListaSuprimentos) => {
    setSelectedLista(lista);
    setShowListaDetalhesModal(true);
  }, []);

  // Memoizar listas filtradas
  const listasFiltradas = useMemo(() => {
    return filtroTipo === 'TODOS' 
      ? listas 
      : listas.filter(l => l.tipoServico === filtroTipo);
  }, [listas, filtroTipo]);

  // Memoizar estoque abaixo do mínimo
  const estoqueAbaixoMinimo = useMemo(() => {
    return estoque.filter(e => e.quantidadeAtual <= e.quantidadeMinima);
  }, [estoque]);

  // Memoizar estatísticas de listas (evita recalcular a cada render)
  const listasComStats = useMemo(() => {
    return listasFiltradas.map(lista => {
      // Calcular estatísticas em uma única iteração
      const stats = lista.itens.reduce((acc, item) => {
        acc.total++;
        if (item.comprado) acc.comprados++;
        acc.valorEstimado += Number(item.precoEstimado || 0) * Number(item.quantidade);
        return acc;
      }, { total: 0, comprados: 0, valorEstimado: 0 });
      
      return {
        ...lista,
        stats
      };
    });
  }, [listasFiltradas]);

  return (
    <>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPath={router.pathname} />
      <TopBar>{null}</TopBar>
      <WelcomeSection 
        userAvatar={currentProfile?.avatar || 'U'} 
        userName={currentProfile?.name || 'Usuário'} 
        userRole={currentProfile?.role || 'Usuário'} 
      />
      
      <PageContainer $theme={theme} variant="dashboard">
        <PageHeader
          $theme={theme}
          title={
            <>
              <AccessibleEmoji emoji="🛒" label="Suprimentos" /> Gestão Inteligente de Suprimentos
            </>
          }
          subtitle="Listas vinculadas a rotinas de trabalho, controle de estoque e templates por tipo de serviço"
          variant="default"
          animation={true}
          actions={
            <UnifiedButton
              $theme={theme}
              $variant="primary"
              $size="medium"
              onClick={() => setShowCriarListaModal(true)}
            >
              <AccessibleEmoji emoji="➕" label="Nova lista" /> Nova Lista
            </UnifiedButton>
          }
        />

        {/* Filtros */}
        <FiltrosContainer>
          <FiltroButton
            theme={theme}
            $variant={filtroTipo === 'TODOS' ? 'primary' : 'secondary'}
            $size="sm"
            onClick={() => setFiltroTipo('TODOS')}
            $active={filtroTipo === 'TODOS'}
          >
            Todos
          </FiltroButton>
          {TIPOS_SERVICO.map(tipo => (
            <FiltroButton
              key={tipo.value}
        $theme={theme}
              $variant={filtroTipo === tipo.value ? 'primary' : 'secondary'}
              $size="sm"
              onClick={() => setFiltroTipo(tipo.value)}
              $active={filtroTipo === tipo.value}
            >
              <AccessibleEmoji emoji={tipo.icon} label={tipo.label} /> {tipo.label}
            </FiltroButton>
          ))}
        </FiltrosContainer>

        {/* Estoque Abaixo do Mínimo */}
        {estoqueAbaixoMinimo.length > 0 && (
          <EstoqueSection $theme={theme}>
            <EstoqueSectionTitle $theme={theme}>
              <AccessibleEmoji emoji="⚠️" label="Alerta" /> Estoque Abaixo do Mínimo
            </EstoqueSectionTitle>
            <EstoqueGrid>
              {estoqueAbaixoMinimo.map(item => (
                <EstoqueItemMemo key={item.id} item={item} theme={theme} />
              ))}
            </EstoqueGrid>
          </EstoqueSection>
        )}

        {/* Lista de Listas */}
        {loading ? (
          <LoadingContainer $theme={theme}>
            <AccessibleEmoji emoji="⏳" label="Carregando" /> Carregando listas...
          </LoadingContainer>
        ) : listasFiltradas.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Nenhuma lista de suprimentos encontrada"
            description="Crie uma nova lista ou use um template para começar."
            theme={theme}
          />
        ) : (
          <ListasGrid>
            {listasComStats.map(({ stats, ...lista }) => {
              const { total: totalItens, comprados: itensComprados, valorEstimado } = stats;

              return (
                <ListaCard
                  key={lista.id}
                  theme={theme}
                  onClick={() => handleAbrirDetalhes(lista)}
                >
                  <ListaHeader>
                    <div>
                      <ListaTitulo $theme={theme}>{lista.nome}</ListaTitulo>
                      <UnifiedBadge
                        theme={theme}
                        variant="secondary"
                        size="sm"
                      >
                        {getTipoServicoInfo(lista.tipoServico).icon}{' '}
                        {getTipoServicoInfo(lista.tipoServico).label}
                      </UnifiedBadge>
                    </div>
                    {lista.concluida && (
                      <UnifiedBadge theme={theme} variant="success" size="sm">
                        Concluída
                      </UnifiedBadge>
                    )}
                  </ListaHeader>

                  {lista.descricao && (
                    <ListaDescricao $theme={theme}>
                      {lista.descricao}
                    </ListaDescricao>
                  )}

                  <ListaInfo $theme={theme}>
                    <InfoRow>
                      <InfoLabel $theme={theme}>Itens:</InfoLabel>
                      <InfoValue $theme={theme}>
                        {itensComprados}/{totalItens}
                      </InfoValue>
                    </InfoRow>
                    {valorEstimado > 0 && (
                      <InfoRow>
                        <InfoLabel $theme={theme}>Valor Estimado:</InfoLabel>
                        <InfoValue $theme={theme}>
                          {formatCurrency(valorEstimado)}
                        </InfoValue>
                      </InfoRow>
                    )}
                    {lista.orcamento && (
                      <InfoRow>
                        <InfoLabel $theme={theme}>Orçamento:</InfoLabel>
                        <InfoValue $theme={theme}>
                          {formatCurrency(lista.orcamento)}
                        </InfoValue>
                      </InfoRow>
                    )}
                  </ListaInfo>
                </ListaCard>
              );
            })}
          </ListasGrid>
        )}
      </PageContainer>

      {/* Modal: Criar Lista */}
      {showCriarListaModal && (
        <UnifiedModal
          isOpen={showCriarListaModal}
          onClose={() => setShowCriarListaModal(false)}
          title="Nova Lista de Suprimentos"
          $theme={theme}
        >
          <form onSubmit={handleCriarLista}>
            <FormGroup>
              <Label>Nome da Lista *</Label>
              <Input
                value={novaLista.nome}
                onChange={(e) => setNovaLista({ ...novaLista, nome: e.target.value })}
                required
                placeholder="Ex: Limpeza Semanal"
              />
            </FormGroup>

            <FormGroup>
              <Label>Tipo de Serviço *</Label>
              <Select
                value={novaLista.tipoServico}
                onChange={(e) => setNovaLista({ ...novaLista, tipoServico: e.target.value as TipoServico })}
                required
              >
                {TIPOS_SERVICO.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.icon} {tipo.label}
                  </option>
                ))}
              </Select>
            </FormGroup>

          <FormGroup>
              <Label>Template (Opcional)</Label>
              <Select
                value={novaLista.templateId}
                onChange={(e) => setNovaLista({ ...novaLista, templateId: e.target.value })}
              >
                <option value="">Nenhum (Lista vazia)</option>
                {templates
                  .filter(t => t.tipoServico === novaLista.tipoServico)
                  .map(template => (
                    <option key={template.id} value={template.id}>
                      {template.nome}
                    </option>
                  ))}
              </Select>
          </FormGroup>

          <FormGroup>
              <Label>Vincular a Tarefa (Opcional)</Label>
            <Select
                value={novaLista.vinculadaTarefa}
                onChange={(e) => setNovaLista({ ...novaLista, vinculadaTarefa: e.target.value })}
              >
                <option value="">Nenhuma</option>
                {tarefas.map(tarefa => (
                  <option key={tarefa.id} value={tarefa.id}>
                    {tarefa.title}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
              <Label>Orçamento (Opcional)</Label>
              <Input
                type="number"
                step="0.01"
                value={novaLista.orcamento}
                onChange={(e) => setNovaLista({ ...novaLista, orcamento: e.target.value })}
                placeholder="0.00"
              />
          </FormGroup>

            <FormGroup>
              <Label>Descrição (Opcional)</Label>
              <Input
                value={novaLista.descricao}
                onChange={(e) => setNovaLista({ ...novaLista, descricao: e.target.value })}
                placeholder="Descrição da lista..."
              />
            </FormGroup>

            <ModalActions>
              <UnifiedButton
                $theme={theme}
                $variant="secondary"
                onClick={() => setShowCriarListaModal(false)}
                type="button"
              >
                Cancelar
              </UnifiedButton>
              <UnifiedButton
                $theme={theme}
                $variant="primary"
                type="submit"
              >
                Criar Lista
              </UnifiedButton>
            </ModalActions>
          </form>
        </UnifiedModal>
      )}

      {/* Modal: Detalhes da Lista */}
      {showListaDetalhesModal && selectedLista && (
      <UnifiedModal
          isOpen={showListaDetalhesModal}
          onClose={() => {
            setShowListaDetalhesModal(false);
            setSelectedLista(null);
          }}
          title={selectedLista.nome}
          $theme={theme}
        >
          <div>
            {/* Formulário de Novo Item */}
            <FormContainer $theme={theme} onSubmit={handleAdicionarItem}>
              <FormTitle $theme={theme}>
                Adicionar Item
              </FormTitle>
              <FormGrid>
                <FormGroup>
                  <Label>Nome *</Label>
                  <Input
                    value={novoItem.nome}
                    onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
                    required
                    placeholder="Nome do item"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Categoria *</Label>
                  <Select
                    value={novoItem.categoria}
                    onChange={(e) => setNovoItem({ ...novoItem, categoria: e.target.value as CategoriaItem })}
                    required
                  >
                    {CATEGORIAS_ITEM.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Quantidade *</Label>
              <Input
                    type="number"
                    step="0.01"
                    value={novoItem.quantidade}
                    onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
                    required
                    placeholder="0"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Unidade *</Label>
                  <Select
                    value={novoItem.unidade}
                    onChange={(e) => setNovoItem({ ...novoItem, unidade: e.target.value as UnidadeMedida })}
                    required
                  >
                    {UNIDADES.map(uni => (
                      <option key={uni.value} value={uni.value}>
                        {uni.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Preço Estimado</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={novoItem.precoEstimado}
                    onChange={(e) => setNovoItem({ ...novoItem, precoEstimado: e.target.value })}
                    placeholder="0.00"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Fornecedor</Label>
                  <Input
                    value={novoItem.fornecedor}
                    onChange={(e) => setNovoItem({ ...novoItem, fornecedor: e.target.value })}
                    placeholder="Nome do fornecedor"
                  />
                </FormGroup>
              </FormGrid>

              <FormActions>
                <UnifiedButton
                  $theme={theme}
                  $variant="primary"
                  type="submit"
                >
                  Adicionar Item
                </UnifiedButton>
              </FormActions>
            </FormContainer>

            {/* Lista de Itens */}
            <div>
              <SectionTitle $theme={theme}>
                Itens ({selectedLista.itens.length})
              </SectionTitle>
              {selectedLista.itens.length === 0 ? (
                <EmptyState
                  icon="📝"
                  title="Nenhum item na lista"
                  description="Adicione itens usando o formulário acima."
                  theme={theme}
                />
              ) : (
                <ItensList>
                  {selectedLista.itens.map(item => (
                    <ItemCard key={item.id} $theme={theme} $comprado={item.comprado}>
                      <ItemContent>
                        <ItemNome $theme={theme} $comprado={item.comprado}>
                          {item.nome}
                        </ItemNome>
                        <ItemInfo $theme={theme}>
                          {item.quantidade} {item.unidade}
                          {item.precoEstimado && ` • ${formatCurrency(Number(item.precoEstimado) * Number(item.quantidade))}`}
                          {item.fornecedor && ` • ${item.fornecedor}`}
                        </ItemInfo>
                      </ItemContent>
                      {!item.comprado && (
                        <UnifiedButton
                          $theme={theme}
                          $variant="success"
                          $size="sm"
                          onClick={() => handleMarcarComprado(item.id)}
                        >
                          <AccessibleEmoji emoji="✅" label="Marcar comprado" /> Marcar Comprado
                        </UnifiedButton>
                      )}
                    </ItemCard>
                  ))}
                </ItensList>
              )}
            </div>
          </div>
        </UnifiedModal>
        )}
    </>
  );
}
