function refreshPreviewPanel() {
  fetch('/api/publish')
    .then(res => {
      if (res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      } else {
        // If not JSON, return empty object to avoid error
        return {};
      }
    })
    .then(data => {
      const previewPanel = document.getElementById('previewPanel') || document.getElementById('preview');
      if (!previewPanel) return;
      if (data.photo && data.name) {
        previewPanel.innerHTML = `
          <div style='display:flex;flex-direction:column;align-items:center;width:100%'>
            <img src='${data.photo}' class='preview-img' alt='Photo'/>
            <div class='preview-name' style='margin-top:16px;'>${data.name}</div>
          </div>
        `;
        previewPanel.style.display = 'flex';
      } else {
        previewPanel.innerHTML = '';
        previewPanel.style.display = 'none';
      }
    })
    .catch(() => {
      // On error, hide preview
      const previewPanel = document.getElementById('previewPanel') || document.getElementById('preview');
      if (previewPanel) {
        previewPanel.innerHTML = '';
        previewPanel.style.display = 'none';
      }
    });
}

window.addEventListener('DOMContentLoaded', refreshPreviewPanel);
