import { test, expect } from './fixtures';

test.describe('Blog Post Creation - E2E UI Flow', () => {
  test('should open new post form, fill fields, and submit', async ({ page }) => {
    // 1. Mock the specific collection schema for 'blog'
    await page.route('**/api/v1/collections/blog', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          name: "blog",
          label: "Artigos do Blog",
          fields: [
            { name: "title", type: "text", label: "Título do Artigo" },
            { name: "content", type: "textarea", label: "Conteúdo" },
            { name: "slug", type: "text", label: "Slug" }
          ]
        }
      });
    });

    // 2. Mock the listing endpoint to show empty at first
    let dbEntries: any[] = [];
    await page.route('**/api/v1/collections/blog/entries?*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          data: dbEntries,
          meta: { total: dbEntries.length, totalPages: 1 }
        }
      });
    });

    // 3. Mock POST endpoint to intercept the row creation
    await page.route('**/api/v1/collections/blog/entries', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON();
        const newEntry = {
          id: `mock-id-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString()
        };
        dbEntries.push(newEntry);
        await route.fulfill({ status: 201, json: newEntry });
      } else {
        await route.continue();
      }
    });

    // 4. Start Interaction
    await page.goto('/blog');
    
    // Check if the collection loaded
    await expect(page.locator('.collection-toolbar')).toBeVisible();
    
    // Click 'New Post' button using typical locators (like button containing text)
    const newButton = page.locator('button', { hasText: /novo/i });
    if (await newButton.isVisible()) {
        await newButton.click();
    } else {
        // Fallback for known Next.js/React standard locators
        await page.locator('.btn-primary').click();
    }

    // Wait for slide-in or modal form to appear
    const modal = page.locator('.modal, .slide-pane').first();
    // Assuming UI generates standard CSS from our refactor
    
    // Fill the fields dynamically mapped from the schema
    await page.fill('input[name="title"]', 'E2E Testing is Awesome');
    await page.fill('input[name="slug"]', 'e2e-testing-awesome');
    await page.fill('textarea[name="content"]', 'This is the generated body of an automated E2E post.');

    // Save
    await page.locator('button[type="submit"], .btn-primary').click();

    // The modal should close or a success toast should appear.
    // Verify an entry is on the list
    await expect(page.locator('text=E2E Testing is Awesome')).toBeVisible();
  });
});
