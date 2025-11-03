import { useRouter } from 'next/router';
import styled from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { UnifiedButton } from '../components/unified';
import { publicColors, addOpacity } from '../utils/themeHelpers';
import { OptimizedSectionTitle } from '../components/shared/optimized-styles';

// Styled Components
const PublicPageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${publicColors.primary} 0%, ${publicColors.secondary} 50%, ${publicColors.tertiary} 100%);
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: ${publicColors.surface};
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 10px 40px ${publicColors.shadow};
`;

const PageTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${publicColors.text.primary};
  margin: 0 0 0.5rem 0;
  text-align: center;
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${publicColors.text.secondary};
  margin: 0 0 2rem 0;
  text-align: center;
`;

const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  color: ${publicColors.text.primary};
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const Paragraph = styled.p`
  margin-bottom: 1rem;
  text-align: justify;
  color: ${publicColors.text.primary};
`;

const List = styled.ul`
  margin: 1rem 0;
  padding-left: 2rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
  color: ${publicColors.text.primary};
`;

const Highlight = styled.strong`
  color: ${publicColors.primary};
  font-weight: 600;
`;

const BackButton = styled(UnifiedButton)`
  margin-bottom: 2rem;
  background: transparent;
  border: 1px solid ${publicColors.border};
  color: ${publicColors.text.primary};

  &:hover {
    background: ${addOpacity(publicColors.primary, 0.05)};
    border-color: ${publicColors.primary};
    color: ${publicColors.primary};
  }
`;

const TermsPage: React.FC = () => {
  const router = useRouter();

  const publicTheme = {
    colors: {
      primary: publicColors.primary,
      secondary: publicColors.secondary,
      text: publicColors.text,
      background: publicColors.background,
      surface: publicColors.surface,
      border: publicColors.border,
    },
  };

  return (
    <PublicPageContainer>
      <ContentWrapper>
        <PageTitle>Termos de Uso</PageTitle>
        <PageSubtitle>Conheça nossos termos e condições</PageSubtitle>

        <ContentContainer>
          <BackButton
            $variant='secondary'
            $theme={publicTheme}
            onClick={() => router.push('/')}
          >
            <AccessibleEmoji emoji='←' label='Voltar' /> Voltar
          </BackButton>

        <Section>
          <OptimizedSectionTitle>1. Aceitação dos Termos</OptimizedSectionTitle>
          <Paragraph>
            Ao utilizar o sistema DOM (Domestic Organization Management), você
            concorda em cumprir e estar vinculado a estes Termos de Uso. Se você
            não concordar com qualquer parte destes termos, não deve utilizar
            nosso serviço.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>2. Descrição do Serviço</OptimizedSectionTitle>
          <Paragraph>
            O DOM é uma plataforma de gestão doméstica e empresarial que
            oferece:
          </Paragraph>
          <List>
            <ListItem>Gestão de tarefas e atividades domésticas</ListItem>
            <ListItem>Controle de documentos e prazos</ListItem>
            <ListItem>Gestão de funcionários e folha de pagamento</ListItem>
            <ListItem>Integração com sistemas eSocial</ListItem>
            <ListItem>Comunicação interna e notificações</ListItem>
            <ListItem>Relatórios e dashboards personalizados</ListItem>
          </List>
        </Section>

        <Section>
          <OptimizedSectionTitle>3. Conta de Usuário</OptimizedSectionTitle>
          <Paragraph>
            Para utilizar nossos serviços, você deve criar uma conta fornecendo
            informações precisas e atualizadas. Você é responsável por:
          </Paragraph>
          <List>
            <ListItem>Manter a confidencialidade de sua senha</ListItem>
            <ListItem>Todas as atividades que ocorrem em sua conta</ListItem>
            <ListItem>
              Notificar-nos imediatamente sobre qualquer uso não autorizado
            </ListItem>
            <ListItem>Fornecer informações precisas e atualizadas</ListItem>
          </List>
        </Section>

        <Section>
          <OptimizedSectionTitle>4. Uso Aceitável</OptimizedSectionTitle>
          <Paragraph>Você concorda em não utilizar o serviço para:</Paragraph>
          <List>
            <ListItem>Atividades ilegais ou não autorizadas</ListItem>
            <ListItem>Transmitir vírus ou código malicioso</ListItem>
            <ListItem>Tentar obter acesso não autorizado aos sistemas</ListItem>
            <ListItem>Interferir no funcionamento normal do serviço</ListItem>
            <ListItem>Violar direitos de propriedade intelectual</ListItem>
          </List>
        </Section>

        <Section>
          <OptimizedSectionTitle>
            5. Privacidade e Proteção de Dados
          </OptimizedSectionTitle>
          <Paragraph>
            Respeitamos sua privacidade e protegemos seus dados pessoais de
            acordo com nossa <Highlight>Política de Privacidade</Highlight>.
            Todos os dados são tratados com segurança e confidencialidade,
            seguindo as melhores práticas de proteção de dados.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>
            6. Propriedade Intelectual
          </OptimizedSectionTitle>
          <Paragraph>
            O DOM e todo seu conteúdo, incluindo textos, gráficos, logotipos,
            ícones e software, são propriedade da empresa e estão protegidos por
            leis de direitos autorais e outras leis de propriedade intelectual.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>
            7. Limitação de Responsabilidade
          </OptimizedSectionTitle>
          <Paragraph>
            O serviço é fornecido &quot;como está&quot; sem garantias de
            qualquer tipo. Não nos responsabilizamos por danos diretos,
            indiretos, incidentais ou consequenciais resultantes do uso do
            serviço.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>
            8. Modificações dos Termos
          </OptimizedSectionTitle>
          <Paragraph>
            Reservamo-nos o direito de modificar estes termos a qualquer
            momento. As alterações entrarão em vigor imediatamente após a
            publicação. O uso continuado do serviço constitui aceitação dos
            novos termos.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>9. Rescisão</OptimizedSectionTitle>
          <Paragraph>
            Podemos suspender ou encerrar sua conta a qualquer momento, com ou
            sem aviso prévio, por violação destes termos ou por qualquer outro
            motivo a nosso critério.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>10. Contato</OptimizedSectionTitle>
          <Paragraph>
            Se você tiver dúvidas sobre estes Termos de Uso, entre em contato
            conosco através dos canais disponíveis na plataforma.
          </Paragraph>
        </Section>

          <Paragraph>
            <em>Última atualização: {new Date().toLocaleDateString('pt-BR')}</em>
          </Paragraph>
        </ContentContainer>
      </ContentWrapper>
    </PublicPageContainer>
  );
};

export default TermsPage;
