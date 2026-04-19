// ═══════════════════════════
//  GLOBAL UTILITIES
// ═══════════════════════════

// Toast notification system
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'ph-bold ph-check-circle' : 'ph-bold ph-warning-circle';
    toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
    }, 3500);
};

// ═══════════════════════════
//  AUTH STATE MANAGEMENT
// ═══════════════════════════
window.checkAuth = () => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem('user')); } catch(e) {}
    const token = localStorage.getItem('token');

    const navLinks = document.getElementById('navLinks');
    const loginBtn = document.getElementById('loginNavBtn');
    const signupBtn = document.getElementById('signupNavBtn');

    // Remove previous dynamic logout
    const old = navLinks && navLinks.querySelector('.logout-btn');
    if (old) old.remove();

    if (user && token) {
        // Update profile link
        const profileLink = navLinks && navLinks.querySelector('#profileNavLink');
        if (profileLink) {
            profileLink.href = '/admin.html';
            profileLink.innerHTML = `<i class="ph ph-user-circle"></i> ${user.name ? user.name.split(' ')[0] : 'Profile'}`;
        }

        // Replace sign in/up buttons with sign out
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) {
            signupBtn.style.display = 'none';
        }

        // Add logout button
        if (navLinks) {
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'btn-nav-ghost logout-btn';
            logoutBtn.innerHTML = '<i class="ph ph-sign-out"></i> Sign Out';
            logoutBtn.style.cursor = 'pointer';
            logoutBtn.style.color = 'var(--brand-pink)';
            logoutBtn.style.borderColor = 'rgba(236,72,153,0.3)';
            logoutBtn.onclick = window.logout;
            
            // Insert after navLinks
            const nav = navLinks.closest('.nav-inner') || navLinks.parentElement;
            const actions = nav.querySelector('.nav-actions');
            if (actions) actions.insertBefore(logoutBtn, actions.firstChild);
        }
    } else {
        // Profile link shows Login
        const profileLink = navLinks && navLinks.querySelector('#profileNavLink');
        if (profileLink) {
            profileLink.href = '/login.html';
            profileLink.innerHTML = `<i class="ph ph-sign-in"></i> Login`;
        }
        if (loginBtn) loginBtn.style.display = '';
        if (signupBtn) signupBtn.style.display = '';
    }
};

window.logout = function() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.showToast('Signed out successfully');
    setTimeout(() => window.location.href = '/index.html', 800);
};

// ═══════════════════════════
//  TEMPLATE CARD GENERATOR
//  (Dribbble-style)
// ═══════════════════════════
window.createTemplateCard = function(template, delay = 0) {
    const bgMap = {
        'presentations': 'bg-pres',
        'documents': 'bg-docs',
        'spreadsheets': 'bg-spread',
        'code': 'bg-code',
        'design': 'bg-design',
    };

    const iconMap = {
        'presentations': 'ph-presentation-chart',
        'documents': 'ph-file-text',
        'spreadsheets': 'ph-table',
        'code': 'ph-code',
        'design': 'ph-palette',
    };

    const cat = (template.category || '').toLowerCase();
    const bgClass = bgMap[cat] || 'bg-other';
    const iconName = iconMap[cat] || 'ph-file';

    const creatorName = template.uploadedBy?.name || 'Anonymous';
    const initials = creatorName.substring(0, 2).toUpperCase();
    const ratingHtml = template.averageRating 
        ? `<span class="stat-item"><i class="ph-fill ph-star" style="color:var(--brand-yellow)"></i> ${template.averageRating.toFixed(1)}</span>` 
        : `<span class="stat-item" style="font-size:0.72rem; color:var(--brand-mint); font-weight:700;">NEW</span>`;

    const previewHtml = template.previewImage
        ? `<img src="${template.previewImage}" alt="${template.title}" loading="lazy">`
        : `<div class="card-preview-placeholder">
             <i class="ph-bold ${iconName}"></i>
             <span>${template.category || 'Template'}</span>
           </div>`;

    return `
        <a href="/detail.html?id=${template._id}" class="template-card fade-up" style="animation-delay:${delay}s">
          <div class="card-preview ${!template.previewImage ? bgClass : ''}">
            ${previewHtml}
            <div class="img-badge">${template.category || 'Template'}</div>
            <div class="card-overlay">
              <button class="card-overlay-btn primary">View Details</button>
            </div>
          </div>
          <div class="card-meta">
            <div style="min-width:0; flex:1;">
              <div class="card-title-text">${template.title}</div>
              <div class="card-creator" style="margin-top:5px;">
                <div class="creator-avatar">${initials}</div>
                <span class="creator-name">${creatorName}</span>
              </div>
            </div>
            <div class="card-stats">
              ${ratingHtml}
              <span class="stat-item">
                <i class="ph-bold ph-cloud-arrow-down"></i>
                ${template.downloads || 0}
              </span>
            </div>
          </div>
        </a>
    `;
};

// ═══════════════════════════
//  INIT
// ═══════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    window.checkAuth();
    initMobileMenu();
    initBackToTop();
    initCookieBanner();
    initPasswordToggles();
    initDarkMode();
});

