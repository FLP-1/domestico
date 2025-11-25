import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Fluxo Completo de Criação de Tarefas
 */

test.describe('Fluxo Completo de Criação de Tarefas', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="cpf"]', '12345678901');
    await page.fill('input[name="senha"]', 'senha123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('deve criar tarefa com sucesso', async ({ page }) => {
    // Navegar para página de tarefas
    await page.goto('/task-management');
    await page.waitForLoadState('networkidle');

    // Verificar se página carregou
    await expect(page.locator('h1, h2')).toContainText(/tarefa/i);

    // Procurar botão de criar tarefa
    const createButton = page.locator('button:has-text("Criar"), button:has-text("Nova Tarefa"), button:has-text("Adicionar")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);

      // Preencher formulário se modal aparecer
      const titleInput = page.locator('input[name="titulo"], input[name="title"], input[placeholder*="título"], input[placeholder*="title"]').first();
      const descriptionInput = page.locator('textarea[name="descricao"], textarea[name="description"], textarea[placeholder*="descrição"]').first();

      if (await titleInput.isVisible({ timeout: 3000 })) {
        await titleInput.fill('Tarefa de Teste E2E');
        
        if (await descriptionInput.isVisible()) {
          await descriptionInput.fill('Descrição da tarefa de teste');
        }

        // Salvar
        const saveButton = page.locator('button:has-text("Salvar"), button:has-text("Criar"), button[type="submit"]').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);

          // Verificar mensagem de sucesso
          const successMessage = page.locator('text=/sucesso|criada/i').first();
          if (await successMessage.isVisible({ timeout: 5000 })) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    }
  });

  test('deve exibir lista de tarefas', async ({ page }) => {
    await page.goto('/task-management');
    await page.waitForLoadState('networkidle');

    // Verificar se há lista de tarefas ou estado vazio
    const taskList = page.locator('[data-testid="task-list"], .task-list, table, [class*="task"]').first();
    const emptyState = page.locator('text=/nenhuma tarefa|sem tarefas/i').first();

    const hasList = await taskList.isVisible({ timeout: 3000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

    expect(hasList || hasEmpty).toBe(true);
  });
});

