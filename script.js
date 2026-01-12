const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const list = document.getElementById("todoList");
const countEl = document.getElementById("count");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter");

const STORAGE_KEY = "todo-app-items-v1";

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
    createdAt: Date.now(),
  });

  input.value = "";
  saveTodos();
  render();
});

list.addEventListener("click", (e) => {
  const id = e.target.closest("li")?.dataset?.id;
  if (!id) return;

  if (e.target.matches("input[type='checkbox']")) {
    toggleTodo(id);
  }

  if (e.target.matches("[data-action='delete']")) {
    deleteTodo(id);
  }
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  render();
});

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

function getVisibleTodos() {
  if (currentFilter === "active") return todos.filter(t => !t.completed);
  if (currentFilter === "completed") return todos.filter(t => t.completed);
  return todos;
}

function render() {
  const visible = getVisibleTodos();
  list.innerHTML = "";

  visible.forEach(todo => {
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

    left.appendChild(checkbox);
    left.appendChild(span);

    const del = document.createElement("button");
    del.className = "iconBtn";
    del.dataset.action = "delete";
    del.textContent = "Delete";

    li.appendChild(left);
    li.appendChild(del);

    list.appendChild(li);
  });

  const activeCount = todos.filter(t => !t.completed).length;
  countEl.textContent = `${activeCount} item${activeCount === 1 ? "" : "s"} left`;
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


