const API_URL = "https://v1.jinrishici.com/all.json";
const MIN_LOADING = 550; // 最短加载时间，避免界面闪烁

// 接口不可用时的备用名句
const FALLBACK = {
  content: "出师未捷身先死，长使英雄泪满襟。",
  origin: "蜀相",
  author: "杜甫",
  category: "古诗文-人生-励志"
};

const band = document.getElementById("verse-band");
const btn = document.getElementById("refresh-btn");
const els = {
  text: document.getElementById("verse-text"),
  origin: document.getElementById("verse-origin"),
  author: document.getElementById("verse-author"),
  category: document.getElementById("verse-category")
};


const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function requestPoem() {
  return axios
    .get(API_URL, { timeout: 8000 })
    .then((res) => res.data || {});
}

/* ---------- 渲染诗句 ---------- */
function render(data, isFallback) {
  const content = String(data.content || "").trim() || FALLBACK.content;
  const origin = String(data.origin || "").trim() || FALLBACK.origin;
  const author = String(data.author || "").trim() || FALLBACK.author;
  const category = String(data.category || "").trim();

  els.text.textContent = content;
  els.origin.textContent = "《" + origin + "》";
  els.author.textContent = author ? "—— " + author : "";
  els.category.textContent = category
    ? "分类 · " + category
    : (isFallback ? "本地备用名句" : "");
}

function setLoading(isLoading) {
  band.classList.toggle("is-loading", isLoading);
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "拾句中…" : "再来一句";
}

/* ---------- async/await 用法：像同步代码一样编排多个 Promise ---------- */
async function loadPoem() {
  setLoading(true);
  try {
    // Promise.all：请求与「最短加载等待」并行执行
    const [data] = await Promise.all([requestPoem(), wait(MIN_LOADING)]);
    render(data, false);
  } catch (error) {
    // try/catch 统一捕获 axios 的网络错误、超时等
    console.warn("古诗词接口请求失败：", error && error.message);
    await wait(MIN_LOADING);
    render(FALLBACK, true);
  } finally {
    setLoading(false);
  }
}

//

// 点击按钮换一句
btn.addEventListener("click", loadPoem);

// 页面加载完成后自动获取一句
loadPoem();