// ═══════════════════════════
//  MOBILE HAMBURGER MENU
// ═══════════════════════════
function initMobileMenu() {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;

    const navInner = nav.querySelector('.nav-inner');
    if (!navInner) return;

    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.id = 'hamburgerBtn';
    hamburger.setAttribute('aria-label', 'Toggle menu');
    hamburger.innerHTML = '<i class="ph-bold ph-list" style="font-size:1.4rem;"></i>';
    hamburger.style.cssText = 'display:none; background:none; border:none; cursor:pointer; color:var(--brand-gray-700); padding:6px; line-height:1; margin-left:auto;';
    navInner.appendChild(hamburger);

    // Mobile menu drawer
    const drawer = document.createElement('div');
    drawer.id = 'mobileDrawer';
    drawer.style.cssText = `
        display: none;
        position: fixed;
        inset: 0;
        z-index: 9998;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(4px);
    `;

    const panel = document.createElement('div');
    panel.style.cssText = `
        position: absolute;
        top: 0; right: 0;
        width: min(320px, 85vw);
        height: 100%;
        background: white;
        box-shadow: -10px 0 40px rgba(0,0,0,0.1);
        padding: 24px;
        overflow-y: auto;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
    `;

    panel.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:28px;">
            <a href="/" style="display:flex; align-items:center; gap:8px; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:1.1rem; color:var(--brand-dark); text-decoration:none;">
                <div class="nav-logo-icon"><i class="ph-bold ph-squares-four"></i></div>
                TemplateHub
            </a>
            <button id="closeDrawer" style="background:none;border:none;cursor:pointer;font-size:1.4rem;color:var(--brand-gray-500);padding:4px;">
                <i class="ph-bold ph-x"></i>
            </button>
        </div>
        <nav style="display:flex; flex-direction:column; gap:4px; margin-bottom:24px;">
            <a href="/" style="padding:12px 14px; border-radius:8px; font-weight:600; font-size:0.95rem; color:var(--brand-gray-700); display:flex; align-items:center; gap:10px;" onmouseover="this.style.background='var(--brand-gray-100)'" onmouseout="this.style.background='none'"><i class="ph ph-house" style="font-size:1.1rem;"></i> Home</a>
            <a href="/explore.html" style="padding:12px 14px; border-radius:8px; font-weight:600; font-size:0.95rem; color:var(--brand-gray-700); display:flex; align-items:center; gap:10px;" onmouseover="this.style.background='var(--brand-gray-100)'" onmouseout="this.style.background='none'"><i class="ph ph-compass" style="font-size:1.1rem;"></i> Explore</a>
            <a href="/upload.html" style="padding:12px 14px; border-radius:8px; font-weight:600; font-size:0.95rem; color:var(--brand-gray-700); display:flex; align-items:center; gap:10px;" onmouseover="this.style.background='var(--brand-gray-100)'" onmouseout="this.style.background='none'"><i class="ph ph-upload-simple" style="font-size:1.1rem;"></i> Upload</a>
            <a href="/about.html" style="padding:12px 14px; border-radius:8px; font-weight:600; font-size:0.95rem; color:var(--brand-gray-700); display:flex; align-items:center; gap:10px;" onmouseover="this.style.background='var(--brand-gray-100)'" onmouseout="this.style.background='none'"><i class="ph ph-info" style="font-size:1.1rem;"></i> About</a>
            <a href="/feedback.html" style="padding:12px 14px; border-radius:8px; font-weight:600; font-size:0.95rem; color:var(--brand-gray-700); display:flex; align-items:center; gap:10px;" onmouseover="this.style.background='var(--brand-gray-100)'" onmouseout="this.style.background='none'"><i class="ph ph-chat-centered-text" style="font-size:1.1rem;"></i> Feedback</a>
            <a href="/admin.html" style="padding:12px 14px; border-radius:8px; font-weight:600; font-size:0.95rem; color:var(--brand-gray-700); display:flex; align-items:center; gap:10px;" onmouseover="this.style.background='var(--brand-gray-100)'" onmouseout="this.style.background='none'"><i class="ph ph-user-circle" style="font-size:1.1rem;"></i> Profile</a>
        </nav>
        <div style="display:flex; flex-direction:column; gap:10px; padding-top:24px; border-top:1px solid var(--brand-gray-100);">
            <a href="/register.html" style="text-align:center; padding:12px; background:var(--brand-dark); color:white; border-radius:8px; font-weight:700; font-size:0.9rem;">Sign Up Free</a>
            <a href="/login.html" style="text-align:center; padding:12px; background:var(--brand-gray-100); color:var(--brand-gray-700); border-radius:8px; font-weight:700; font-size:0.9rem;">Sign In</a>
        </div>
    `;

    drawer.appendChild(panel);
    document.body.appendChild(drawer);

    const openDrawer = () => {
        drawer.style.display = 'block';
        requestAnimationFrame(() => { panel.style.transform = 'translateX(0)'; });
        document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
        panel.style.transform = 'translateX(100%)';
        setTimeout(() => { drawer.style.display = 'none'; }, 300);
        document.body.style.overflow = '';
    };

    hamburger.onclick = openDrawer;
    drawer.addEventListener('click', e => { if (e.target === drawer) closeDrawer(); });
    panel.querySelector('#closeDrawer').onclick = closeDrawer;

    // Show hamburger on mobile
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        @media (max-width: 768px) {
            #hamburgerBtn { display: block !important; }
            .nav-links { display: none !important; }
            .nav-actions { display: none !important; }
            .nav-search { display: none !important; }
        }
    `;
    document.head.appendChild(styleTag);
}

