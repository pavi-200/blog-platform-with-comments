const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('blogToken');
}

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderPosts(posts) {
  const container = document.getElementById('postsContainer');
  const latestPostsList = document.getElementById('latestPostsList');
  const dashboardPosts = document.getElementById('dashboardPosts');

  if (container) {
    container.innerHTML = posts.length
      ? posts.map((post) => `
        <article class="post-card">
          ${post.image ? `<img class="post-image" src="${post.image}" alt="${post.title}" />` : ''}
          <h3><a href="post.html?id=${post._id}">${post.title}</a></h3>
          <div class="post-meta">By ${post.authorName || post.author?.name || 'Unknown'} • ${formatDate(post.createdAt)} • ${post.category || 'General'}</div>
          <p>${(post.content || '').slice(0, 140)}${(post.content || '').length > 140 ? '...' : ''}</p>
          <a class="btn btn-secondary" href="post.html?id=${post._id}">Read more</a>
        </article>
      `).join('')
      : '<p>No posts yet.</p>';
  }

  if (latestPostsList) {
    latestPostsList.innerHTML = posts.slice(0, 5).map((post) => `<li><a href="post.html?id=${post._id}">${post.title}</a></li>`).join('');
  }

  if (dashboardPosts) {
    dashboardPosts.innerHTML = posts.length
      ? posts.map((post) => `
        <article class="post-card">
          <h3>${post.title}</h3>
          <div class="post-meta">${formatDate(post.createdAt)}</div>
          <p>${(post.content || '').slice(0, 120)}...</p>
          <div class="nav-links">
            <a href="edit-post.html?id=${post._id}" class="btn btn-secondary">Edit</a>
            <button class="btn btn-primary" data-delete-id="${post._id}">Delete</button>
          </div>
        </article>
      `).join('')
      : '<p>You have not published any posts yet.</p>';

    dashboardPosts.querySelectorAll('button[data-delete-id]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.getAttribute('data-delete-id');
        await apiFetch(`/posts/${id}`, { method: 'DELETE' });
        loadDashboard();
      });
    });
  }
}

async function loadPosts() {
  const loader = document.getElementById('loader');
  const searchInput = document.getElementById('searchInput');
  if (loader) loader.classList.remove('hidden');

  try {
    const query = searchInput ? `?search=${encodeURIComponent(searchInput.value)}` : '';
    const posts = await apiFetch(`/posts${query}`);
    renderPosts(posts);
  } catch (error) {
    console.error(error);
  } finally {
    if (loader) loader.classList.add('hidden');
  }
}

async function loadDashboard() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const data = await apiFetch('/posts/dashboard/me');
    const postCountElement = document.getElementById('postCount');
    const commentCountElement = document.getElementById('commentCount');

    if (postCountElement) postCountElement.textContent = data.totalPosts ?? data.posts.length;
    if (commentCountElement) commentCountElement.textContent = data.totalComments ?? 0;

    renderPosts(data.posts);
  } catch (error) {
    console.error(error);
  }
}

async function createPostFromDashboard(event) {
  event.preventDefault();

  if (!getToken()) {
    window.location.href = 'login.html';
    return;
  }

  const form = document.getElementById('dashboardCreateForm');
  if (!form) return;

  const formData = new FormData();
  formData.append('title', document.getElementById('dashboardTitle').value.trim());
  formData.append('content', document.getElementById('dashboardContent').value.trim());
  formData.append('category', document.getElementById('dashboardCategory').value.trim());

  const imageInput = document.getElementById('dashboardImage');
  if (imageInput && imageInput.files[0]) {
    formData.append('image', imageInput.files[0]);
  }

  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Failed to create post');

    form.reset();
    await loadDashboard();
    if (typeof showToast === 'function') {
      showToast('Post created successfully');
    }
  } catch (error) {
    if (typeof showToast === 'function') {
      showToast(error.message);
    }
    console.error(error);
  }
}

async function loadSinglePost() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  try {
    const post = await apiFetch(`/posts/${id}`);
    const container = document.getElementById('singlePostContent');
    if (container) {
      container.innerHTML = `
        <h1>${post.title}</h1>
        <div class="post-meta">By ${post.authorName || post.author?.name || 'Unknown'} • ${formatDate(post.createdAt)} • ${post.category || 'General'}</div>
        ${post.image ? `<img class="post-image" src="${post.image}" alt="${post.title}" />` : ''}
        <p>${post.content}</p>
      `;
    }
  } catch (error) {
    console.error(error);
  }
}

async function createPost(event) {
  event.preventDefault();
  const form = document.getElementById('createPostForm');
  if (!form) return;

  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('content', document.getElementById('content').value);
  formData.append('category', document.getElementById('category').value);
  const imageInput = document.getElementById('image');
  if (imageInput.files[0]) formData.append('image', imageInput.files[0]);

  try {
    await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData
    });
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error(error);
  }
}

async function editPost(event) {
  event.preventDefault();
  const form = document.getElementById('editPostForm');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const formData = new FormData();
  formData.append('title', document.getElementById('editTitle').value);
  formData.append('content', document.getElementById('editContent').value);
  formData.append('category', document.getElementById('editCategory').value);
  const imageInput = document.getElementById('editImage');
  if (imageInput.files[0]) formData.append('image', imageInput.files[0]);

  try {
    await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData
    });
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error(error);
  }
}

async function preloadEditForm() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  try {
    const post = await apiFetch(`/posts/${id}`);
    document.getElementById('editTitle').value = post.title;
    document.getElementById('editContent').value = post.content;
    document.getElementById('editCategory').value = post.category || '';
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createPostForm');
  if (form) form.addEventListener('submit', createPost);

  const dashboardForm = document.getElementById('dashboardCreateForm');
  if (dashboardForm) {
    dashboardForm.addEventListener('submit', createPostFromDashboard);
  }

  const editForm = document.getElementById('editPostForm');
  if (editForm) {
    editForm.addEventListener('submit', editPost);
    preloadEditForm();
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', loadPosts);
  }

  if (document.getElementById('postsContainer') || document.getElementById('latestPostsList')) {
    loadPosts();
  }

  if (document.getElementById('dashboardPosts')) {
    loadDashboard();
  }

  if (document.getElementById('singlePostContent')) {
    loadSinglePost();
  }
});
