import puppeteer from 'puppeteer';

async function testAllFeatures() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log(`BROWSER [${msg.type()}]:`, msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      console.log('API RESPONSE:', res.status(), res.url());
      if (res.status() >= 400) {
        try {
          console.error('API ERROR BODY:', await res.text());
        } catch {}
      }
    }
  });

  console.log('=== 1. Loading Canvas ===');
  await page.goto('https://neuraldesk-lovat.vercel.app', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'images/live_test_1_canvas.png' });

  // Check buttons present on canvas
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText,
      title: b.getAttribute('title'),
      className: b.className
    }));
  });
  console.log('CANVAS BUTTONS FOUND:', JSON.stringify(buttons, null, 2));

  // Check for Run button
  const runBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.innerText.includes('Run Workflow'));
  });

  if (runBtn.asElement()) {
    console.log('Clicking Run Workflow...');
    await runBtn.asElement()!.click();
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: 'images/live_test_2_after_run.png' });
  }

  // Check sidebar navigation items
  const sidebarButtons = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    if (!aside) return [];
    return Array.from(aside.querySelectorAll('button')).map(b => ({
      title: b.getAttribute('title') || b.innerText
    }));
  });
  console.log('SIDEBAR BUTTONS:', sidebarButtons);

  // Click Dashboard
  console.log('=== 2. Testing Dashboard ===');
  const clickedDashboard = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.title === 'Dashboard' || b.getAttribute('title')?.includes('Dashboard'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Dashboard:', clickedDashboard);
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'images/live_test_3_dashboard.png' });

  // Click Executions
  console.log('=== 3. Testing Executions ===');
  const clickedExec = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.title === 'Executions' || b.getAttribute('title')?.includes('Executions'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Executions:', clickedExec);
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'images/live_test_4_executions.png' });

  // Click Agent Studio
  console.log('=== 4. Testing Agent Studio ===');
  const clickedAgents = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.title?.includes('Agent') || b.getAttribute('title')?.includes('Agent'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Agent Studio:', clickedAgents);
  await new Promise(r => setTimeout(r, 3000));

  // Type in chat input and send
  const chatDispatched = await page.evaluate(async () => {
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Dispatch') || b.title?.includes('Dispatch'));
    if (input && sendBtn) {
      input.value = 'Hello Triage Sentinel, can you classify this ticket?';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      sendBtn.click();
      return true;
    }
    return false;
  });
  console.log('Dispatched Chat Message:', chatDispatched);
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'images/live_test_5_agent_studio.png' });

  // Click Prompt Library
  console.log('=== 5. Testing Prompt Library ===');
  const clickedPrompts = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.title?.includes('Prompt') || b.getAttribute('title')?.includes('Prompt'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Prompt Library:', clickedPrompts);
  await new Promise(r => setTimeout(r, 3000));
  
  // Click Test Run button in Prompt Library
  const testRunClicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Test Run'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Test Run in Prompts:', testRunClicked);
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'images/live_test_6_prompts.png' });

  await browser.close();
}

testAllFeatures().catch(console.error);
