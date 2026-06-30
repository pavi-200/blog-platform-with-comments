const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('blogToken');
}

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadComments() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');
  if (!postId) return;

  try {
    const comments = await apiFetch(`/comments/${postId}`);
    const container = document.getElementById('commentsList');
    if (container) {
      container.innerHTML = comments.length
        ? comments.map((comment) => `
          <div class="comment-card">
            <strong>${comment.username}</strong>
            <div class="post-meta">${formatDate(comment.createdAt)}</div>
            <p>${comment.comment}</p>
            ${getToken() ? `<button class="btn btn-secondary" data-delete-comment="${comment._id}">Delete</button>` : ''}
          </div>
        `).join('')
        : '<p class="muted">No comments yet. Be the first to share your thoughts.</p>';

      container.querySelectorAll('[data-delete-comment]').forEach((button) => {
        button.addEventListener('click', async () => {
          await apiFetch(`/comments/${button.getAttribute('data-delete-comment')}`, { method: 'DELETE' });
          loadComments();
        });
      });
    }
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('id');
      const comment = document.getElementById('commentInput').value;

      if (!getToken()) {
        window.location.href = 'login.html';
        return;
      }

      try {
        await apiFetch('/comments', {
          method: 'POST',
          body: JSON.stringify({ postId, comment })
        });
        document.getElementById('commentInput').value = '';
        loadComments();
      } catch (error) {
        console.error(error);
      }
    });
  }

  loadComments();
});
