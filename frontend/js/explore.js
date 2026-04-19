import api from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById('templatesContainer');
    const titleEl = document.getElementById('exploreTitle');
    const countEl = document.getElementById('exploreCount');
    const sortSelect = document.getElementById('sortSelect');

    // Read URL params on load
    const urlParams = new URLSearchParams(window.location.search);
    const initCategory = urlParams.get('category') || 'All';
    const initSearch = urlParams.get('search') || '';

    // Set active category from URL
    if (initCategory !== 'All') {
        document.querySelectorAll('.cat-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-cat') === initCategory);
        });
    }

    const loadTemplates = async (category = 'All', sort = 'newest', search = '') => {
        container.innerHTML = `
            <div class="skeleton" style="aspect-ratio:4/3; border-radius:16px;"></div>
            <div class="skeleton" style="aspect-ratio:4/3; border-radius:16px;"></div>
            <div class="skeleton" style="aspect-ratio:4/3; border-radius:16px;"></div>
            <div class="skeleton" style="aspect-ratio:4/3; border-radius:16px;"></div>
        `;

        try {
            const params = {};
            if (category && category !== 'All') params.category = category;
            if (sort) params.sort = sort;
            if (search) params.search = search;

            const templates = await api.getTemplates(params);

            if (titleEl) titleEl.innerText = category === 'All' ? 'All Templates' : category;
            if (countEl) countEl.innerText = `${templates.length} template${templates.length !== 1 ? 's' : ''} found`;

                    container.innerHTML = '';
            if (templates.length === 0) {
                container.style.display = 'block';
                container.innerHTML = `
                    <div style="text-align:center; padding: 80px 24px; grid-column:1/-1;">
                        <i class="ph ph-magnifying-glass" style="font-size:3rem; color:var(--brand-gray-300); display:block; margin-bottom:16px;"></i>
                        <h3 style="font-size:1.1rem; font-weight:700; color:var(--brand-gray-700); margin-bottom:8px;">No templates found</h3>
                        <p style="color:var(--brand-gray-500); font-size:0.875rem;">Try a different category or search term</p>
                    </div>
                `;
                return;
            }

            container.style.display = '';
            const PAGE_SIZE = 8;
            let shown = 0;

            const renderBatch = () => {
                const batch = templates.slice(shown, shown + PAGE_SIZE);
                let delay = shown * 0.03;
                batch.forEach(t => {
                    const cardHtml = window.createTemplateCard(t, delay);
                    const div = document.createElement('div');
                    div.innerHTML = cardHtml.trim();
                    container.appendChild(div.firstChild);
                    delay += 0.04;
                });
                shown += batch.length;

                // Load more button
                let loadMoreBtn = document.getElementById('loadMoreBtn');
                if (shown < templates.length) {
                    if (!loadMoreBtn) {
                        loadMoreBtn = document.createElement('div');
                        loadMoreBtn.id = 'loadMoreBtn';
                        loadMoreBtn.style.cssText = 'grid-column:1/-1; text-align:center; padding:24px 0 8px;';
                        loadMoreBtn.innerHTML = `<button onclick="window._loadMore()" style="padding:12px 36px; border:2px solid var(--brand-gray-200); background:white; border-radius:999px; font-size:0.9rem; font-weight:700; color:var(--brand-gray-700); cursor:pointer; font-family:Inter,sans-serif; transition:all 0.15s;" onmouseover="this.style.borderColor='var(--brand-purple)';this.style.color='var(--brand-purple)'" onmouseout="this.style.borderColor='var(--brand-gray-200)';this.style.color='var(--brand-gray-700)'"><i class="ph-bold ph-arrow-down"></i> Load More (${templates.length - shown} remaining)</button>`;
                        container.appendChild(loadMoreBtn);
                    } else {
                        loadMoreBtn.querySelector('button').textContent = `Load More (${templates.length - shown} remaining)`;
                    }
                } else if (loadMoreBtn) {
                    loadMoreBtn.remove();
                }
            };

            window._loadMore = renderBatch;
            renderBatch();

        } catch (error) {
            console.error('Failed to load templates:', error);
            container.innerHTML = `
                <div style="text-align:center; padding: 80px 24px; grid-column:1/-1;">
                    <i class="ph ph-warning-circle" style="font-size:3rem; color:var(--brand-pink); display:block; margin-bottom:16px;"></i>
                    <h3 style="font-size:1.1rem; font-weight:700; color:var(--brand-gray-700);">Failed to load templates</h3>
                    <p style="color:var(--brand-gray-500); font-size:0.875rem; margin-top:8px;">Make sure the backend server is running on port 5000</p>
                </div>
            `;
        }
    };

    // Category buttons
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-cat');
            // update URL without reload
            const url = new URL(window.location.href);
            if (cat === 'All') url.searchParams.delete('category');
            else url.searchParams.set('category', cat);
            window.history.replaceState({}, '', url);
            loadTemplates(cat, sortSelect?.value || 'newest', initSearch);
        });
    });

    // Sort dropdown
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const activeCat = document.querySelector('.cat-btn.active')?.getAttribute('data-cat') || 'All';
            loadTemplates(activeCat, sortSelect.value, initSearch);
        });
    }

    // Initial load
    loadTemplates(initCategory, 'newest', initSearch);
});
