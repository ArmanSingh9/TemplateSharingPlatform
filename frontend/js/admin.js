import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem('user')); } catch(e) {}
    const token = localStorage.getItem('token');

    const authGate = document.getElementById('authGate');
    const dashContent = document.getElementById('dashboardContent');

    if (!user || !token) {
        if (authGate) authGate.style.display = 'block';
        return;
    }

    if (dashContent) dashContent.style.display = 'block';

    // Populate user info
    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = user.name || 'User';
    if (emailEl) emailEl.textContent = user.email || '';
    if (avatarEl) avatarEl.textContent = (user.name || 'U').substring(0, 2).toUpperCase();

    // Load my templates
    try {
        const templates = await api.getMyTemplates();

        const statTemplates = document.getElementById('statTemplates');
        const statDownloads = document.getElementById('statDownloads');
        const statRating = document.getElementById('statRating');

        const totalDownloads = templates.reduce((sum, t) => sum + (t.downloads || 0), 0);
        const ratings = templates.filter(t => t.averageRating > 0);
        const avgRating = ratings.length > 0
            ? (ratings.reduce((sum, t) => sum + t.averageRating, 0) / ratings.length).toFixed(1)
            : '—';

        if (statTemplates) statTemplates.textContent = templates.length;
        if (statDownloads) statDownloads.textContent = totalDownloads.toLocaleString();
        if (statRating) statRating.innerHTML = ratings.length > 0
            ? `<span style="color:var(--brand-yellow)">${avgRating}</span>`
            : '—';

        // Render template list
        const container = document.getElementById('myTemplatesContainer');
        if (!container) return;

        if (templates.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 48px 24px;">
                    <i class="ph ph-cloud-arrow-up" style="font-size:3rem; color:var(--brand-gray-300); display:block; margin-bottom:12px;"></i>
                    <h3 style="font-size:1rem; font-weight:700; color:var(--brand-gray-700); margin-bottom:8px;">No templates yet</h3>
                    <p style="color:var(--brand-gray-500); font-size:0.875rem; margin-bottom:20px;">Share your first template with the community!</p>
                    <a href="/upload.html" class="btn-primary" style="font-size:0.85rem; padding:10px 24px;">Upload Template</a>
                </div>
            `;
            return;
        }

        const catBgMap = {
            'presentations': 'bg-pres', 'documents': 'bg-docs',
            'spreadsheets': 'bg-spread', 'code': 'bg-code', 'design': 'bg-design'
        };

        container.innerHTML = templates.map(t => {
            const cat = (t.category || '').toLowerCase();
            const bgClass = catBgMap[cat] || 'bg-other';
            const thumb = t.previewImage
                ? `<img src="${t.previewImage}" alt="${t.title}">`
                : `<div class="${bgClass}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:8px;"><i class="ph-bold ph-file-text" style="color:rgba(255,255,255,0.8);font-size:1.2rem;"></i></div>`;

            return `
                <div class="my-template-row">
                    <div class="tmpl-thumb">${thumb}</div>
                    <div class="tmpl-info">
                        <div class="tmpl-title">${t.title}</div>
                        <div class="tmpl-meta">${t.category} &bull; Uploaded ${new Date(t.createdAt).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</div>
                    </div>
                    <div class="tmpl-stat"><i class="ph-bold ph-cloud-arrow-down"></i> ${t.downloads || 0}</div>
                    <div class="tmpl-stat" style="color:var(--brand-yellow)"><i class="ph-fill ph-star"></i> ${t.averageRating ? t.averageRating.toFixed(1) : '—'}</div>
                    <a href="/detail.html?id=${t._id}" class="delete-btn" style="color:var(--brand-purple); border-color:rgba(139,92,246,0.3);" title="View">
                        <i class="ph-bold ph-arrow-square-out"></i>
                    </a>
                    <button class="delete-btn" onclick="deleteTemplate('${t._id}', this)" title="Delete">
                        <i class="ph-bold ph-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Admin error:', err);
        const container = document.getElementById('myTemplatesContainer');
        if (container) container.innerHTML = `<p style="color:var(--brand-pink); font-weight:600; padding:20px;">Failed to load templates. Make sure the backend is running.</p>`;
    }
});

window.deleteTemplate = async (id, btn) => {
    if (!confirm('Are you sure you want to delete this template? This cannot be undone.')) return;
    try {
        btn.disabled = true;
        btn.innerHTML = '<div style="width:14px;height:14px;border:2px solid rgba(236,72,153,0.3);border-top-color:var(--brand-pink);border-radius:50%;animation:spin 0.7s linear infinite;"></div>';
        await api.deleteTemplate(id);
        btn.closest('.my-template-row').remove();
        window.showToast('Template deleted', 'success');
    } catch(err) {
        window.showToast(err.message || 'Delete failed', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="ph-bold ph-trash"></i>';
    }
};