// ═══════════════════════════
//  BACK TO TOP BUTTON
// ═══════════════════════════
function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'backToTopBtn';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="ph-bold ph-arrow-up"></i>';
    btn.style.cssText = `
        position: fixed;
        bottom: 28px;
        right: 28px;
        width: 44px;
        height: 44px;
        background: var(--brand-dark);
        color: white;
        border: none;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        cursor: pointer;
        z-index: 9997;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        transition: all 0.2s;
    `;
    btn.onmouseover = () => { btn.style.background = 'var(--brand-purple)'; btn.style.transform = 'translateY(-3px)'; };
    btn.onmouseout = () => { btn.style.background = 'var(--brand-dark)'; btn.style.transform = ''; };
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }, { passive: true });
}

// ═══════════════════════════
//  COOKIE CONSENT BANNER
// ═══════════════════════════
function initCookieBanner() {
    if (localStorage.getItem('cookiesAccepted')) return;

    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--brand-gray-900);
        color: rgba(255,255,255,0.9);
        padding: 16px 24px;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        border-top: 1px solid rgba(255,255,255,0.08);
        font-family: 'Inter', sans-serif;
        animation: slideUpIn 0.4s ease forwards;
    `;
    banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
            <span style="font-size:1.3rem;">🍪</span>
            <p style="font-size:0.82rem; font-weight:500; line-height:1.5; color:rgba(255,255,255,0.75); margin:0;">
                We use cookies to improve your experience and analyze usage. By continuing, you agree to our 
                <a href="/privacy.html" style="color:var(--brand-purple); font-weight:700;">Privacy Policy</a>.
            </p>
        </div>
        <div style="display:flex; gap:10px; flex-shrink:0;">
            <button id="cookieDecline" style="padding:8px 16px; background:transparent; color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.15); border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:600; font-family:inherit;">Decline</button>
            <button id="cookieAccept" style="padding:8px 18px; background:var(--brand-purple); color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:700; font-family:inherit;">Accept All</button>
        </div>
    `;
    document.body.appendChild(banner);

    const dismiss = (val) => {
        localStorage.setItem('cookiesAccepted', val);
        banner.style.transform = 'translateY(100%)';
        banner.style.transition = 'transform 0.3s ease';
        setTimeout(() => banner.remove(), 300);
    };

    document.getElementById('cookieAccept').onclick = () => dismiss('yes');
    document.getElementById('cookieDecline').onclick = () => dismiss('no');
}

// ═══════════════════════════
//  PASSWORD SHOW/HIDE TOGGLE
// ═══════════════════════════
function initPasswordToggles() {
    document.querySelectorAll('input[type="password"]').forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:relative; display:block;';

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        input.style.paddingRight = '44px';

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.innerHTML = '<i class="ph ph-eye"></i>';
        toggle.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: var(--brand-gray-500);
            font-size: 1.1rem;
            padding: 4px;
            line-height: 1;
            transition: color 0.15s;
        `;
        toggle.onmouseover = () => toggle.style.color = 'var(--brand-purple)';
        toggle.onmouseout = () => toggle.style.color = 'var(--brand-gray-500)';

        let visible = false;
        toggle.onclick = () => {
            visible = !visible;
            input.type = visible ? 'text' : 'password';
            toggle.innerHTML = visible ? '<i class="ph ph-eye-slash"></i>' : '<i class="ph ph-eye"></i>';
        };

        wrapper.appendChild(toggle);
    });
}

// ═══════════════════════════
//  DARK MODE TOGGLE
// ═══════════════════════════
function initDarkMode() {
    // Apply saved preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    const nav = document.querySelector('.nav-inner');
    if (!nav) return;

    const btn = document.createElement('button');
    btn.id = 'darkModeBtn';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark() ? '<i class="ph-bold ph-sun"></i>' : '<i class="ph-bold ph-moon"></i>';
    btn.style.cssText = `
        width: 34px;
        height: 34px;
        border: 1.5px solid var(--brand-gray-200, #E5E7EB);
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
        color: var(--brand-gray-600, #4B5563);
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        flex-shrink: 0;
    `;

    btn.onclick = () => {
        const dark = isDark();
        document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
        localStorage.setItem('darkMode', !dark);
        btn.innerHTML = !dark ? '<i class="ph-bold ph-sun"></i>' : '<i class="ph-bold ph-moon"></i>';
    };

    const actions = nav.querySelector('.nav-actions');
    if (actions) actions.insertBefore(btn, actions.firstChild);
}
