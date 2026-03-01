/**
 * app.js – Main application logic for Food Recipe Maker
 * Handles ingredient management, UI interactions, and recipe display.
 */

// ── State ────────────────────────────────────────────────────────────────────
const state = {
  ingredients: [],
  isLoading: false,
};

// ── DOM References ────────────────────────────────────────────────────────────
const ingredientInput = document.getElementById('ingredient-input');
const addIngredientBtn = document.getElementById('add-ingredient-btn');
const ingredientTagsEl = document.getElementById('ingredient-tags');
const noIngredientsMsg = document.getElementById('no-ingredients-msg');
const getRecipesBtn = document.getElementById('get-recipes-btn');
const btnSpinner = document.getElementById('btn-spinner');
const errorMessage = document.getElementById('error-message');
const recipeGrid = document.getElementById('recipe-grid');

const settingsBtn = document.getElementById('settings-btn');
const apiModal = document.getElementById('api-modal');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const apiBanner = document.getElementById('api-banner');
const setKeyBannerBtn = document.getElementById('set-key-banner-btn');

// ── API Key Helpers ───────────────────────────────────────────────────────────
function getApiKey() {
  return localStorage.getItem('openai_api_key') || '';
}

function saveApiKey(key) {
  localStorage.setItem('openai_api_key', key.trim());
}

function updateApiBanner() {
  if (!getApiKey()) {
    apiBanner.classList.add('visible');
  } else {
    apiBanner.classList.remove('visible');
  }
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal() {
  apiKeyInput.value = getApiKey();
  apiModal.classList.add('open');
  apiKeyInput.focus();
}

function closeModal() {
  apiModal.classList.remove('open');
}

settingsBtn.addEventListener('click', openModal);
setKeyBannerBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

apiModal.addEventListener('click', (e) => {
  if (e.target === apiModal) closeModal();
});

saveApiKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    showError('Please enter a valid API key.');
    return;
  }
  saveApiKey(key);
  closeModal();
  updateApiBanner();
  clearError();
});

apiKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveApiKeyBtn.click();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && apiModal.classList.contains('open')) closeModal();
});

// ── Ingredient Management ─────────────────────────────────────────────────────
function normalizeIngredient(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

function addIngredient() {
  const value = ingredientInput.value;
  const normalized = normalizeIngredient(value);

  if (!normalized) return;

  if (normalized.length > 80) {
    showError('Ingredient name is too long (max 80 characters).');
    return;
  }

  if (state.ingredients.includes(normalized)) {
    showError(`"${normalized}" is already in your list.`);
    ingredientInput.select();
    return;
  }

  state.ingredients.push(normalized);
  ingredientInput.value = '';
  clearError();
  renderIngredients();
}

function removeIngredient(name) {
  state.ingredients = state.ingredients.filter((i) => i !== name);
  renderIngredients();
}

function renderIngredients() {
  ingredientTagsEl.innerHTML = '';

  if (state.ingredients.length === 0) {
    noIngredientsMsg.style.display = 'block';
    getRecipesBtn.disabled = true;
    return;
  }

  noIngredientsMsg.style.display = 'none';
  getRecipesBtn.disabled = false;

  state.ingredients.forEach((ingredient) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = ingredient;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'tag-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.setAttribute('aria-label', `Remove ${ingredient}`);
    removeBtn.addEventListener('click', () => removeIngredient(ingredient));

    tag.appendChild(removeBtn);
    ingredientTagsEl.appendChild(tag);
  });
}

addIngredientBtn.addEventListener('click', addIngredient);

ingredientInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addIngredient();
});

// ── Error / Loading Helpers ───────────────────────────────────────────────────
function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.add('visible');
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.remove('visible');
}

function setLoading(loading) {
  state.isLoading = loading;
  getRecipesBtn.disabled = loading;
  btnSpinner.classList.toggle('active', loading);

  const btnText = getRecipesBtn.querySelector('.btn-text');
  if (btnText) {
    btnText.textContent = loading ? 'Finding Recipes…' : '🔍 Find Recipes';
  }
}

// ── Recipe Display ────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildRecipeCard(recipe, index) {
  const have = Array.isArray(recipe.ingredientsHave) ? recipe.ingredientsHave : [];
  const need = Array.isArray(recipe.ingredientsNeed) ? recipe.ingredientsNeed : [];
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];

  const haveItems = have
    .map((i) => `<li class="have">${escapeHtml(i)}</li>`)
    .join('');
  const needItems = need
    .map((i) => `<li class="need">${escapeHtml(i)}</li>`)
    .join('');

  const instructionItems = instructions
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join('');

  const legendHtml =
    have.length && need.length
      ? `<div class="ingredient-legend">
           <span class="legend-item"><span class="legend-dot have"></span>You have</span>
           <span class="legend-item"><span class="legend-dot need"></span>You need</span>
         </div>`
      : '';

  const card = document.createElement('article');
  card.className = 'recipe-card';
  card.style.animationDelay = `${index * 0.07}s`;

  card.innerHTML = `
    <div class="recipe-card-header">
      <h3>${escapeHtml(recipe.name || 'Recipe')}</h3>
      <div class="recipe-meta">
        <span class="recipe-meta-item">⏱ ${escapeHtml(recipe.cookTime || 'N/A')}</span>
        <span class="recipe-meta-item">📊 ${escapeHtml(recipe.difficulty || 'N/A')}</span>
      </div>
    </div>
    <div class="recipe-card-body">
      <p class="recipe-section-label">Ingredients</p>
      <ul class="ingredient-list">
        ${haveItems}${needItems}
      </ul>
      ${legendHtml}
      <p class="recipe-section-label">Instructions</p>
      <ol class="instructions-list">
        ${instructionItems}
      </ol>
    </div>
  `;

  return card;
}

function renderRecipes(recipes) {
  recipeGrid.innerHTML = '';

  if (!recipes || recipes.length === 0) {
    showError('No recipes were returned. Please try again.');
    return;
  }

  recipes.forEach((recipe, index) => {
    recipeGrid.appendChild(buildRecipeCard(recipe, index));
  });

  // Smooth scroll to recipes
  recipeGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Get Recipes ───────────────────────────────────────────────────────────────
getRecipesBtn.addEventListener('click', async () => {
  clearError();

  if (state.ingredients.length === 0) {
    showError('Please add at least one ingredient before finding recipes.');
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    showError('Please set your OpenAI API key first by clicking the ⚙️ button.');
    openModal();
    return;
  }

  setLoading(true);
  recipeGrid.innerHTML = '';

  try {
    const recipes = await fetchRecipes(state.ingredients, apiKey);
    renderRecipes(recipes);
  } catch (err) {
    showError(`Error: ${err.message || 'Something went wrong. Please try again.'}`);
  } finally {
    setLoading(false);

    // Re-enable button only if there are ingredients
    if (state.ingredients.length > 0) {
      getRecipesBtn.disabled = false;
    }
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
(function init() {
  updateApiBanner();
  renderIngredients();
})();
