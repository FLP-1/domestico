# 📚 Documentação: Styled Components Criados na Etapa 2

**Data:** 08/01/2025  
**Versão:** 1.0  
**Total de Componentes:** 40+

---

## 🎯 Objetivo

Esta documentação lista todos os styled components criados durante a refatoração da Etapa 2, quando convertemos estilos inline para styled components reutilizáveis.

---

## 📋 Componentes por Arquivo

### **1. `diagnostico-geolocalizacao.tsx`**

#### **Componentes Criados (10):**

1. **`FlexContainer`**
   - **Uso:** Container flex com gap
   - **Props:** Nenhuma

   ```tsx
   <FlexContainer>{/* conteúdo */}</FlexContainer>
   ```

2. **`StatusSpan`**
   - **Uso:** Span com cor de status dinâmica
   - **Props:** `$statusType`, `$theme`

   ```tsx
   <StatusSpan $statusType='success' $theme={theme}>
     Texto
   </StatusSpan>
   ```

3. **`LinkWithMargin`**
   - **Uso:** Link com margin-top
   - **Props:** `$theme`

   ```tsx
   <LinkWithMargin $theme={theme} href='...'>
     Link
   </LinkWithMargin>
   ```

4. **`BoxWithMargin`**
   - **Uso:** Box genérico com margin
   - **Props:** `$theme`

   ```tsx
   <BoxWithMargin $theme={theme}>Conteúdo</BoxWithMargin>
   ```

5. **`WarningBoxWithMargin`**
   - **Uso:** WarningBox estendido com margin
   - **Props:** `$theme`

   ```tsx
   <WarningBoxWithMargin $theme={theme}>Aviso</WarningBoxWithMargin>
   ```

6. **`ErrorBoxWithMargin`**
   - **Uso:** ErrorBox estendido com margin
   - **Props:** `$theme`

   ```tsx
   <ErrorBoxWithMargin $theme={theme}>Erro</ErrorBoxWithMargin>
   ```

7. **`List`**
   - **Uso:** Lista `<ul>` com margin e padding
   - **Props:** `$theme`

   ```tsx
   <List $theme={theme}>
     <li>Item</li>
   </List>
   ```

8. **`SubList`**
   - **Uso:** Sublista com font-size menor
   - **Props:** `$theme`

   ```tsx
   <SubList $theme={theme}>
     <li>Subitem</li>
   </SubList>
   ```

9. **`OrderedList`**
   - **Uso:** Lista `<ol>` com margin e padding
   - **Props:** `$theme`

   ```tsx
   <OrderedList $theme={theme}>
     <li>Item</li>
   </OrderedList>
   ```

10. **`Paragraph`**
    - **Uso:** Parágrafo com margin e font-size
    - **Props:** `$theme`
    ```tsx
    <Paragraph $theme={theme}>Texto do parágrafo</Paragraph>
    ```

---

### **2. `document-management.tsx`**

#### **Componentes Criados (8):**

1. **`DocumentNameBold`**
   - **Uso:** Nome do documento em negrito
   - **Props:** Nenhuma

   ```tsx
   <DocumentNameBold>Nome do Documento</DocumentNameBold>
   ```

2. **`DocumentNumberText`**
   - **Uso:** Texto do número do documento
   - **Props:** `$theme`

   ```tsx
   <DocumentNumberText $theme={theme}>Nº 12345</DocumentNumberText>
   ```

3. **`NoValidityText`**
   - **Uso:** Texto para "Sem validade"
   - **Props:** `$theme`

   ```tsx
   <NoValidityText $theme={theme}>Sem validade</NoValidityText>
   ```

4. **`BadgeWithMargin`**
   - **Uso:** Badge com margin-left
   - **Props:** Herda props do `UnifiedBadge`

   ```tsx
   <BadgeWithMargin variant='success' theme={theme}>
     Completo
   </BadgeWithMargin>
   ```

5. **`FlexContainer`**
   - **Uso:** Container flex com flex: 1
   - **Props:** Nenhuma

   ```tsx
   <FlexContainer>Conteúdo</FlexContainer>
   ```

6. **`ChecklistItemName`**
   - **Uso:** Nome do item do checklist
   - **Props:** Nenhuma

   ```tsx
   <ChecklistItemName>Nome do Item</ChecklistItemName>
   ```

7. **`ChecklistItemSubtext`**
   - **Uso:** Subtexto do item do checklist
   - **Props:** `$theme`
   ```tsx
   <ChecklistItemSubtext $theme={theme}>
     Requerido para eSocial
   </ChecklistItemSubtext>
   ```

---

### **3. `welcome-tutorial.tsx`**

#### **Componentes Criados (4):**

1. **`ProgressBarWithWidth`**
   - **Uso:** ProgressBar com largura fixa
   - **Props:** Herda props do `UnifiedProgressBar`

   ```tsx
   <ProgressBarWithWidth value={progress} variant='primary' theme={theme} />
   ```

2. **`StatCardContent`**
   - **Uso:** Conteúdo centralizado do card de estatística
   - **Props:** Nenhuma

   ```tsx
   <StatCardContent>{/* conteúdo */}</StatCardContent>
   ```

3. **`StatNumber`**
   - **Uso:** Número da estatística
   - **Props:** Nenhuma

   ```tsx
   <StatNumber>7</StatNumber>
   ```

4. **`StatLabel`**
   - **Uso:** Label da estatística
   - **Props:** Nenhuma
   ```tsx
   <StatLabel>Módulos Principais</StatLabel>
   ```

---

### **4. `loan-management.tsx`**

#### **Componentes Criados (4):**

