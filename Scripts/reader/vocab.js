console.log("Vocab script loaded!");

document.addEventListener('keydown', async (event) => {
    
    if (event.key === '1' && window.location.href.includes('https://reader.sparx-learning.com/vocab')) {
        event.preventDefault();

        const root = document.querySelector('.sr_aaed2008');
        const spans = root.querySelectorAll('.sr_7c285d4d .sr_9ab0353c');
        const totalLength = spans.length;

        let partial = Array.from(spans)
            .map(span => span.textContent.trim())
            .join('');

        const definition = root.querySelectorAll('.sr_f429a08a')[1]
            .querySelector('.sr_261f41c9').textContent.trim();

        const sentence = root.querySelectorAll('.sr_f429a08a')[2]
            .querySelector('.sr_261f41c9').textContent.trim();

        const prompt = `
            You are a word-completion AI. Your ONLY job is to return a SINGLE word that:

            - Includes: "${partial}"
            - Is exactly ${totalLength} letters long
            - Matches this definition: "${definition}"
            - Fits in this sentence: "${sentence}"

            ⚠️ IMPORTANT RULES:
            - ONLY reply with the one completed word.
            - Do NOT explain anything.
            - Do NOT include punctuation, quotes, or extra text.
            - ONLY the word. No extra characters.

            Return the correct word that best fits all of the above.
            `;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                console.error("Gemini API Error:", response.statusText);
                return;
            }

            const data = await response.json();
            let fullWord = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
            fullWord = fullWord.replace(/[^a-zA-Z]/g, '').trim();

            Array.from(spans).forEach((span, index) => {
                span.textContent = fullWord[index] || '';
            });

            const keyboardButton = [...document.querySelectorAll('button')].find(btn => btn.textContent.trim() === 'Use Keyboard input');
            keyboardButton?.click();

            setTimeout(() => {
                document.querySelector('input.sr_023d6da4').value = fullWord;
            }, 1500);

        } catch (error) {
            console.error("Error during API call or processing:", error);
        }
    }
});