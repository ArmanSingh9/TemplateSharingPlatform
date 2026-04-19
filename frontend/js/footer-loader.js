/**
 * footer-loader.js
 * Fetches /footer.html and injects it as the last element in <body>
 * before </body> on every page that includes this script.
 */
(function loadFooter() {
    fetch('/footer.html')
        .then(res => res.text())
        .then(html => {
            // Create a temporary container to parse the HTML
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Append all children (footer element + scripts) to the body
            Array.from(temp.childNodes).forEach(node => {
                document.body.appendChild(node.cloneNode(true));
            });

            // Re-execute any <script> tags that were inside the footer HTML
            // (fetched HTML scripts don't auto-execute)
            document.querySelectorAll('#site-footer-el ~ script, #site-footer-el script').forEach(oldScript => {
                const newScript = document.createElement('script');
                newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
            });

            // Set the year
            const yearEl = document.getElementById('footerYear');
            if (yearEl) yearEl.textContent = new Date().getFullYear();

            // Newsletter
            window.subscribeNewsletter = function() {
                const input = document.getElementById('footerEmailInput');
                if (!input) return;
                const email = input.value.trim();
                if (!email || !email.includes('@')) {
                    if (window.showToast) window.showToast('Please enter a valid email', 'error');
                    return;
                }
                input.value = '';
                if (window.showToast) window.showToast("🎉 You're subscribed! Weekly picks coming soon.", 'success');
            };

            const footerInput = document.getElementById('footerEmailInput');
            if (footerInput) {
                footerInput.addEventListener('keydown', e => {
                    if (e.key === 'Enter') window.subscribeNewsletter();
                });
            }

        })
        .catch(err => console.warn('Footer could not be loaded:', err));
})();
