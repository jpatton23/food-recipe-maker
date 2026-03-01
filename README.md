# 🍳 Food Recipe Maker

An AI-powered single-page web app that generates creative recipe ideas based on the ingredients you have at home.

---

## Screenshot

![Food Recipe Maker screenshot](screenshot.png)

---

## Features

- **Ingredient input** – Add ingredients as removable tag chips; supports Enter key
- **AI recipe generation** – Sends ingredients to OpenAI and gets back 3–5 detailed recipe suggestions
- **Recipe cards** – Each card shows name, cook time, difficulty, highlighted ingredients (have vs. need), and step-by-step instructions
- **Loading state** – Spinner and disabled button while the request is in progress
- **Error handling** – User-friendly messages for network/API errors and empty ingredient lists
- **API key management** – Prompt to enter your key; stored only in `localStorage`

---

## Setup & Usage

1. **Clone or download** this repository.
2. Open `index.html` directly in any modern browser — no build step or server required.
3. Click the **⚙️ Settings** button (top right) and enter your OpenAI API key.
4. Type ingredients you have at home and click **Add** (or press Enter).
5. Click **🔍 Find Recipes** and wait a moment for the AI to suggest recipes.

---

## How to Get an OpenAI API Key

1. Go to <https://platform.openai.com/api-keys>
2. Sign in or create a free account.
3. Click **Create new secret key**, copy the key, and paste it into the app's settings.

> **Note:** The API key is stored only in your browser's `localStorage` and is sent exclusively to OpenAI's servers. Keep your key private.

---

## File Structure

```
index.html      – Main HTML page
css/style.css   – All styling (warm food theme, responsive, animations)
js/app.js       – Ingredient management, UI interactions, recipe rendering
js/api.js       – OpenAI API integration, prompt construction, response parsing
README.md       – This file
```

---

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | Plain HTML, CSS, Vanilla JS   |
| AI Backend | OpenAI Chat Completions API   |
| Fonts      | Google Fonts – Poppins        |

---

## Future Improvements

- Save favorite recipes to `localStorage`
- Filter/search through generated recipes
- Support dietary preferences (vegetarian, gluten-free, etc.)
- Share recipes via a link
- Swap OpenAI model (GPT-4o, etc.) in settings
- Dark mode
