const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const API = window.MeetFlowAPI;

function toast(message) {
  const element = $('#toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => element.classList.remove('show'), 3200);
}
function initials(name = 'MeetFlow') { return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(); }
function showError(error) { toast(error.message || 'Something went wrong.'); }
function formatDate(value) { return value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'; }

$$('[data-toggle-password]').forEach(toggle => toggle.addEventListener('click', () => {
  const input = $(`#${toggle.dataset.togglePassword}`);
  input.type = input.type === 'password' ? 'text' : 'password';
  toggle.textContent = input.type === 'password' ? 'Show' : 'Hide';
}));

const loginForm = $('#loginForm');
if (loginForm) loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const submitButton = loginForm.querySelector('button[type="submit"]');
  const identifier = $('#loginUsername').value.trim();
  const password = $('#loginPassword').value;

  if (!identifier || !password) {
    toast('Enter both your email and password.');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Signing in...';

  try {
    const result = await API.request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
    API.setToken(result.token);
    window.location.href = '/dashboard';
  } catch (error) {
    showError(error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Enter workspace';
  }
});

const signupForm = $('#signupForm');
if (signupForm) signupForm.addEventListener('submit', async event => {
  event.preventDefault();
  const fullName = $('#fullName').value.trim();
  const username = $('#signupUsername').value.trim();
  const email = $('#signupEmail').value.trim();
  const password = $('#signupPassword').value;
  const confirmPassword = $('#confirmPassword').value;
  const role = $('#signupRole') ? $('#signupRole').value : 'Employee';

  if (!fullName || !username || !email || !password) {
    toast('Please complete all required fields.');
    return;
  }
  if (password.length < 8) {
    toast('Passwords must be at least 8 characters long.');
    return;
  }
  if (password !== confirmPassword) {
    toast('Passwords do not match.');
    return;
  }

  const submitButton = signupForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Creating workspace...';

  try {
    const result = await API.request('/auth/signup', { method: 'POST', body: JSON.stringify({ name: fullName, username, email, password, role }) });
    API.setToken(result.token);
    window.location.href = '/dashboard';
  } catch (error) {
    showError(error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Create workspace';
  }
});

async function requireUser() {
  if (!API.getToken()) { window.location.href = 'index.html'; return null; }
  try {
    const result = await API.request('/auth/me');
    $('#userName').textContent = result.user.name;
    $('#userAvatar').textContent = initials(result.user.name);
    return result.user;
  } catch (error) { API.clearToken(); window.location.href = 'index.html'; return null; }
}

let meetings = [];
let currentFilter = 'All';

function renderTasks(tasks) {
  const list = $('#taskList');
  if (!list) return;
  list.innerHTML = `<div class="task-row header"><span>Task</span><span>Owner</span><span>Deadline</span><span>Priority</span><span>Status</span><span></span></div>${tasks.length ? tasks.map(task => `<div class="task-row"><span class="task-title">${task.title}</span><span class="task-owner">${task.owner}</span><span class="task-date">${formatDate(task.deadline)}</span><span class="task-priority priority ${task.priority.toLowerCase()}">${task.priority}</span><span class="task-status ${task.status.replace(' ', '-')}">${task.status}</span><button class="task-action" data-task-id="${task._id}">${task.status === 'Completed' ? 'View' : 'Advance'}</button></div>`).join('') : '<div class="empty-state">No tasks match this filter yet.</div>'}`;
  $$('.task-action', list).forEach(button => button.addEventListener('click', async () => {
    const task = tasks.find(item => item._id === button.dataset.taskId);
    if (!task || task.status === 'Completed') return toast('This task is complete.');
    const next = { Pending: 'Assigned', Assigned: 'In Progress', 'In Progress': 'Completed' }[task.status];
    try { await API.request(`/tasks/${task._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next }) }); await loadWorkspace(); toast(`Task moved to ${next}.`); } catch (error) { showError(error); }
  }));
}

async function loadStats() {
  const { stats } = await API.request('/dashboard/stats');
  $('#totalMeetings').textContent = stats.totalMeetings;
  $('#totalTasks').textContent = stats.totalTasks;
  $('#pendingTasks').textContent = stats.pendingTasks;
  $('#completedTasks').textContent = stats.completedTasks;
  $('#notificationCount').textContent = stats.unreadNotifications;
}

function renderMeetings() {
  const list = $('#meetingList');
  const select = $('#newTaskMeeting');
  if (!list || !select) return;
  select.innerHTML = '<option value="">Select a meeting</option>' + meetings.map(meeting => `<option value="${meeting._id}">${meeting.title}</option>`).join('');
  list.innerHTML = meetings.length ? meetings.map(meeting => `<article class="meeting-card"><div><span class="mini-label">${meeting.analysisStatus} · ${formatDate(meeting.meetingDate)}</span><h3>${meeting.title}</h3><p>${meeting.summary || 'Transcript stored. Analyze this meeting to generate tasks.'}</p></div><button class="text-link meeting-detail" data-meeting-id="${meeting._id}">View details →</button></article>`).join('') : '<div class="empty-state">No meetings stored yet. Analyze your first transcript above.</div>';
  $$('.meeting-detail', list).forEach(button => button.addEventListener('click', async () => {
    try { const result = await API.request(`/meetings/${button.dataset.meetingId}`); $('#analysisResult').innerHTML = `<p><b>${result.meeting.summary || 'No summary yet.'}</b></p><h4>Decisions</h4><ul>${result.meeting.decisions.map(decision => `<li>${decision}</li>`).join('') || '<li>No decisions recorded.</li>'}</ul><p class="dispatch-note">${result.tasks.length} persistent task(s) connected to this meeting.</p>`; } catch (error) { showError(error); }
  }));
}

async function loadWorkspace() {
  const [taskResult, meetingResult] = await Promise.all([API.request('/tasks'), API.request('/meetings')]);
  meetings = meetingResult.meetings;
  renderTasks(currentFilter === 'All' ? taskResult.tasks : taskResult.tasks.filter(task => task.status === currentFilter));
  renderMeetings(); await loadStats(); await loadNotifications();
}

async function loadNotifications() {
  const result = await API.request('/notifications');
  const list = $('#notificationList');
  if (!list) return;
  list.innerHTML = result.notifications.length ? result.notifications.map(item => `<button class="notification-item ${item.read ? '' : 'unread'}" data-notification-id="${item._id}"><b>${item.title}</b><span>${item.message}</span></button>`).join('') : '<p class="muted">No notifications yet.</p>';
  $$('.notification-item', list).forEach(item => item.addEventListener('click', async () => { try { await API.request(`/notifications/${item.dataset.notificationId}/read`, { method: 'PATCH' }); await loadNotifications(); await loadStats(); } catch (error) { showError(error); } }));
}

if ($('#taskList')) {
  (async () => { try { await requireUser(); await loadWorkspace(); } catch (error) { showError(error); } })();
  $('#filterTabs').addEventListener('click', async event => { const button = event.target.closest('button'); if (!button) return; currentFilter = button.dataset.filter; $$('button', event.currentTarget).forEach(item => item.classList.remove('active')); button.classList.add('active'); try { const result = await API.request(`/tasks${currentFilter === 'All' ? '' : `?status=${encodeURIComponent(currentFilter)}`}`); renderTasks(result.tasks); } catch (error) { showError(error); } });
  $('#meetingForm').addEventListener('submit', async event => {
    event.preventDefault(); const button = $('#analyzeMeetingButton'); button.disabled = true; button.innerHTML = 'AI is analyzing <span class="processing-dot">...</span>'; $('#analysisResult').innerHTML = '<p class="analysis-processing">Transcript → AI understanding → decisions → actions → autonomous dispatch</p>';
    try {
      const created = await API.request('/meetings', { method: 'POST', body: JSON.stringify({ title: $('#meetingTitle').value.trim(), participants: $('#meetingParticipants').value.split(',').map(item => item.trim()).filter(Boolean), meetingDate: $('#meetingDate').value, transcript: $('#meetingTranscript').value.trim() }) });
      const result = await API.request(`/meetings/${created.meeting._id}/analyze`, { method: 'POST' });
      $('#analysisResult').innerHTML = `<p><b>${result.analysis.summary}</b></p><h4>Decisions</h4><ul>${result.analysis.decisions.map(item => `<li>${item}</li>`).join('')}</ul><p class="dispatch-note">${result.tasks.length} task(s) created. ${result.dispatchMode}</p>`;
      event.target.reset(); await loadWorkspace(); toast('Meeting analyzed and tasks dispatched.');
    } catch (error) { $('#analysisResult').innerHTML = `<p class="error-text">${error.message}</p>`; showError(error); } finally { button.disabled = false; button.innerHTML = 'Analyze meeting <span>✦</span>'; }
  });
  $('#loadDemoButton').addEventListener('click', () => { $('#meetingTitle').value = 'Product strategy discussion'; $('#meetingParticipants').value = 'Rahul, Priya, Arjun, Team'; $('#meetingDate').value = new Date().toISOString().slice(0, 10); $('#meetingTranscript').value = "During today's product meeting, Rahul will prepare the market analysis by Friday. Priya will complete the presentation before Monday. The team will review the final materials on Tuesday. Arjun will prepare the technical roadmap by next Wednesday."; toast('Demo transcript loaded.'); });
  $('#taskForm').addEventListener('submit', async event => { event.preventDefault(); try { await API.request('/tasks', { method: 'POST', body: JSON.stringify({ title: $('#newTaskName').value.trim(), owner: $('#newTaskOwner').value.trim(), deadline: $('#newTaskDeadline').value || null, priority: $('#newTaskPriority').value, meetingId: $('#newTaskMeeting').value }) }); $('#taskModal').classList.remove('open'); event.target.reset(); await loadWorkspace(); toast('Task saved to MongoDB.'); } catch (error) { showError(error); } });
  $('#createTaskButton').addEventListener('click', () => $('#taskModal').classList.add('open')); $('#closeModal').addEventListener('click', () => $('#taskModal').classList.remove('open')); $('#taskModal').addEventListener('click', event => { if (event.target.id === 'taskModal') $('#taskModal').classList.remove('open'); });
  $('#notificationButton').addEventListener('click', () => $('#notificationDrawer').classList.toggle('open')); $('#closeNotifications').addEventListener('click', () => $('#notificationDrawer').classList.remove('open'));
}

$('#logoutButton')?.addEventListener('click', async () => { try { await API.request('/auth/logout', { method: 'POST' }); } catch (error) { /* clear the token even if the network is unavailable */ } API.clearToken(); window.location.href = 'index.html'; });
$('#menuButton')?.addEventListener('click', () => $('#mobileMenu').classList.toggle('open'));
$$('.mobile-menu a').forEach(link => link.addEventListener('click', () => $('#mobileMenu').classList.remove('open')));
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 });
$$('.reveal').forEach(element => observer.observe(element));
