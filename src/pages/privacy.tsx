import { useRouter } from 'next/router';
import styled from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { UnifiedButton } from '../components/unified';
import { publicColors, addOpacity } from '../utils/themeHelpers';
import { OptimizedSectionTitle } from '../components/shared/optimized-styles';

// Styled Components
const PublicPageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${publicColors.primary} 0%,
    ${publicColors.secondary} 50%,
    ${publicColors.tertiary} 100%
  );
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

const PrivacyPage: React.FC = () => {
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
        <PageTitle>Política de Privacidade</PageTitle>
        <PageSubtitle>Como protegemos e utilizamos seus dados</PageSubtitle>

        <ContentContainer>
          <BackButton
            $variant='secondary'
            $theme={publicTheme}
            onClick={() => router.push('/')}
          >
            <AccessibleEmoji emoji='←' label='Voltar' /> Voltar
          </BackButton>

          <Section>
            <OptimizedSectionTitle>1. Introdução</OptimizedSectionTitle>
            <Paragraph>
              Esta Política de Privacidade descreve como o DOM (Domestic
              Organization Management) coleta, usa, armazena e protege suas
              informações pessoais. Respeitamos sua privacidade e estamos
              comprometidos em proteger seus dados pessoais.
            </Paragraph>
          </Section>

          <Section>
            <OptimizedSectionTitle>
              2. Informações que Coletamos
            </OptimizedSectionTitle>
            <Paragraph>
              Coletamos diferentes tipos de informações para fornecer e melhorar
              nossos serviços:
            </Paragraph>

            <OptimizedSectionTitle>
              2.1 Informações Pessoais
            </OptimizedSectionTitle>

            <List>
              <ListItem>Nome completo e dados de identificação</ListItem>
              <ListItem>CPF e documentos pessoais</ListItem>
              <ListItem>Endereço de e-mail e telefone</ListItem>
              <ListItem>Informações profissionais e empresariais</ListItem>
              <ListItem>Dados de funcionários e colaboradores</ListItem>
            </List>

            <OptimizedSectionTitle>
              2.2 Informações de Uso
            </OptimizedSectionTitle>
            <List>
              <ListItem>Logs de acesso e atividades</ListItem>
              <ListItem>Preferências e configurações</ListItem>
              <ListItem>Dados de navegação e interação</ListItem>
              <ListItem>Informações de dispositivo e navegador</ListItem>
            </List>
          </Section>

          <Section>
            <OptimizedSectionTitle>
              3. Como Utilizamos suas Informações
            </OptimizedSectionTitle>
            <Paragraph>Utilizamos suas informações para:</Paragraph>
            <List>
              <ListItem>Fornecer e manter nossos serviços</ListItem>
              <ListItem>Processar transações e pagamentos</ListItem>
              <ListItem>
                Enviar notificações e comunicações importantes
              </ListItem>
              <ListItem>
                Melhorar a funcionalidade e experiência do usuário
              </ListItem>
              <ListItem>Cumprir obrigações legais e regulamentares</ListItem>
              <ListItem>Prevenir fraudes e garantir a segurança</ListItem>
            </List>
          </Section>

          <Section>
            <OptimizedSectionTitle>
              4. Compartilhamento de Informações
            </OptimizedSectionTitle>
            <Paragraph>
              Não vendemos, alugamos ou compartilhamos suas informações pessoais
              com terceiros, exceto nas seguintes situações:
            </Paragraph>
            <List>
              <ListItem>Com seu consentimento explícito</ListItem>
              <ListItem>Para cumprir obrigações legais</ListItem>
              <ListItem>
                Com prestadores de serviços confiáveis (sob acordos de
                confidencialidade)
              </ListItem>
              <ListItem>
                Em caso de fusão, aquisição ou reestruturação da empresa
              </ListItem>
              <ListItem>
                Para proteger direitos, propriedade ou segurança
              </ListItem>
            </List>
          </Section>

          <Section>
            <OptimizedSectionTitle>
              5. Segurança dos Dados
            </OptimizedSectionTitle>
            <Paragraph>
              Implementamos medidas de segurança robustas para proteger suas
              informações:
            </Paragraph>
            <List>
              <ListItem>
                Criptografia de dados em trânsito e em repouso
              </ListItem>
              <ListItem>Controles de acesso rigorosos</ListItem>
              <ListItem>Monitoramento contínuo de segurança</ListItem>
              <ListItem>Backups regulares e seguros</ListItem>
              <ListItem>Treinamento de equipe em segurança de dados</ListItem>
            </List>
          </Section>

          <Section>
            <OptimizedSectionTitle>6. Seus Direitos</OptimizedSectionTitle>
            <Paragraph>
              Você tem os seguintes direitos sobre seus dados pessoais:
            </Paragraph>
            <List>
              <ListItem>
                <Highlight>Acesso:</Highlight> Solicitar informações sobre dados
                que possuímos
              </ListItem>
              <ListItem>
                <Highlight>Retificação:</Highlight> Corrigir dados incorretos ou
                incompletos
              </ListItem>
              <ListItem>
                <Highlight>Exclusão:</Highlight> Solicitar a remoção de seus
                dados
              </ListItem>
              <ListItem>
                <Highlight>Portabilidade:</Highlight> Receber seus dados em
                formato estruturado
              </ListItem>
              <ListItem>
                <Highlight>Oposição:</Highlight> Opor-se ao processamento de
                seus dados
              </ListItem>
              <ListItem>
                <Highlight>Limitação:</Highlight> Restringir o processamento de
                seus dados
              </ListItem>
            </List>
          </Section>

          <Section>
            <OptimizedSectionTitle>7. Retenção de Dados</OptimizedSectionTitle>
            <Paragraph>
              Mantemos suas informações pessoais apenas pelo tempo necessário
              para cumprir os propósitos descritos nesta política, a menos que
              um período de retenção mais longo seja exigido ou permitido por
              lei.
            </Paragraph>
          </Section>

          <Section>
            <OptimizedSectionTitle>
              8. Cookies e Tecnologias Similares
            </OptimizedSectionTitle>
            <Paragraph>
              Utilizamos cookies e tecnologias similares para melhorar sua
              experiência, analisar o uso do serviço e personalizar conteúdo.
              Você pode controlar o uso de cookies através das configurações do
              seu navegador.
            </Paragraph>
          </Section>

          <Section>
            <OptimizedSectionTitle>
              9. Transferência Internacional
            </OptimizedSectionTitle>
            <Paragraph>
              Seus dados podem ser transferidos e processados em países
              diferentes do seu país de residência. Garantimos que tais
              transferências sejam feitas com proteções adequadas e em
              conformidade com as leis aplicáveis.
            </Paragraph>
          </Section>

          <Section>
            <OptimizedSectionTitle>10. Menores de Idade</OptimizedSectionTitle>
            <Paragraph>
              Nossos serviços não são direcionados a menores de 18 anos. Não
              coletamos intencionalmente informações pessoais de menores. Se
              tomarmos conhecimento de tal coleta, removeremos essas informações
              imediatamente.
            </Paragraph>
          </Section>

          <Section>
            <OptimizedSectionTitle>
              11. Alterações nesta Política
            </OptimizedSectionTitle>
            <Paragraph>
              Podemos atualizar esta Política de Privacidade periodicamente.
              Notificaremos sobre mudanças significativas através do serviço ou
              por e-mail. Recomendamos revisar esta política regularmente.
            </Paragraph>
          </Section>

          <Section>
            <OptimizedSectionTitle>12. Contato</OptimizedSectionTitle>
            <Paragraph>
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre
              como tratamos seus dados pessoais, entre em contato conosco
              através dos canais disponíveis na plataforma.
            </Paragraph>
          </Section>

          <Paragraph>
            <em>
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </em>
          </Paragraph>
        </ContentContainer>
      </ContentWrapper>
    </PublicPageContainer>
  );
};

export default PrivacyPage;
