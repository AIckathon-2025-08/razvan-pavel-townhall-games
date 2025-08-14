let pieChart;
let lastCandidate = null;
let confettiShown = false;
function showLieReveal(lie) {
  // Hide everything and show big green text with confetti
  const container = document.querySelector('.results-container');
  if (container) {
    container.innerHTML = `<div class='lie-reveal-message'>Story #${lie} was a lie!</div>`;
    setTimeout(() => {
      const msg = document.querySelector('.lie-reveal-message');
      if (msg && !confettiShown) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.innerHTML = '🎉✨🎊';
        confetti.style.position = 'absolute';
        confetti.style.left = '50%';
        confetti.style.top = '0';
        confetti.style.transform = 'translateX(-50%)';
        confetti.style.fontSize = '4rem';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '10';
        msg.style.position = 'relative';
        msg.appendChild(confetti);
        confettiShown = true;
        setTimeout(() => { confetti.remove(); }, 1800);
      }
    }, 100);
  }
}
function fetchResultsAndLie() {
  Promise.all([
    fetch('/api/results').then(res => res.json()),
    fetch('/api/lie').then(res => res.json())
  ]).then(([votes, lieData]) => {
    let data = [votes[1] || 0, votes[2] || 0, votes[3] || 0];
    let percent = [0, 0, 0];
    let total = data.reduce((a, b) => a + b, 0);
    let lie = lieData.lie;
    if (lie) {
      showLieReveal(lie);
      return;
    }
    percent = data.map(v => total ? Math.round((v / total) * 100) : 0);
    renderPieChart({ data, percent, total });
  });
}
function renderPieChart({ data, percent, total }) {
  const ctx = document.getElementById('resultsPieChart').getContext('2d');
  if (!pieChart) {
    pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Story 1', 'Story 2', 'Story 3'],
        datasets: [{
          data,
          backgroundColor: ['#7954FF', '#77eac1', '#f8f3e8'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            color: '#333',
            font: { weight: 'bold', size: 22 },
            formatter: (value, ctx) => {
              const idx = ctx.dataIndex;
              return `Story #${idx+1}\n${value} votes\n${percent[idx]}%`;
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  } else {
    pieChart.data.datasets[0].data = data;
    pieChart.options.plugins.datalabels.formatter = (value, ctx) => {
      const idx = ctx.dataIndex;
      return `Story #${idx+1}\n${value} votes\n${percent[idx]}%`;
    };
    pieChart.update();
  }
  // Show details below chart
  const details = [
    `<b>Story 1:</b> ${data[0]} votes (${percent[0]}%)`,
    `<b>Story 2:</b> ${data[1]} votes (${percent[1]}%)`,
    `<b>Story 3:</b> ${data[2]} votes (${percent[2]}%)`,
    `<b>Total votes:</b> ${total}`
  ];
  document.getElementById('resultsDetails').innerHTML = details.join('<br>');
}
function pollCandidateResetResults() {
  fetch('/api/publish')
    .then(res => res.json())
    .then(data => {
      const candidateKey = `${data.photo || ''}|${data.name || ''}`;
      if (lastCandidate === null) {
        lastCandidate = candidateKey;
        return;
      }
      if (candidateKey !== lastCandidate) {
        lastCandidate = candidateKey;
        // Restore results container UI
        const container = document.querySelector('.results-container');
        if (container) {
          container.innerHTML = `
            <div class="results-title">Live Voting Results</div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <canvas id="resultsPieChart" width="600" height="600" style="margin-bottom: 32px;"></canvas>
              <div id="resultsDetails" style="width: 100%; max-width: 400px;"></div>
            </div>
          `;
        }
        // Reset pie chart and details
        pieChart = null;
        renderPieChart({ data: [0,0,0], percent: [0,0,0], total: 0 });
      }
    });
}
fetchResultsAndLie();
setInterval(fetchResultsAndLie, 1500);
setInterval(pollCandidateResetResults, 2000);
