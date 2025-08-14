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

function refreshResults() {
  fetch('/api/results')
    .then(res => res.json())
    .then(votes => {
      const results = document.getElementById('results');
      if (results) {
        results.innerHTML = '';
      }
    });
}

function throwConfetti(btn) {
  // Simple confetti effect using emoji
  const confetti = document.createElement('div');
  confetti.className = 'confetti';
  confetti.innerHTML = '🎉✨🎊';
  confetti.style.position = 'absolute';
  confetti.style.left = '50%';
  confetti.style.top = '0';
  confetti.style.transform = 'translateX(-50%)';
  confetti.style.fontSize = '2.5rem';
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = '10';
  btn.parentElement.style.position = 'relative';
  btn.parentElement.appendChild(confetti);
  setTimeout(() => {
    confetti.remove();
  }, 1200);
}

function showVoteMessage(story) {
  const voteButtons = document.querySelector('.vote-buttons');
  if (voteButtons) {
    voteButtons.innerHTML = `<div class='vote-message full-width' id='voteMessage'>🎉 You voted for story ${story}! Thank you for participating. 🎉</div>`;
    setTimeout(() => {
      const voteMessage = document.getElementById('voteMessage');
      if (voteMessage) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.innerHTML = '🎉✨🎊';
        confetti.style.position = 'absolute';
        confetti.style.left = '50%';
        confetti.style.top = '0';
        confetti.style.transform = 'translateX(-50%)';
        confetti.style.fontSize = '2.5rem';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '10';
        voteMessage.style.position = 'relative';
        voteMessage.appendChild(confetti);
        setTimeout(() => {
          confetti.remove();
        }, 1200);
      }
    }, 100);
  }
}

function showFeedbackBasedOnLie(votedStory) {
  fetch('/api/lie')
    .then(res => res.json())
    .then(data => {
      const lie = data.lie;
      const voteButtons = document.querySelector('.vote-buttons');
      if (!voteButtons || !votedStory || !lie) return;
      if (parseInt(votedStory) === lie) {
        voteButtons.innerHTML = `<div class='feedback-message correct-feedback'>🎉 You are right!</div>`;
        setTimeout(() => {
          const feedback = document.querySelector('.correct-feedback');
          if (feedback) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.innerHTML = '🎉✨🎊';
            confetti.style.position = 'absolute';
            confetti.style.left = '50%';
            confetti.style.top = '0';
            confetti.style.transform = 'translateX(-50%)';
            confetti.style.fontSize = '3rem';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '10';
            feedback.style.position = 'relative';
            feedback.appendChild(confetti);
            setTimeout(() => { confetti.remove(); }, 1500);
          }
        }, 100);
      } else {
        voteButtons.innerHTML = `<div class='feedback-message wrong-feedback'>You are wrong this time, try next time</div>`;
      }
    });
}

let lastLie = null;
let lastFeedbackType = null;

function updateLiveFeedback() {
  const votedStory = localStorage.getItem('votedStory');
  if (!votedStory) return;
  fetch('/api/lie')
    .then(res => res.json())
    .then(data => {
      const lie = data.lie;
      if (lie !== lastLie) {
        lastLie = lie;
        if (lie) {
          showFeedbackBasedOnLie(votedStory);
          lastFeedbackType = (parseInt(votedStory) === lie) ? 'correct' : 'wrong';
        } else {
          showVoteMessage(votedStory);
          lastFeedbackType = null;
        }
      } else if (lie) {
        // If feedback type changed (e.g. user changed vote in localStorage), update
        const currentType = (parseInt(votedStory) === lie) ? 'correct' : 'wrong';
        if (currentType !== lastFeedbackType) {
          showFeedbackBasedOnLie(votedStory);
          lastFeedbackType = currentType;
        }
      }
    });
}

let lastCandidate = null;
function pollCandidateReset() {
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
        // Clear localStorage and reset voting UI
        localStorage.removeItem('votedStory');
        // Also clear all localStorage keys related to voting
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('vote') || key.startsWith('story')) {
            localStorage.removeItem(key);
          }
        });
        // Reset vote buttons inside the white container
        const votingSection = document.getElementById('votingSection');
        if (votingSection) {
          votingSection.innerHTML = `
            <div class="vote-buttons">
              <button class="vote-btn" data-story="1">Vote for Story 1</button>
              <button class="vote-btn" data-story="2">Vote for Story 2</button>
              <button class="vote-btn" data-story="3">Vote for Story 3</button>
            </div>
            <div class="results" id="results"></div>
          `;
          votingSection.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              if (localStorage.getItem('votedStory')) return;
              const story = parseInt(this.getAttribute('data-story'));
              fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ story })
              })
              .then(res => {
                if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
                  return res.json();
                } else {
                  throw new Error('Vote failed: Server did not return JSON.');
                }
              })
              .then(() => {
                localStorage.setItem('votedStory', story);
                fetch('/api/lie')
                  .then(res => {
                    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
                      return res.json();
                    } else {
                      throw new Error('Lie fetch failed: Server did not return JSON.');
                    }
                  })
                  .then(data => {
                    lastLie = data.lie;
                    if (data.lie) {
                      showFeedbackBasedOnLie(story);
                      lastFeedbackType = (parseInt(story) === data.lie) ? 'correct' : 'wrong';
                    } else {
                      showVoteMessage(story);
                      lastFeedbackType = null;
                    }
                  })
                  .catch(err => {
                    const votingSection = document.getElementById('votingSection');
                    if (votingSection) {
                      votingSection.innerHTML += `<div class='error-message'>${err.message}</div>`;
                    }
                  });
                setInterval(updateLiveFeedback, 2000);
                refreshResults();
              })
              .catch(err => {
                const votingSection = document.getElementById('votingSection');
                if (votingSection) {
                  votingSection.innerHTML += `<div class='error-message'>${err.message}</div>`;
                }
              });
            });
          });
        }
        // Also reset feedback/results
        refreshPreviewPanel();
      }
    });
}
setInterval(pollCandidateReset, 2000);

window.addEventListener('DOMContentLoaded', () => {
  refreshPreviewPanel();
  refreshResults();
  const votedStory = localStorage.getItem('votedStory');
  if (votedStory) {
    fetch('/api/lie')
      .then(res => res.json())
      .then(data => {
        lastLie = data.lie;
        if (data.lie) {
          showFeedbackBasedOnLie(votedStory);
          lastFeedbackType = (parseInt(votedStory) === data.lie) ? 'correct' : 'wrong';
        } else {
          showVoteMessage(votedStory);
          lastFeedbackType = null;
        }
      });
    setInterval(updateLiveFeedback, 2000);
    return;
  }
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Prevent double voting
      if (localStorage.getItem('votedStory')) return;
      const story = parseInt(this.getAttribute('data-story'));
      fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story })
      })
      .then(res => res.json())
      .then(() => {
        localStorage.setItem('votedStory', story);
        fetch('/api/lie')
          .then(res => res.json())
          .then(data => {
            lastLie = data.lie;
            if (data.lie) {
              showFeedbackBasedOnLie(story);
              lastFeedbackType = (parseInt(story) === data.lie) ? 'correct' : 'wrong';
            } else {
              showVoteMessage(story);
              lastFeedbackType = null;
            }
          });
        setInterval(updateLiveFeedback, 2000);
        refreshResults();
      });
    });
  });
});
