const crypto = require('crypto');
const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;
const sessions = new Map();

function createLogger(session) {
  return (...args) => {
    const line = `[${new Date().toISOString()}] ${args
      .map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
      .join(' ')}`;
    session.logs.push(line);
    if (session.logs.length > 200) {
      session.logs.shift();
    }
    console.log(`[Session ${session.id}]`, ...args);
  };
}

async function queryGemini(session, log, question, options, context) {
  const model = 'gemini-3.5-flash-lite';
  const keys = session.geminiApiKeys;

  const prompt = `
Question: ${question}

Options:
${options}

Context:
${context}

Give ONLY the answer exactly as it is sent to you back.
`;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    if (session.stopRequested) return null;

    const index = (session.currentKeyIndex + attempt) % keys.length;
    const key = keys[index];

    if (!key || typeof key !== 'string' || key.startsWith('YOUR_')) {
      log(`Gemini key #${index + 1} is not configured.`);
      continue;
    }

    try {
      log(`Trying Gemini key #${index + 1}`);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0,
              maxOutputTokens: 128
            }
          })
        }
      );

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        log(`Gemini key #${index + 1} failed: HTTP ${res.status}`, errorText.slice(0, 200));
        continue;
      }

      const data = await res.json();
      const answer = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim();

      if (!answer) {
        log(`Key #${index + 1} returned no answer.`);
        continue;
      }

      session.currentKeyIndex = index;
      log(`Gemini key #${index + 1} worked. Response: ${answer}`);
      return answer;
    } catch (error) {
      log(`Key #${index + 1} encountered an error:`, error.message || error);
    }
  }

  log('All Gemini keys failed.');
  return null;
}

