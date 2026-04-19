import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('homeGrid');
    if (!grid) return;

    window.loadHomeTemplates = async (category = null) => {
        grid.innerHTML = `
            <div class="skeleton" style="aspect-ratio:4/3; border-radius:16px;"></div>
            <div class="skeleton" style="aspect-ratio:4/3; border-radius:16px;"></div>
            <div class="skeleton" style="aspect-ratio:4/3; border-radius:16px;"></div>
            <div class="skeleton" style="aspect-ratio:4/3; border-radius:16px;"></div>
        `;

        try {
            const params = { limit: 8 };
            if (category) params.category = category;
            const templates = await api.getTemplates(params);

            if (templates.length === 0) {
                grid.style.display = 'block';
                grid.innerHTML = `<div style="text-align:center; padding:60px 24px; grid-column:1/-1;">
                    <i class="ph ph-cloud-arrow-up" style="font-size:3rem; color:var(--brand-gray-300); display:block; margin-bottom:16px;"></i>
                    <h3 style="font-size:1.1rem; font-weight:700; color:var(--brand-gray-700); margin-bottom:8px;">No templates yet</h3>
                    <p style="color:var(--brand-gray-500); font-size:0.875rem; margin-bottom:24px;">Be the first to share a template with the community!</p>
                    <a href="/upload.html" style="display:inline-flex; align-items:center; gap:8px; padding:10px 24px; background:var(--brand-dark); color:white; border-radius:8px; font-weight:700; font-size:0.875rem;">
                      <i class="ph-bold ph-upload-simple"></i> Upload Template
                    </a>
                </div>`;
                return;
            }

            grid.style.display = '';
            grid.innerHTML = templates.map((t, i) => window.createTemplateCard(t, i * 0.06)).join('');
        } catch (err) {
            console.error('Error loading home templates:', err);
            grid.innerHTML = `<div style="text-align:center; padding:60px; grid-column:1/-1; color:var(--brand-pink); font-weight:600;">
                Failed to load templates. Is the backend running?
            </div>`;
        }
    };

    window.loadHomeTemplates();
});
