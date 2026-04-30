const dishInput = document.getElementById("dish-input");
const formatSelect = document.getElementById("format-select");
const generateBtn = document.getElementById("generate-btn");
const btnText = generateBtn.querySelector(".btn-text");
const btnLoading = generateBtn.querySelector(".btn-loading");

const skeleton = document.getElementById("skeleton");
const resultSection = document.getElementById("result-section");
const recipeHero = document.getElementById("recipe-hero");
const heroImg = document.getElementById("hero-img");
const heroFallback = document.getElementById("hero-fallback");
const recipeBadge = document.getElementById("recipe-badge");
const resultTitle = document.getElementById("result-title");
const recipeOutput = document.getElementById("recipe-output");
const copyBtn = document.getElementById("copy-btn");
const newRecipeBtn = document.getElementById("new-recipe-btn");

const errorSection = document.getElementById("error-section");
const errorMessage = document.getElementById("error-message");
const retryBtn = document.getElementById("retry-btn");
const toast = document.getElementById("toast");

// Dish emoji + gradient mapping
const dishThemes = {
    pasta: { emoji: "🍝", gradient: "linear-gradient(135deg, #f59e0b, #dc2626, #7c2d12)" },
    pizza: { emoji: "🍕", gradient: "linear-gradient(135deg, #ef4444, #f59e0b, #dc2626)" },
    sushi: { emoji: "🍣", gradient: "linear-gradient(135deg, #06b6d4, #0891b2, #0e7490)" },
    burger: { emoji: "🍔", gradient: "linear-gradient(135deg, #f59e0b, #d97706, #92400e)" },
    ramen: { emoji: "🍜", gradient: "linear-gradient(135deg, #f97316, #ea580c, #c2410c)" },
    curry: { emoji: "🍛", gradient: "linear-gradient(135deg, #eab308, #ca8a04, #a16207)" },
    taco: { emoji: "🌮", gradient: "linear-gradient(135deg, #f59e0b, #84cc16, #65a30d)" },
    salad: { emoji: "🥗", gradient: "linear-gradient(135deg, #84cc16, #65a30d, #4d7c0f)" },
    steak: { emoji: "🥩", gradient: "linear-gradient(135deg, #dc2626, #991b1b, #7f1d1d)" },
    chicken: { emoji: "🍗", gradient: "linear-gradient(135deg, #f59e0b, #d97706, #b45309)" },
    rice: { emoji: "🍚", gradient: "linear-gradient(135deg, #f3f4f6, #d1d5db, #9ca3af)" },
    soup: { emoji: "🍲", gradient: "linear-gradient(135deg, #f97316, #ea580c, #c2410c)" },
    cake: { emoji: "🍰", gradient: "linear-gradient(135deg, #ec4899, #db2777, #be185d)" },
    ice: { emoji: "🍨", gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6, #7c3aed)" },
    donut: { emoji: "🍩", gradient: "linear-gradient(135deg, #f472b6, #ec4899, #db2777)" },
    cookie: { emoji: "🍪", gradient: "linear-gradient(135deg, #d97706, #b45309, #92400e)" },
    bread: { emoji: "🍞", gradient: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)" },
    sandwich: { emoji: "🥪", gradient: "linear-gradient(135deg, #fbbf24, #84cc16, #65a30d)" },
    noodle: { emoji: "🍝", gradient: "linear-gradient(135deg, #fbbf24, #f59e0b, #dc2626)" },
    biryani: { emoji: "🍛", gradient: "linear-gradient(135deg, #f59e0b, #dc2626, #7c2d12)" },
    tiramisu: { emoji: "🍰", gradient: "linear-gradient(135deg, #78350f, #451a03, #292524)" },
    pancake: { emoji: "🥞", gradient: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)" },
    waffle: { emoji: "🧇", gradient: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)" },
    default: { emoji: "🍽️", gradient: "linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b)" }
};

function getDishTheme(dish) {
    const lower = dish.toLowerCase();
    for (const [key, theme] of Object.entries(dishThemes)) {
        if (lower.includes(key)) return theme;
    }
    return dishThemes.default;
}

function renderMarkdown(text) {
    return text
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/^[\*\-] (.+)$/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
        .replace(/\n{2,}/g, "<br/><br/>")
        .replace(/\n/g, "<br/>");
}

async function generateRecipe() {
    const dish = dishInput.value.trim();
    const format = formatSelect.value;

    if (!dish) {
        dishInput.focus();
        dishInput.style.borderColor = "var(--error)";
        setTimeout(() => dishInput.style.borderColor = "", 1500);
        return;
    }

    generateBtn.disabled = true;
    btnText.classList.add("hidden");
    btnLoading.classList.remove("hidden");
    skeleton.classList.remove("hidden");
    resultSection.classList.add("hidden");
    errorSection.classList.add("hidden");

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dish, format }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Something went wrong.");

        const theme = getDishTheme(dish);

        skeleton.classList.add("hidden");
        // Set fallback gradient
        heroFallback.style.background = theme.gradient;
        // Load real image
        heroImg.classList.remove("loaded");
        heroImg.alt = dish;
        if (data.image_url) {
            heroImg.onload = () => heroImg.classList.add("loaded");
            heroImg.onerror = () => { heroImg.style.display = "none"; };
            heroImg.src = data.image_url;
        } else {
            heroImg.style.display = "none";
        }
        recipeBadge.textContent = format.replace(/-/g, " ");
        resultTitle.textContent = dish;
        recipeOutput.innerHTML = renderMarkdown(data.recipe);
        resultSection.classList.remove("hidden");
        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
        skeleton.classList.add("hidden");
        errorMessage.textContent = err.message;
        errorSection.classList.remove("hidden");
    } finally {
        generateBtn.disabled = false;
        btnText.classList.remove("hidden");
        btnLoading.classList.add("hidden");
    }
}

function showToast() {
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.classList.add("hidden"), 300);
    }, 2500);
}

generateBtn.addEventListener("click", generateRecipe);
dishInput.addEventListener("keydown", (e) => { if (e.key === "Enter") generateRecipe(); });
copyBtn.addEventListener("click", () => navigator.clipboard.writeText(recipeOutput.innerText).then(showToast));
newRecipeBtn.addEventListener("click", () => {
    resultSection.classList.add("hidden");
    errorSection.classList.add("hidden");
    heroImg.src = "";
    heroImg.style.display = "";
    heroImg.classList.remove("loaded");
    dishInput.value = "";
    dishInput.focus();
});
retryBtn.addEventListener("click", generateRecipe);