async function runSession(session) {
  const log = createLogger(session);
  session.status = 'running';
  session.startedAt = new Date().toISOString();

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    session.browser = browser;

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.exposeFunction('addSRP', (srp) => {
      const gained = Number(srp) || 0;
      session.totalSRP += gained;
      log(`+${gained} SRP gained! Total SRP: ${session.totalSRP}/${session.targetSRP}`);
    });

    await page.evaluateOnNewDocument(() => {
      const seen = new WeakSet();
      const checkNode = (node) => {
        if (node.nodeType === 1 && node.tagName === 'DIV' && !seen.has(node)) {
          const match = node.textContent.match(/\+(\d+)\s*SRP/);
          if (match) {
            seen.add(node);
            window.addSRP(Number(match[1]));
          }
        }
      };

      window.addEventListener('DOMContentLoaded', () => {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
              checkNode(node);
              if (node.querySelectorAll) {
                node.querySelectorAll('div').forEach(checkNode);
              }
            });
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      });
    });

    await page.evaluateOnNewDocument(() => {
      setInterval(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        const target = buttons.find(el => {
          const text = el.innerText?.trim().toLowerCase() || '';
          const isVisible = el.offsetParent !== null && !el.disabled;
          return isVisible && (
            text === 'continue' || text === 'retry' || text === 'next' ||
            text.includes('continue') || text.includes('retry') || text.includes('next')
          );
        });
        if (target) {
          target.click();
        }
      }, 800);
    });

    await page.goto('https://reader.sparx-learning.com', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await page.waitForSelector('input', { visible: true, timeout: 10000 });
    await page.type('input', 'IG4 5LP', { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.keyboard.press('Enter');

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 500));

    for (const frame of page.frames()) {
      try {
        const acceptButton = await frame.$('::-p-xpath(//*[self::button or self::a or @role="button"][contains(translate(normalize-space(.), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "accept all")])');
        if (acceptButton) {
          await acceptButton.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        }
      } catch (e) {}
    }

    await page.waitForSelector('#username', { visible: true, timeout: 10000 });
    await page.type('#username', session.username, { delay: 100 });

    await page.waitForSelector('#password', { visible: true, timeout: 10000 });
    await page.type('#password', session.password, { delay: 100 });

    await page.waitForSelector('.sm-button.login-button', { visible: true, timeout: 10000 });
    await page.click('.sm-button.login-button');

    await page.locator('::-p-text(Start reading)').click();

    while (session.totalSRP < session.targetSRP && !session.stopRequested) {
      log('Starting next reading section...');

      await page.waitForFunction(
        () => document.body && document.body.textContent.includes('Start reading here'),
        { timeout: 15000 }
      );

      const cachedText = await page.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('div')).filter(div =>
          div.textContent.includes('Start reading here')
        );
        let bestDiv = null, maxParagraphs = 0;
        candidates.forEach(div => {
          const paragraphs = div.querySelectorAll('p');
          if (paragraphs.length > maxParagraphs) {
            maxParagraphs = paragraphs.length;
            bestDiv = div;
          }
        });
        return bestDiv
          ? Array.from(bestDiv.querySelectorAll('p')).map(p => p.textContent.trim()).join(' ')
          : null;
      });
      log('Cached text updated.');

      await page.locator('::-p-text(I have read up to here)').click();
      log('Clicked "I have read up to here"');

      const confirmSelector = '::-p-xpath(//*[self::button or self::a or @role="button"][contains(normalize-space(.), "Yes, ask me the questions")])';
      const confirmBtn = await page.waitForSelector(confirmSelector, { visible: true, timeout: 3000 }).catch(() => null);
      if (confirmBtn) {
        await confirmBtn.evaluate(el => el.click());
        log('Clicked "Yes, ask me the questions"');
      }

      await page.waitForFunction(() => {
        const questionElement = Array.from(document.querySelectorAll('h2 > div')).find(div => {
          const text = div.innerText.trim();
          return (text.includes('?') || text.includes('.')) && text.length < 500;
        });
        const badTexts = ['Settings', 'Feedback', 'Cookie Settings', 'Sign out', 'I have read up to here'];
        const optionElements = Array.from(document.querySelectorAll('button')).filter(button => {
          const text = button.querySelector('div')?.textContent.trim();
          return text && !badTexts.includes(text);
        });
        return questionElement && optionElements.length >= 2;
      }, { timeout: 15000 });

      while (!session.stopRequested) {
        const quizData = await page.evaluate(() => {
          const questionElement = Array.from(document.querySelectorAll('h2 > div')).find(div => {
            const text = div.innerText.trim();
            return (text.includes('?') || text.includes('.')) && text.length < 500;
          });
          if (!questionElement) return null;

          const badTexts = ['Settings', 'Feedback', 'Cookie Settings', 'Sign out', 'I have read up to here'];
          const optionElements = Array.from(document.querySelectorAll('button')).filter(button => {
            const text = button.querySelector('div')?.textContent.trim();
            return text && !badTexts.includes(text);
          });

          return {
            questionText: questionElement.innerText.trim(),
            optionTexts: optionElements.map(btn => btn.innerText.trim())
          };
        });

        if (!quizData || quizData.optionTexts.length < 2) {
          log('All questions for this section finished!');
          break;
        }

        const { questionText, optionTexts } = quizData;
        log('Question:', questionText);

        const formattedOptions = optionTexts.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
        const chosenAnswer = await queryGemini(session, log, questionText, formattedOptions, cachedText);

        if (chosenAnswer) {
          const cleanAnswer = chosenAnswer.replace(/^\d+\.\s*/, '').trim().toLowerCase();

          const clickedText = await page.evaluate((targetAnswer) => {
            const badTexts = ['Settings', 'Feedback', 'Cookie Settings', 'Sign out', 'I have read up to here'];
            const buttons = Array.from(document.querySelectorAll('button')).filter(button => {
              const text = button.querySelector('div')?.textContent.trim();
              return text && !badTexts.includes(text);
            });

            let match = buttons.find(btn => btn.innerText.trim().toLowerCase() === targetAnswer);
            if (!match) {
              match = buttons.find(btn => {
                const t = btn.innerText.trim().toLowerCase();
                return t.includes(targetAnswer) || targetAnswer.includes(t);
              });
            }

            if (match) {
              match.click();
              return match.innerText.trim();
            }
            return null;
          }, cleanAnswer);

          if (clickedText) {
            log(`Clicked option: "${clickedText}"`);
          } else {
            log('Could not match API response to any button:', chosenAnswer);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2500));
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    session.status = session.stopRequested ? 'stopped' : 'completed';
    log(`Finished. Final Total SRP Gained: ${session.totalSRP}`);
  } catch (error) {
    session.status = session.stopRequested ? 'stopped' : 'failed';
    session.error = `[${session.currentStep}] ${error.message || String(error)}`;
    log('Session error:', session.error);
    log('Stack:', error.stack);
  } finally {
    // Scrub sensitive credentials from memory once finished
    session.password = null;
    session.geminiApiKeys = [];
    session.browser = null;
    session.finishedAt = new Date().toISOString();

    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Start a new session
app.post('/run', (req, res) => {
  const { username, password, geminiApiKeys, targetSRP } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const keys = Array.isArray(geminiApiKeys)
    ? geminiApiKeys.filter(k => typeof k === 'string' && k.trim().length > 0)
    : [];

  if (keys.length === 0) {
    return res.status(400).json({ error: 'geminiApiKeys must be a non-empty array of strings' });
  }

  const parsedTargetSRP = Number(targetSRP);
  if (!Number.isFinite(parsedTargetSRP) || parsedTargetSRP <= 0) {
    return res.status(400).json({ error: 'targetSRP must be a positive number' });
  }

  const sessionId = crypto.randomUUID();
  const session = {
    id: sessionId,
    status: 'queued',
    username,
    password,
    geminiApiKeys: keys,
    currentKeyIndex: 0,
    targetSRP: parsedTargetSRP,
    totalSRP: 0,
    stopRequested: false,
    browser: null,
    logs: [],
    error: null,
    createdAt: new Date().toISOString(),
    startedAt: null,
    finishedAt: null
  };

  sessions.set(sessionId, session);

  // Run in background without blocking the HTTP response
  setImmediate(() => runSession(session));

  return res.status(202).json({
    sessionId,
    status: session.status,
    statusUrl: `/sessions/${sessionId}`
  });
});

// Check session progress & logs
app.get('/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return res.json({
    sessionId: session.id,
    status: session.status,
    totalSRP: session.totalSRP,
    targetSRP: session.targetSRP,
    error: session.error,
    createdAt: session.createdAt,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    logs: session.logs
  });
});

// Stop a running session
app.post('/sessions/:id/stop', async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  session.stopRequested = true;
  if (session.browser) {
    await session.browser.close().catch(() => {});
  }

  return res.json({ sessionId: session.id, status: 'stopping' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
