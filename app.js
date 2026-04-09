/* ============================================================
   app.js — TaskFlow To-Do App
   ============================================================ */

// ── State ──────────────────────────────────────────────────
let tasks = [];
let currentFilter = 'all';

// ── DOM References ──────────────────────────────────────────
const taskInput       = document.getElementById('task-input');
const prioritySelect  = document.getElementById('priority-select');
const addBtn          = document.getElementById('add-btn');
const taskList        = document.getElementById('task-list');
const emptyState      = document.getElementById('empty-state');
const totalCount      = document.getElementById('total-count');
const doneCount       = document.getElementById('done-count');
const progressFill    = document.getElementById('progress-fill');
const progressLabel   = document.getElementById('progress-label');
const tabs            = document.querySelectorAll('.tab[data-filter]');
const clearDoneBtn    = document.getElementById('clear-completed-btn');

// ── Load from localStorage ──────────────────────────────────
function loadTasks() {
  const stored = localStorage.getItem('taskflow-tasks');
  tasks = stored ? JSON.parse(stored) : [];
}

// ── Save to localStorage ────────────────────────────────────
function saveTasks() {
  localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
}

// ── Generate unique ID ──────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Add Task ────────────────────────────────────────────────
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    taskInput.classList.add('shake');
    setTimeout(() => taskInput.classList.remove('shake'), 400);
    return;
  }

  const task = {
    id:        generateId(),
    text:      text,
    priority:  prioritySelect.value,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(task);
  saveTasks();
  taskInput.value = '';
  taskInput.focus();
  render();
}

// ── Toggle Complete ─────────────────────────────────────────
function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();
  render();
}

// ── Delete Task ─────────────────────────────────────────────
function deleteTask(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.style.transform = 'translateX(60px)';
    item.style.opacity   = '0';
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      render();
    }, 280);
  }
}

// ── Clear Completed ─────────────────────────────────────────
function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

// ── Filter Tasks ────────────────────────────────────────────
function getFilteredTasks() {
  switch (currentFilter) {
    case 'active':    return tasks.filter(t => !t.completed);
    case 'completed': return tasks.filter(t => t.completed);
    default:          return tasks;
  }
}

// ── Priority badge ──────────────────────────────────────────
function badgeFor(priority) {
  const labels = { high: '🔴 High', medium: '🟡 Med', low: '🟢 Low' };
  return `<span class="priority-badge badge-${priority}">${labels[priority]}</span>`;
}

// ── Build Task Element ──────────────────────────────────────
function createTaskEl(task) {
  const li = document.createElement('li');
  li.className  = `task-item${task.completed ? ' completed' : ''}`;
  li.dataset.id = task.id;
  li.dataset.priority = task.priority;

  li.innerHTML = `
    <button class="task-check" aria-label="Toggle complete" onclick="toggleTask('${task.id}')">
      ${task.completed ? '✓' : ''}
    </button>
    <span class="task-text">${escapeHtml(task.text)}</span>
    ${badgeFor(task.priority)}
    <div class="task-actions">
      <button class="action-btn delete-btn" aria-label="Delete task" onclick="deleteTask('${task.id}')">🗑</button>
    </div>
  `;

  return li;
}

// ── Escape HTML ─────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Update Stats ────────────────────────────────────────────
function updateStats() {
  const total     = tasks.length;
  const done      = tasks.filter(t => t.completed).length;
  const pct       = total === 0 ? 0 : Math.round((done / total) * 100);

  totalCount.textContent    = total;
  doneCount.textContent     = done;
  progressFill.style.width  = pct + '%';
  progressLabel.textContent = pct + '% complete';
}

// ── Render ──────────────────────────────────────────────────
function render() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
    filtered.forEach(task => {
      taskList.appendChild(createTaskEl(task));
    });
  }

  updateStats();
}

// ── Filter Tab Logic ────────────────────────────────────────
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    render();
  });
});

// ── Clear Done Button ───────────────────────────────────────
clearDoneBtn.addEventListener('click', clearCompleted);

// ── Add on Button Click ─────────────────────────────────────
addBtn.addEventListener('click', addTask);

// ── Add on Enter Key ────────────────────────────────────────
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// ── Shake animation style (injected once) ──────────────────
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
  .shake { animation: shake 0.4s ease; }
`;
document.head.appendChild(shakeStyle);

// ── Init ────────────────────────────────────────────────────
loadTasks();
render();