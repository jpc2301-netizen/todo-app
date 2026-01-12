const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const dueInput = document.getElementById("dueInput");
const list = document.getElementById("todoList");
const countEl = document.getElementById("count");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter");

const STORAGE_KEY = "todo-app-items-v2";

let todos = loadTodos();
let currentFilter = "all";

render();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
    due: dueInput.value || null, // YYYY-MM-DD or null
    createdAt: Date.now(),
  });

  input.value = "";
  dueInput.value = "";
  saveTodos();
  render();
});

list.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  const id = li?.dataset?.id;
  if (!id) return;

  if (e.target.matches("input[type='checkbox']")) {
    toggleTodo(id);
    return;
  }

  if (e.target.matches("[data-action='delete']")) {
    deleteTodo(id);
    return;
  }
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

function toggleTodo(id) {
  todos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function getVisibleTodos() {
  let filtered = todos;

  if (currentFilter === "active") filtered = todos.filter((t) => !t.completed);
  if (currentFilter === "completed") filtered = todos.filter((t) => t.completed);

  // Sort: due date first (earliest), then newest
  const withDue = filtered.filter((t) => t.due);
  const withoutDue = filtered.filter((t) => !t.due);

  withDue.sort((a, b) => new Date(a.due) - new Date(b.due));
  withoutDue.sort((a, b) => b.createdAt - a.createdAt);

  return [...withDue, ...withoutDue];
}

function render() {
  const visible = getVisibleTodos();
  list.innerHTML = "";

  visible.forEach((todo) => {
    const li = document.createElement("li");
    li.dataset.id = todo.id;

    const left = document.createElement("div");
    left.className = "left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    const span = document.createElement("span");
    span.className = "task" + (todo.completed ? " completed" : "");
    span.textContent = todo.text;

    // Edit on double click
    span.title = "Double-click to edit";
    span.addEventListener("dblclick", () => startEdit(todo.id));

    left.appendChild(checkbox);
    left.appendChild(span);

    // Due date label
    if (todo.due) {
      const due = document.createElement("small");
      due.textContent = `Due: ${todo.due}`;
      due.style.opacity = "0.7";
      due.style.marginLeft = "10px";
      left.appendChild(due);
    }

    const del = document.createElement("button");
    del.className = "iconBtn";
    del.dataset.action = "delete";
    del.textContent = "Delete";

    li.appendChild(left);
    li.appendChild(del);

    list.appendChild(li);
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  countEl.textContent = `${activeCount} item${activeCount === 1 ? "" : "s"} left`;
}

function startEdit(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const li = list.querySelector(`li[data-id="${id}"]`);
  if (!li) return;

  const span = li.querySelector(".task");
  if (!span) return;

  const originalText = todo.text;

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = originalText;
  editInput.style.width = "100%";
  editInput.style.padding = "8px";
  editInput.style.borderRadius = "10px";
  editInput.style.border = "1px solid #ccc";

  span.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  const finish = (save) => {
    const newText = editInput.value.trim();
    if (save && newText) {
      todos = todos.map((t) => (t.id === id ? { ...t, text: newText } : t));
      saveTodos();
    }
    render();
  };

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });

  editInput.addEventListener("blur", () => finish(true));
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}



