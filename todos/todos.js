/* ---------- 1. 拿到页面上的各个元素 ---------- */
const input = document.querySelector('#new-todo');
const listEl = document.querySelector('#todo-list');
const footerEl = document.querySelector('#footer');
const countEl = document.querySelector('#count');
const toggleAllBtn = document.querySelector('#toggle-all');
const clearBtn = document.querySelector('#clear-completed');
const filterLinks = [...document.querySelectorAll('#filters a')];

/* ---------- 2. 状态 ---------- */
const STORAGE_KEY = 'vibe-todos-data';

const ESCAPE_TABLE = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

let uid = 0;
let todos = loadTodos();
let filter = hashToFilter();   // 当前过滤器：all / active / completed

/* ---------- 3. localStorage 存取 ---------- */

function loadTodos() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch (e) {
    saved = [];
  }

  if (!Array.isArray(saved)) return [];

  return saved
    .filter(item => item && typeof item.text === 'string')
    .map(({ text, done }) => ({
      id: makeId(),
      text,
      done: done === true,
    }));
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    // 隐私模式下存不了，忽略
  }
}

function makeId() {
  uid += 1;
  return `todo-${Date.now()}-${uid}`;
}

/* ---------- 4. 小工具 ---------- */

function escapeHtml(str) {
  return str.replace(/[&<>"]/g, char => ESCAPE_TABLE[char]);
}

function activeCount() {
  return todos.filter(todo => !todo.done).length;
}

function hashToFilter() {
  const hash = location.hash;
  if (hash === '#/active') return 'active';
  if (hash === '#/completed') return 'completed';
  return 'all';
}

// 列表里现有的所有数据行 <li class="todo">
function getItems() {
  return [...listEl.querySelectorAll('.todo')];
}

/* ---------- 5. 渲染：状态变了就重新画一遍 ---------- */

function render() {
  const total = todos.length;
  const active = activeCount();
  const completed = total - active;

  // 5.1 把全部数据画出来（不做过滤，隐藏交给下面的函数处理）
  renderList();

  // 5.2 按当前过滤器处理中间文本的显示/隐藏 + 按钮边框标记
  applyFilterView();

  // 5.3 顶部下拉箭头：没数据就隐藏，全部完成就变深
  toggleAllBtn.className = 'toggle-all';
  if (total === 0) {
    toggleAllBtn.classList.add('is-empty');
  } else if (completed === total) {
    toggleAllBtn.classList.add('is-all-done');
  }

  // 5.4 底部工具条：没数据整条隐藏
  footerEl.style.display = total ? 'flex' : 'none';

  // 5.5 items left：显示未完成条数，为 0 不显示
  countEl.style.display = active ? 'block' : 'none';
  countEl.textContent = active === 1 ? '1 item left' : `${active} items left`;

  // 5.6 Clear completed 固定右边，有已完成数据才显示
  clearBtn.style.display = completed ? 'block' : 'none';

  // 5.7 顺手存起来
  save();
}

function renderList() {
  listEl.innerHTML = todos
    .map(({ id, text, done }) => `
      <li class="todo${done ? ' completed' : ''}" data-id="${id}">
        <button class="toggle" type="button" data-action="toggle"></button>
        <span class="todo-text">${escapeHtml(text)}</span>
        <button class="destroy" type="button" data-action="destroy" title="删除"></button>
      </li>
    `)
    .join('');
}

/* ---------- 5B. 三个函数：直接用 classList / style.display 处理中间文本 ---------- */

// 点 All：全部显示
function showAllItems() {
  getItems().forEach(li => {
    li.style.display = '';          // 清掉内联样式，恢复 CSS 里的 flex
  });
}

// 点 Active：标记了完成（classList 里有 completed）的隐藏，其余显示
function showActiveItems() {
  getItems().forEach(li => {
    const done = li.classList.contains('completed');
    li.style.display = done ? 'none' : '';
  });
}

// 点 Completed：未标记完成的隐藏，只留 completed 的
function showCompletedItems() {
  getItems().forEach(li => {
    const done = li.classList.contains('completed');
    li.style.display = done ? '' : 'none';
  });
}

// 用 classList 给选中的过滤器加边框颜色
function markSelected(name) {
  filterLinks.forEach(link => {
    link.classList.toggle('selected', link.dataset.filter === name);
  });
}

// 统一调度：决定显示哪些文本 + 标记哪个按钮
function applyFilterView() {
  if (filter === 'active') {
    showActiveItems();
  } else if (filter === 'completed') {
    showCompletedItems();
  } else {
    showAllItems();
  }
  markSelected(filter);
}

/* ---------- 6. 数据操作 ---------- */

//回车添加
function addTodo(text) {
  todos.push({ id: makeId(), text, done: false });
  render();
}

// 点某一行的圆圈：只切换自己这一条（Active 模式下就是“点一个隐藏一个”）
function toggleOne(id) {
  todos.forEach(todo => {
    if (todo.id === id) {
      todo.done = !todo.done;
    }
  });
  render();
}

// 点顶部下拉箭头：全部隐藏 / 全部显示
function toggleAll() {
  const allDone = todos.length > 0 && activeCount() === 0;
  todos.forEach(todo => {
    todo.done = !allDone;
  });
  render();
}

// 点悬浮出现的 ×：删掉这一条
function removeById(id) {
  todos = todos.filter(todo => todo.id !== id);
  render();
}

// 点右下角 Clear completed：清掉已完成的数据
function clearCompleted() {
  todos = todos.filter(todo => !todo.done);
  render();
}

/* ---------- 7. 绑定事件 ---------- */

// 7.1 回车添加一条
input.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = '';
});

// 7.2 列表：所有行的圆圈和 × 都由这一个监听处理
listEl.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const { id } = btn.closest('li').dataset;
  if (btn.dataset.action === 'toggle') {
    toggleOne(id);      // 圆圈：切换这一条
  } else {
    removeById(id);     // ×：删除这一条
  }
});

// 7.3 顶部下拉箭头 + Clear completed
toggleAllBtn.addEventListener('click', toggleAll);
clearBtn.addEventListener('click', clearCompleted);

// 7.4 过滤器：三个链接各自监听，点了就调用函数处理中间文本
filterLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    filter = link.dataset.filter;   // 记住选中了谁
    applyFilterView();              // classList / style.display 处理文本 + 边框
    if (location.hash !== `#/${filter}`) {
      location.hash = `/${filter}`; // 地址栏同步成 #/all 这种
    }
  });
});

// 7.5 地址栏变化（前进/后退）也走同一套显示逻辑
window.addEventListener('hashchange', () => {
  filter = hashToFilter();
  applyFilterView();
});

/* ---------- 8. 启动 ---------- */
if (!location.hash) {
  location.hash = '/all';
}
filter = hashToFilter();
render();