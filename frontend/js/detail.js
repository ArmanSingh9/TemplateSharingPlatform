import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('detailContainer');
    const breadcrumb = document.getElementById('breadcrumbTitle');
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('id');

    if (!templateId) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:80px;">
            <h2 style="font-size:1.5rem; font-weight:800;">Template not found</h2>
            <a href="/explore.html" style="color:var(--brand-purple); font-weight:600; margin-top:12px; display:inline-block;">← Back to Explore</a>
        </div>`;
        return;
    }

    try {
        const template = await api.getTemplateById(templateId);

        document.title = `${template.title} | TemplateHub`;
        if (breadcrumb) breadcrumb.textContent = template.title;

        const catBgMap = {
            'presentations': 'bg-pres', 'documents': 'bg-docs',
            'spreadsheets': 'bg-spread', 'code': 'bg-code',
            'design': 'bg-design'
        };
        const iconMap = {
            'Presentations': 'ph-presentation-chart', 'Documents': 'ph-file-text',
            'Spreadsheets': 'ph-table', 'Code': 'ph-code', 'Design': 'ph-palette'
        };

        const cat = (template.category || '').toLowerCase();
        const bgClass = catBgMap[cat] || 'bg-other';
        const icon = iconMap[template.category] || 'ph-file';
        const creatorName = template.uploadedBy?.name || 'Anonymous';

        const previewContent = template.previewImage
            ? `<img src="${template.previewImage}" alt="${template.title}" style="width:100%;height:100%;object-fit:cover;">`
            : `<div class="card-preview-placeholder ${bgClass}" style="width:100%;height:100%;">
                 <i class="ph-bold ${icon}" style="font-size:5rem;"></i>
                 <span>${template.category}</span>
               </div>`;

        const currentRating = template.averageRating ? template.averageRating.toFixed(1) : '—';

        container.innerHTML = `
            <!-- LEFT: Preview -->
            <div>
                <div class="detail-preview">
                    ${previewContent}
                </div>

                <!-- Creator info below image -->
                <div style="display:flex; align-items:center; gap:12px; margin-top:20px; padding:16px; background:var(--brand-gray-50); border-radius:var(--radius-lg); border:1px solid rgba(0,0,0,0.06);">
                    <div class="creator-avatar" style="width:40px;height:40px;font-size:0.9rem;">
                        ${creatorName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-size:0.75rem; font-weight:700; color:var(--brand-gray-500); text-transform:uppercase; letter-spacing:0.5px;">Uploaded by</div>
                        <div style="font-size:0.95rem; font-weight:700; color:var(--brand-gray-900);">${creatorName}</div>
                    </div>
                </div>
            </div>

            <!-- RIGHT: Info -->
            <div class="detail-info fade-up" style="animation-delay:0.1s;">
                <span class="detail-category-badge ${bgClass}" style="color:white;">${template.category}</span>
                <h1>${template.title}</h1>
                <p class="desc">${template.description}</p>

                <div class="detail-stats">
                    <div class="detail-stat">
                        <span class="label">Downloads</span>
                        <span class="value">${template.downloads || 0}</span>
                    </div>
                    <div class="detail-stat">
                        <span class="label">Rating</span>
                        <span class="value" id="currentRatingVal" style="color:var(--brand-yellow);display:flex;align-items:center;gap:6px;">
                            <i class="ph-fill ph-star"></i> ${currentRating}
                        </span>
                    </div>
                    <div class="detail-stat">
                        <span class="label">Ratings Count</span>
                        <span class="value">${template.ratingsCount || 0}</span>
                    </div>
                </div>

                <!-- Interactive Stars -->
                <div style="margin-bottom:24px;">
                    <div style="font-size:0.75rem; font-weight:700; color:var(--brand-gray-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Rate this template</div>
                    <div class="star-rating" id="starContainer">
                        <i class="ph-fill ph-star star-btn" data-val="1"></i>
                        <i class="ph-fill ph-star star-btn" data-val="2"></i>
                        <i class="ph-fill ph-star star-btn" data-val="3"></i>
                        <i class="ph-fill ph-star star-btn" data-val="4"></i>
                        <i class="ph-fill ph-star star-btn" data-val="5"></i>
                    </div>
                </div>

                <!-- Actions -->
                <div class="detail-actions">
                    <button id="downloadBtn" class="btn-download btn-bouncy">
                        <i class="ph-bold ph-cloud-arrow-down"></i> Download Free
                    </button>
                    <button class="btn-share btn-bouncy" onclick="navigator.clipboard.writeText(window.location.href).then(()=>window.showToast('Link copied!','success'))">
                        <i class="ph-bold ph-share-network"></i> Share Template
                    </button>
                </div>
            </div>
        `;

        // Download handler
        document.getElementById('downloadBtn').onclick = () => {
            api.downloadTemplate(templateId);
            window.showToast('Download started!', 'success');
        };

        // Star rating logic
        const stars = document.querySelectorAll('.star-btn');
        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const val = parseInt(star.getAttribute('data-val'));
                stars.forEach(s => s.classList.toggle('filled', parseInt(s.getAttribute('data-val')) <= val));
            });
            star.addEventListener('mouseout', () => {
                stars.forEach(s => s.classList.remove('filled'));
            });
            star.onclick = async () => {
                const val = parseInt(star.getAttribute('data-val'));
                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-val')) <= val) {
                        s.style.color = 'var(--brand-yellow)';
                    } else {
                        s.style.color = '';
                    }
                });
                try {
                    const res = await api.rateTemplate(templateId, val);
                    document.getElementById('currentRatingVal').innerHTML = `<i class="ph-fill ph-star"></i> ${res.averageRating.toFixed(1)}`;
                    window.showToast('Thanks for rating!', 'success');
                } catch (err) {
                    window.showToast(err.message || 'Please login to rate', 'error');
                    if (err.message && (err.message.toLowerCase().includes('login') || err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('authorized'))) {
                        setTimeout(() => window.location.href = '/login.html', 1500);
                    }
                }
            };
        });

        // Load related templates
        try {
            const related = await api.getTemplates({ category: template.category });
            const filtered = related.filter(t => t._id !== templateId).slice(0, 4);
            if (filtered.length > 0) {
                const relatedSection = document.getElementById('relatedSection');
                const relatedGrid = document.getElementById('relatedGrid');
                if (relatedSection && relatedGrid) {
                    relatedSection.style.display = '';
                    relatedGrid.innerHTML = filtered.map((t, i) => window.createTemplateCard(t, i * 0.06)).join('');
                }
            }
        } catch (e) { /* ignore related error */ }

    } catch (err) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:80px;">
            <h2 style="font-size:1.5rem; font-weight:800; color:var(--brand-pink);">Failed to load</h2>
            <p style="color:var(--brand-gray-500); margin-top:10px;">${err.message}</p>
        </div>`;
    }
});
