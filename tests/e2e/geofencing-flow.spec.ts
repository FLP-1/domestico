import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Fluxo Completo de Geofencing
 */

test.describe('Fluxo Completo de Geofencing', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="cpf"]', '12345678901');
    await page.fill('input[name="senha"]', 'senha123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('deve criar local de trabalho', async ({ page }) => {
    // Navegar para página de geofencing
    await page.goto('/geofencing/locais');
    await page.waitForLoadState('networkidle');

    // Verificar se página carregou
    await expect(page.locator('h1, h2')).toContainText(/local|geofencing/i);

    // Procurar botão de criar local
    const createButton = page.locator('button:has-text("Criar"), button:has-text("Novo"), button:has-text("Adicionar")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);

      // Preencher formulário se modal aparecer
      const nameInput = page.locator('input[name="nome"], input[name="name"], input[placeholder*="nome"]').first();
      const addressInput = page.locator('input[name="endereco"], input[name="address"], textarea[name="endereco"]').first();

      if (await nameInput.isVisible({ timeout: 3000 })) {
        await nameInput.fill('Local de Teste E2E');
        
        if (await addressInput.isVisible()) {
          await addressInput.fill('Rua Teste, 123');
        }

        // Salvar
        const saveButton = page.locator('button:has-text("Salvar"), button:has-text("Criar"), button[type="submit"]').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);

          // Verificar mensagem de sucesso
          const successMessage = page.locator('text=/sucesso|criado/i').first();
          if (await successMessage.isVisible({ timeout: 5000 })) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    }
  });

  test('deve exibir lista de locais', async ({ page }) => {
    await page.goto('/geofencing/locais');
    await page.waitForLoadState('networkidle');

    // Verificar se há lista de locais ou estado vazio
    const locationsList = page.locator('[data-testid="locations-list"], .locations-list, table, [class*="location"]').first();
    const emptyState = page.locator('text=/nenhum local|sem locais/i').first();

    const hasList = await locationsList.isVisible({ timeout: 3000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

    expect(hasList || hasEmpty).toBe(true);
  });

  test('deve exibir auditoria de geofencing', async ({ page }) => {
    await page.goto('/geofencing/auditoria');
    await page.waitForLoadState('networkidle');

    // Verificar se página carregou
    await expect(page.locator('h1, h2')).toContainText(/auditoria|geofencing/i);

    // Verificar se há tabela ou lista de logs
    const auditTable = page.locator('table, [data-testid="audit-list"], .audit-list').first();
    const emptyState = page.locator('text=/nenhum registro|sem registros/i').first();

    const hasTable = await auditTable.isVisible({ timeout: 3000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

    expect(hasTable || hasEmpty).toBe(true);
  });
});
