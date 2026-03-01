/**
 * api.js – OpenAI API integration for Food Recipe Maker
 * Handles prompt construction, API calls, and response parsing.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo';

/**
 * Builds the system + user messages for the recipe generation request.
 * @param {string[]} ingredients
 * @returns {{ role: string, content: string }[]}
 */
function buildMessages(ingredients) {
  const ingredientList = ingredients.join(', ');

  const systemPrompt = `You are a professional chef and recipe developer. When given a list of ingredients, you suggest creative, practical recipes. Always respond with valid JSON in the exact format requested.`;

  const userPrompt = `I have the following ingredients: ${ingredientList}.

Please suggest 3 to 5 recipes I can make. For each recipe, respond with a JSON array where every element has these exact keys:
- "name": string – the recipe name
- "cookTime": string – estimated total cook time (e.g. "30 minutes")
- "difficulty": string – one of "Easy", "Medium", or "Hard"
- "ingredientsHave": string[] – ingredients from my list that are used
- "ingredientsNeed": string[] – additional ingredients not in my list (keep this minimal)
- "instructions": string[] – step-by-step cooking instructions (each step as a string)

Respond with ONLY the JSON array, no markdown fences, no extra text.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

/**
 * Parses the raw text response from the API into an array of recipe objects.
 * @param {string} text
 * @returns {object[]}
 */
function parseRecipes(text) {
  // Strip potential markdown code fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  const data = JSON.parse(cleaned);

  if (!Array.isArray(data)) {
    throw new Error('Unexpected response format from AI.');
  }

  return data;
}

/**
 * Calls the OpenAI Chat Completions API to generate recipes.
 * @param {string[]} ingredients – list of ingredient strings
 * @param {string} apiKey – OpenAI API key
 * @returns {Promise<object[]>} – resolves with an array of recipe objects
 */
async function fetchRecipes(ingredients, apiKey) {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: buildMessages(ingredients),
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      }
    } catch (_) {
      // ignore JSON parse errors on error response
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from AI. Please try again.');
  }

  return parseRecipes(content);
}
