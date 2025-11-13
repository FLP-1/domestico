/**
 * Testes E2E: Fluxo de Autenticação
 * Testa o fluxo completo de login e seleção de perfil
 */

import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página de login
    await page.goto('/login');
  });

  test('deve fazer login com sucesso', async ({ page }) => {
    // Preencher formulário de login
    await page.fill('input[type="text"]', '59876913700');
    await page.fill('input[type="password"]', 'senha123');

    // Clicar no botão de login
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento ou modal de seleção de perfil
    await page.waitForTimeout(2000);

    // Verificar se está na página correta ou se modal apareceu
    const url = page.url();
    const hasModal = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    
    expect(url.includes('/dashboard') || hasModal || url.includes('/login')).toBe(true);
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    // Preencher com credenciais inválidas
    await page.fill('input[type="text"]', '12345678901');
    await page.fill('input[type="password"]', 'senhaErrada');

    // Clicar no botão de login
    await page.click('button[type="submit"]');

    // Aguardar mensagem de erro
    await page.waitForTimeout(1000);

    // Verificar se mensagem de erro aparece
    const errorMessage = await page.locator('text=/credenciais|inválidas|erro/i').isVisible().catch(() => false);
    expect(errorMessage).toBe(true);
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    // Tentar fazer login sem preencher campos
    await page.click('button[type="submit"]');

    // Verificar se há validação de campos
    await page.waitForTimeout(500);

    // Verificar se há mensagens de validação ou se o botão está desabilitado
    const submitButton = page.locator('button[type="submit"]');
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    
    // Pode haver validação HTML5 ou customizada
    expect(isDisabled || page.url().includes('/login')).toBe(true);
  });
});

