setInterval(() => {
  const url = window.location.href;
  if (url.includes('/library') || url.includes('/task')) {
    ['next', 'continue', 'retry', 'start', 'keep trying', 'yes, ask me the questions.'].forEach(buttonText => clickButton(buttonText));

    // Only auto-click "continue reading" on /library, not on /task
    if (url.includes('/library')) {
      const continueReadingButtons = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent.trim().toLowerCase() === 'continue reading');
      if (continueReadingButtons.length > 0) {
        for (let i = 0; i < continueReadingButtons.length; i++) {
          if (i !== 0) { // Check if it's not the first button
            continueReadingButtons[i].click();
            break; // Click only the first "continue reading" button that is not the first one
          }
        }
      }
    }
  }
}, 200);
