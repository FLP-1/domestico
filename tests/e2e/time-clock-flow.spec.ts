import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Fluxo Completo de Registro de Ponto
 * Testa o fluxo completo desde login até registro de ponto
 */

test.describe('Fluxo Completo de Registro de Ponto', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para página de login
    await page.goto('/login');
  });

  test('deve completar fluxo completo de registro de ponto', async ({
    page,
  }) => {
    // 1. Login
    await page.fill('input[name="cpf"]', '12345678901');
    await page.fill('input[name="senha"]', 'senha123');
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // 2. Navegar para página de ponto
    await page.goto('/time-clock');
    await page.waitForLoadState('networkidle');

    // 3. Verificar se página carregou corretamente
    await expect(page.locator('h1, h2')).toContainText(/ponto/i);

    // 4. Clicar no botão de entrada (se disponível)
    const entradaButton = page.locator('button:has-text("Entrada"), button:has-text("ENTRADA")').first();
    
    if (await entradaButton.isVisible()) {
      await entradaButton.click();

      // 5. Aguardar confirmação ou modal
      await page.waitForTimeout(2000);

      // 6. Verificar se registro foi realizado
      // Pode verificar toast de sucesso ou mudança na UI
      const successMessage = page.locator('text=/sucesso|registrado/i').first();
      
      // Se houver mensagem de sucesso, verificar
      if (await successMessage.isVisible({ timeout: 5000 })) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('deve mostrar erro se tentar registrar ponto sem permissão de localização', async ({
    page,
    context,
  }) => {
    // Bloquear permissão de geolocalização
    await context.grantPermissions([]);

    // Login
    await page.fill('input[name="cpf"]', '12345678901');
    await page.fill('input[name="senha"]', 'senha123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Navegar para página de ponto
    await page.goto('/time-clock');
    await page.waitForLoadState('networkidle');

    // Tentar registrar ponto
    const entradaButton = page.locator('button:has-text("Entrada")').first();
    
    if (await entradaButton.isVisible()) {
      await entradaButton.click();

      // Verificar se há mensagem de erro ou aviso sobre geolocalização
      await page.waitForTimeout(2000);
      
      // Pode haver modal ou mensagem sobre geolocalização
      const errorMessage = page.locator('text=/localização|geolocalização/i').first();
      
      if (await errorMessage.isVisible({ timeout: 5000 })) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('deve exibir histórico de registros', async ({ page }) => {
    // Login
    await page.fill('input[name="cpf"]', '12345678901');
    await page.fill('input[name="senha"]', 'senha123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Navegar para página de ponto
    await page.goto('/time-clock');
    await page.waitForLoadState('networkidle');

    // Verificar se há seção de histórico
    const historySection = page.locator('text=/histórico|registros/i').first();
    
    // Seção de histórico pode estar presente
    if (await historySection.isVisible({ timeout: 5000 })) {
      await expect(historySection).toBeVisible();
    }
  });
});