1. **`FormGroupFlex`**
   - **Uso:** FormGroup com flex: 1
   - **Props:** Herda props do `FormGroup`

   ```tsx
   <FormGroupFlex>
     <Label>Campo</Label>
     <Input />
   </FormGroupFlex>
   ```

2. **`InputNumberStyled`**
   - **Uso:** Input com estilos para números (remove setas)
   - **Props:** Herda props do `Input`

   ```tsx
   <InputNumberStyled $theme={theme} type='text' value={value} />
   ```

3. **`FlexRowBetween`**
   - **Uso:** Linha flex com espaço entre elementos
   - **Props:** Nenhuma

   ```tsx
   <FlexRowBetween>
     <Elemento1 />
     <Elemento2 />
   </FlexRowBetween>
   ```

4. **`SectionWithMargin`**
   - **Uso:** Seção com margin-bottom
   - **Props:** Nenhuma
   ```tsx
   <SectionWithMargin>Conteúdo da seção</SectionWithMargin>
   ```

---

### **5. `geofencing/auditoria.tsx`**

#### **Componentes Criados (4):**

1. **`HiddenLabel`**
   - **Uso:** Label oculto para acessibilidade
   - **Props:** Herda props do `label`

   ```tsx
   <HiddenLabel htmlFor='input-id'>Label oculto</HiddenLabel>
   ```

2. **`TimestampContainer`**
   - **Uso:** Container para timestamp alinhado à direita
   - **Props:** Nenhuma

   ```tsx
   <TimestampContainer>
     <Timestamp $theme={theme}>Data</Timestamp>
   </TimestampContainer>
   ```

3. **`TimestampContainerBetween`**
   - **Uso:** Container para timestamp com espaço entre elementos
   - **Props:** Nenhuma

   ```tsx
   <TimestampContainerBetween>
     <Timestamp $theme={theme}>Data</Timestamp>
   </TimestampContainerBetween>
   ```

4. **`JsonSectionTitle`**
   - **Uso:** Título da seção JSON
   - **Props:** `$theme`
   ```tsx
   <JsonSectionTitle $theme={theme}>Dados Anteriores:</JsonSectionTitle>
   ```

---

### **6. Outros Arquivos**

#### **`time-clock.tsx`**

- **`ButtonContainerRight`** - Container de botão alinhado à direita

#### **`payroll-management.tsx`**

- **`FlexRowBetween`** - Linha flex com espaço entre elementos

#### **`index.tsx`**

- **`FooterTextWithMargin`** - Texto do footer com margin-top

#### **`geofencing/locais.tsx`**

- **`FooterActions`** - Ações do footer com gap e margin

#### **`subscription-plans.tsx`**

- **`SectionWithMargin`** - Seção com margin-bottom

#### **`shopping-management-backup.tsx`**

- **`FormGroupFlex`** - FormGroup com flex: 1
- **`FlexRowBetween`** - Linha flex com espaço entre elementos
- **`SectionWithMargin`** - Seção com margin-bottom
- **`InputFlex`** - Input com flex: 1

#### **`document-management-backup-old.tsx`**

- **`DocumentInfoContainer`** - Container de informações do documento
- **`DocumentInfoTitle`** - Título das informações do documento

---

## 🎨 Padrões de Uso

### **Convenções de Nomenclatura:**

1. **Componentes com Tema:**
   - Sempre recebem `$theme` como prop
   - Usam `getThemeColor()` ou helpers do tema

2. **Componentes Flex:**
   - `FlexContainer` - Container flex genérico
   - `FlexRowBetween` - Linha flex com espaço entre
   - `FormGroupFlex` - FormGroup com flex: 1

3. **Componentes com Margin:**
   - `*WithMargin` - Componente estendido com margin
   - `SectionWithMargin` - Seção com margin-bottom

4. **Componentes Específicos:**
   - Nome descritivo do propósito
   - Ex: `DocumentNameBold`, `StatNumber`, `TimestampContainer`

---

## 🔧 Boas Práticas

### **1. Sempre Use Props com `$` para Styled Components:**

```tsx
// ✅ Correto
const Component = styled.div<{ $theme?: Theme }>`
  color: ${props => props.$theme?.colors?.text};
`;

// ❌ Incorreto
const Component = styled.div<{ theme?: Theme }>`
  color: ${props => props.theme?.colors?.text};
`;
```

### **2. Use `shouldForwardProp` quando necessário:**

```tsx
const Component = styled.div.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  /* estilos */
`;
```

### **3. Reutilize Componentes Existentes:**

```tsx
// ✅ Estender componente existente
const BadgeWithMargin = styled(UnifiedBadge)`
  margin-left: 1rem;
`;

// ❌ Criar do zero quando já existe
const BadgeWithMargin = styled.div`
  /* duplicação desnecessária */
`;
```

---

## 📊 Estatísticas

- **Total de Componentes Criados:** 40+
- **Arquivos Refatorados:** 12
- **Estilos Inline Removidos:** 69/71 (97%)
- **Reutilização:** Alta (muitos componentes são extensões de outros)

---

## 🚀 Próximos Passos

1. **Consolidar Componentes Similares:**
   - Mover componentes comuns para `src/components/shared/styled/`
   - Criar biblioteca de componentes reutilizáveis

2. **Documentar Props:**
   - Adicionar JSDoc para cada componente
   - Criar exemplos de uso

3. **Testes:**
   - Criar testes para componentes críticos
   - Validar comportamento com diferentes temas

---

**Última atualização:** 08/01/2025  
**Mantido por:** Equipe de Desenvolvimento DOM
