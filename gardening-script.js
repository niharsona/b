/* ============================================================
   gardening-script.js — KuttyTeachers Gardening Page Logic
   Handles:
     - Load plants from plants-data.json
     - Category filter buttons
     - Plant cards (with video badge)
     - Modal popup (with video embed / placeholder)
   ============================================================
   Author : KuttyTeachers (kuttyteachers.in)
   © 2026 KuttyTeachers — All Rights Reserved
   NOTE: Hamburger menu is now handled by kutty-extras.js
   ============================================================ */

// Global state
let plantsData      = [];
let categoriesData  = [];
let currentCategory = 'all';

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadPlantsData();
});

// ── LOAD DATA ─────────────────────────────────────────────────
async function loadPlantsData() {
    try {
        const response = await fetch('plants-data.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data     = await response.json();
        categoriesData = data.categories;
        plantsData     = data.plants;
        renderCategories();
        renderPlants('all');
    } catch (error) {
        console.error('Gardening — data load error:', error);
        const grid = document.getElementById('plants-grid');
        if (grid) grid.innerHTML =
            '<p style="text-align:center;color:#2d6a4f;padding:40px;grid-column:1/-1;">'
            + 'ഡേറ്റ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ദയവായി പേജ് രീഫ്രഷ് ചെയ്യുക.</p>';
    }
}

// ── CATEGORY FILTER ───────────────────────────────────────────
function renderCategories() {
    const container = document.getElementById('category-filter');
    if (!container) return;
    container.innerHTML = '';

    // "All plants" button
    const allBtn = document.createElement('button');
    allBtn.className   = 'category-btn active';
    allBtn.textContent = '🌿 എല്ലാ ചെടികൾ';
    allBtn.addEventListener('click', (e) => filterByCategory('all', e.currentTarget));
    container.appendChild(allBtn);

    // One button per category
    categoriesData.forEach(cat => {
        const btn = document.createElement('button');
        btn.className   = 'category-btn';
        btn.textContent = `${cat.emoji} ${cat.name}`;
        btn.addEventListener('click', (e) => filterByCategory(cat.id, e.currentTarget));
        container.appendChild(btn);
    });
}

// Pass the clicked element explicitly — avoids the deprecated global `event`
function filterByCategory(categoryId, clickedBtn) {
    currentCategory = categoryId;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');
    renderPlants(categoryId);
}

// ── PLANTS GRID ───────────────────────────────────────────────
function renderPlants(categoryId) {
    const grid = document.getElementById('plants-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const list = categoryId === 'all'
        ? plantsData
        : plantsData.filter(p => p.category === categoryId);

    if (list.length === 0) {
        grid.innerHTML =
            '<p style="text-align:center;color:#2d6a4f;padding:40px;grid-column:1/-1;">'
            + 'ഈ വിഭാഗത്തിൽ ചെടികൾ ഇല്ല.</p>';
        return;
    }

    list.forEach(plant => grid.appendChild(createPlantCard(plant)));
}

// ── PLANT CARD ────────────────────────────────────────────────
function createPlantCard(plant) {
    const card = document.createElement('div');
    card.className = 'plant-card';

    const cat          = categoriesData.find(c => c.id === plant.category);
    const catEmoji     = cat ? cat.emoji : '🌿';
    const firstImage   = plant.images && plant.images.length > 0 ? plant.images[0] : null;

    const imageHTML    = firstImage
        ? `<img src="${firstImage}" alt="${plant.name}" class="plant-image" loading="lazy">`
        : `<div class="plant-image-placeholder">${catEmoji}</div>`;

    // Small badge on card thumbnail if video exists
    const videoBadge   = (plant.video && plant.video.trim())
        ? `<div class="plant-video-badge">▶ വീഡിയോ</div>`
        : '';

    card.innerHTML = `
        <div class="plant-images">
            ${imageHTML}
            ${videoBadge}
        </div>
        <div class="plant-info">
            <div class="plant-header">
                <span class="plant-emoji">${catEmoji}</span>
                <span class="plant-name">${plant.name}</span>
            </div>
            <div class="plant-scientific">${plant.scientificName}</div>
            <p class="plant-description">${plant.description.substring(0, 100)}...</p>

            <div class="care-grid">
                <div class="care-item">
                    <span class="care-label">☀️ സൂര്യപ്രകാശം</span>
                    <span class="care-value">${plant.sunlight.substring(0, 25)}</span>
                </div>
                <div class="care-item">
                    <span class="care-label">💧 നീരാൾ</span>
                    <span class="care-value">${plant.watering.substring(0, 25)}</span>
                </div>
                <div class="care-item">
                    <span class="care-label">🌡️ കാലാവസ്ഥ</span>
                    <span class="care-value">${plant.climate.substring(0, 25)}</span>
                </div>
                <div class="care-item">
                    <span class="care-label">🥔 വളം</span>
                    <span class="care-value">${plant.soil.substring(0, 25)}</span>
                </div>
            </div>

            <div class="plant-footer">
                <span class="harvest-time">⏱️ ${plant.harvestTime}</span>
                <button class="read-more" onclick="openModal('${plant.id}')">വായിക്കുക</button>
            </div>
        </div>
    `;

    return card;
}

// ── MODAL ─────────────────────────────────────────────────────
function openModal(plantId) {
    const plant = plantsData.find(p => p.id === plantId);
    if (!plant) return;

    const cat      = categoriesData.find(c => c.id === plant.category);
    const catEmoji = cat ? cat.emoji : '🌿';

    // All photos
    const imagesHTML = (plant.images && plant.images.length > 0)
        ? `<div class="modal-images">
            ${plant.images.map(img =>
                `<img src="${img}" alt="${plant.name}" class="modal-image" loading="lazy">`
            ).join('')}
           </div>`
        : '';

    // ── VIDEO BLOCK ───────────────────────────────────────────
    // Add a YouTube link OR a local .mp4 path to the "video"
    // field in plants-data.json and it will appear here.
    // Leave "video": "" or omit it to show the placeholder.
    let videoHTML = '';
    if (plant.video && plant.video.trim() !== '') {
        const isYouTube = plant.video.includes('youtube.com') || plant.video.includes('youtu.be');
        if (isYouTube) {
            const embedUrl = plant.video
                .replace('watch?v=', 'embed/')
                .replace('youtu.be/', 'www.youtube.com/embed/');
            videoHTML = `
                <div class="modal-section">
                    <h3 class="modal-section-title">🎬 വീഡിയോ</h3>
                    <div class="modal-video-wrap">
                        <iframe
                            src="${embedUrl}"
                            title="${plant.name} video"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                </div>`;
        } else {
            // Local / direct video file
            videoHTML = `
                <div class="modal-section">
                    <h3 class="modal-section-title">🎬 വീഡിയോ</h3>
                    <div class="modal-video-wrap">
                        <video controls preload="none" style="width:100%;border-radius:8px;">
                            <source src="${plant.video}" type="video/mp4">
                            നിങ്ങളുടെ ബ്രൗസർ വീഡിയോ പിന്തുണയ്ക്കുന്നില്ല.
                        </video>
                    </div>
                </div>`;
        }
    } else {
        // Placeholder shown until you add a real video URL
        videoHTML = `
            <div class="modal-section">
                <h3 class="modal-section-title">🎬 വീഡിയോ</h3>
                <div class="modal-video-placeholder">
                    <span class="modal-video-placeholder-icon">▶</span>
                    <p>വീഡിയോ ഉടൻ വരും</p>
                    <small>plants-data.json ൽ "video": "your-url" ചേർക്കുക</small>
                </div>
            </div>`;
    }
    // ─────────────────────────────────────────────────────────

    const modal     = document.getElementById('plant-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>

        <div class="modal-header">
            <span style="font-size:1.8rem;">${catEmoji}</span>
            <div>
                <h2 class="modal-title">${plant.name}</h2>
                <p class="modal-scientific">${plant.scientificName}</p>
            </div>
        </div>

        ${imagesHTML}

        <div class="modal-section">
            <h3 class="modal-section-title">📖 വിവരണം</h3>
            <p class="modal-section-content">${plant.description}</p>
        </div>

        <div class="modal-care-grid">
            <div class="modal-section">
                <h3 class="modal-section-title">☀️ സൂര്യപ്രകാശം</h3>
                <p class="modal-section-content">${plant.sunlight}</p>
            </div>
            <div class="modal-section">
                <h3 class="modal-section-title">💧 നീരാൾ</h3>
                <p class="modal-section-content">${plant.watering}</p>
            </div>
            <div class="modal-section">
                <h3 class="modal-section-title">🌡️ കാലാവസ്ഥ</h3>
                <p class="modal-section-content">${plant.climate}</p>
            </div>
            <div class="modal-section">
                <h3 class="modal-section-title">🥔 വളം</h3>
                <p class="modal-section-content">${plant.soil}</p>
            </div>
        </div>

        <div class="modal-section">
            <h3 class="modal-section-title">⏱️ വളർച്ചി സമയം</h3>
            <p class="modal-section-content">${plant.harvestTime}</p>
        </div>

        ${videoHTML}
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('plant-modal').classList.remove('active');
    document.body.style.overflow = '';
}

// Close on backdrop click
document.addEventListener('click', (e) => {
    if (e.target === document.getElementById('plant-modal')) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});
