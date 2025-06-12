const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const addBtn = document.getElementById('addBtn');
const prioritySelect = document.getElementById('prioritySelect');
const reminderTime = document.getElementById('reminderTime');
const themeToggle = document.getElementById('themeToggle');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.className = task ${task.priority} ${task.completed ? 'completed' : ''};
    li.setAttribute('draggable', true);
    li.dataset.index = i;

    const info = document.createElement('div');
    info.className = 'info';
    info.textContent = task.text;
    info.title = task.reminder || '';

    info.addEventListener('click', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏';
    editBtn.onclick = () => {
      const newText = prompt('Edit task:', task.text);
      if (newText) {
        task.text = newText;
        saveTasks();
        renderTasks();
      }
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
    delBtn.onclick = () => {
      tasks.splice(i, 1);
      saveTasks();
      renderTasks();
    };

    li.appendChild(info);
    li.appendChild(editBtn);
    li.appendChild(delBtn);

    // Drag events
    li.addEventListener('dragstart', dragStart);
    li.addEventListener('dragover', dragOver);
    li.addEventListener('drop', drop);

    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const reminder = reminderTime.value;

  if (!text) return;

  tasks.push({ text, priority, completed: false, reminder });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  reminderTime.value = '';

  if (reminder) {
    scheduleReminder(text, new Date(reminder));
  }
}

function dragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.index);
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const from = e.dataTransfer.getData('text/plain');
  const to = e.target.closest('.task').dataset.index;
  if (from === to) return;

  const movedTask = tasks.splice(from, 1)[0];
  tasks.splice(to, 0, movedTask);
  saveTasks();
  renderTasks();
}

function scheduleReminder(text, time) {
  const delay = time.getTime() - Date.now();
  if (delay > 0) {
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('🔔 Reminder', { body: text });
      }
    }, delay);
  }
}

addBtn.addEventListener('click', addTask);

themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', themeToggle.checked);
});

if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

renderTasks();