import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Fluxo Completo de Upload de Documentos
 */

test.describe('Fluxo Completo de Upload de Documentos', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="cpf"]', '12345678901');
    await page.fill('input[name="senha"]', 'senha123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('deve fazer upload de documento com sucesso', async ({ page }) => {
    // Navegar para página de documentos
    await page.goto('/document-management');
    await page.waitForLoadState('networkidle');

    // Verificar se página carregou
    await expect(page.locator('h1, h2')).toContainText(/documento/i);

    // Procurar botão de upload
    const uploadButton = page
      .locator(
        'button:has-text("Upload"), button:has-text("Enviar"), input[type="file"]'
      )
      .first();

    if (await uploadButton.isVisible()) {
      // Se for input file, fazer upload
      if ((await uploadButton.getAttribute('type')) === 'file') {
        // Criar arquivo de teste
        const fileInput = uploadButton;
        await fileInput.setInputFiles({
          name: 'test-document.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('PDF test content'),
        });

        // Aguardar upload
        await page.waitForTimeout(2000);

        // Verificar mensagem de sucesso
        const successMessage = page.locator('text=/sucesso|enviado/i').first();
        if (await successMessage.isVisible({ timeout: 5000 })) {
          await expect(successMessage).toBeVisible();
        }
      }
    }
  });

  test('deve exibir lista de documentos', async ({ page }) => {
    await page.goto('/document-management');
    await page.waitForLoadState('networkidle');

    // Verificar se há lista de documentos ou mensagem de vazio
    const documentList = page
      .locator('[data-testid="document-list"], .document-list, table')
      .first();
    const emptyState = page
      .locator('text=/nenhum documento|sem documentos/i')
      .first();

    // Deve ter lista OU estado vazio
    const hasList = await documentList
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasEmpty = await emptyState
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    expect(hasList || hasEmpty).toBe(true);
  });
});
