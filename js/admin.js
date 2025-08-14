const form = document.getElementById('publishForm')
const photoInput = document.getElementById('photo')
const nameInput = document.getElementById('name')

// Show selected file name in frame
if (photoInput) {
  photoInput.addEventListener('change', function () {
    const label = document.getElementById('fileUploadLabel');
    if (photoInput.files.length > 0) {
      label.textContent = photoInput.files[0].name;
    } else {
      label.textContent = 'Choose photo';
    }
  })
}

function refreshPreviewPanel() {
  fetch('/api/publish')
    .then(res => {
      if (res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      } else {
        return {};
      }
    })
    .then(data => {
      const previewPanel = document.getElementById('previewPanel');
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
      const previewPanel = document.getElementById('previewPanel');
      if (previewPanel) {
        previewPanel.innerHTML = '';
        previewPanel.style.display = 'none';
      }
    });
}

window.addEventListener('DOMContentLoaded', refreshPreviewPanel)

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!photoInput || !photoInput.files.length || !nameInput.value.trim()) {
      alert('Please select a photo and enter a name.');
      return;
    }
    const file = photoInput.files[0];
    const reader = new FileReader();
    reader.onload = function (evt) {
      const imgSrc = evt.target.result;
      const name = nameInput.value;
      fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: imgSrc, name })
      })
      .then(res => {
        if (res.headers.get('content-type')?.includes('application/json')) {
          return res.json();
        } else {
          return {};
        }
      })
      .then(() => {
        refreshPreviewPanel();
        renderNewOneButton(true);
      })
      .catch(() => {
        // Optionally show error to user
      });
    };
    reader.readAsDataURL(file);
  })
}

function renderNewOneButton(force) {
  const buttonRow = document.querySelector('.button-row');
  let btn = document.getElementById('newOneBtn');
  const publishBtn = document.querySelector('.publish-btn');
  if (!btn && buttonRow) {
    btn = document.createElement('button');
    btn.id = 'newOneBtn';
    btn.textContent = 'New one';
    btn.type = 'button';
    btn.className = 'publish-btn'; // Use same class for consistent styling
    btn.style.background = '#e74c3c';
    btn.style.color = '#fff';
    btn.onclick = function() { location.reload(); };
    buttonRow.appendChild(btn);
    if (publishBtn) publishBtn.textContent = 'Publish again';
  } else if (force && btn) {
    btn.style.display = 'block';
    if (publishBtn) publishBtn.textContent = 'Publish again';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  refreshPreviewPanel();
  // Do not show New one button on load
});

document.querySelectorAll('.lie-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const lie = parseInt(this.getAttribute('data-lie'));
    fetch('/api/lie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lie })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('lieMessage').textContent = `Story ${lie} marked as the lie!`;
      } else {
        document.getElementById('lieMessage').textContent = 'Error setting the lie.';
      }
    })
    .catch(() => {
      document.getElementById('lieMessage').textContent = 'Error setting the lie.';
    });
  });
});

// Auto-reset townhall if accessed on a new day
fetch('/api/publish-date')
  .then(res => res.json())
  .then(data => {
    const lastDate = data.date;
    const today = new Date().toISOString().slice(0, 10);
    if (lastDate && lastDate !== today) {
      fetch('/api/reset-townhall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
