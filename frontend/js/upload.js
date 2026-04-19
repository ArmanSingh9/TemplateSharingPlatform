import api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    if (!uploadForm) return;

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('templateFile');
    const fileTxt = document.getElementById('fileSelectedTxt');

    const imgDropZone = document.getElementById('imageDropZone');
    const imgInput = document.getElementById('imageFile');
    const imgTxt = document.getElementById('imgSelectedTxt');

    // Drag and Drop Logic core
    const setupDropZone = (dz, input, txtEle) => {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
            dz.addEventListener(evt, e => e.preventDefault());
        });

        dz.addEventListener('dragover', () => dz.classList.add('dragover'));
        dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
        dz.addEventListener('drop', (e) => {
            dz.classList.remove('dragover');
            if(e.dataTransfer.files.length) {
                input.files = e.dataTransfer.files;
                if(input.files.length) {
                    txtEle.innerText = "Selected: " + input.files[0].name;
                    txtEle.style.display = 'block';
                }
            }
        });

        dz.addEventListener('click', () => input.click());
        input.addEventListener('change', () => {
            if(input.files.length) {
                txtEle.innerText = "Selected: " + input.files[0].name;
                txtEle.style.display = 'block';
            }
        });
    };

    setupDropZone(dropZone, fileInput, fileTxt);
    setupDropZone(imgDropZone, imgInput, imgTxt);

    // Submission Logic
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ensure user is logged in
        if (!localStorage.getItem('token')) {
            window.showToast("Please login to upload templates", "error");
            setTimeout(() => window.location.href = '/login.html', 1500);
            return;
        }

        const btn = document.getElementById('submitBtn');
        const originalText = btn.innerText;
        btn.innerText = "Publishing...";
        btn.disabled = true;

        try {
            const formData = new FormData(uploadForm);
            
            const file = fileInput.files[0];
            const finalData = new FormData();
            finalData.append('file', file);
            
            if (imgInput.files.length > 0) {
                finalData.append('image', imgInput.files[0]);
            }
            
            finalData.append('title', formData.get('title'));
            finalData.append('category', formData.get('category'));
            finalData.append('description', formData.get('description'));

            await api.uploadTemplate(finalData);
            
            window.showToast("Template published successfully!", "success");
            setTimeout(() => window.location.href = 'explore.html', 1500);
        } catch (err) {
            window.showToast(err.message, "error");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
});
