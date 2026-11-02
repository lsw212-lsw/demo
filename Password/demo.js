const CHARS = {
    upper:  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:  'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
    symbol: '!@#$%^&*()-_=+[]{};:,.<>?/'
  };

  const config = { length: 12, upper: true, lower: true, number: false, symbol: true };

  const pwText   = document.getElementById('pwText');
  const copyBtn  = document.getElementById('copyBtn');
  const genBtn   = document.getElementById('genBtn');
  const hint     = document.getElementById('hint');
  const lenRange = document.getElementById('lenRange');
  const lenNum   = document.getElementById('lenNum');
  const checkboxes = document.querySelectorAll('.checks input');

  let currentPassword = '';

  function buildPool() {
    let pool = '';
    for (const key of ['upper', 'lower', 'number', 'symbol']) {
      if (config[key]) pool += CHARS[key];
    }
    return pool;
  }

  function generate(length, pool) {
    const draws = new Uint32Array(length);
    crypto.getRandomValues(draws);
    let out = '';
    for (let i = 0; i < length; i++) {
      out += pool[draws[i] % pool.length];
    }
    return out;
  }

  function showHint(text) {
    hint.textContent = text;
    hint.classList.add('show');
    clearTimeout(showHint._t);
    showHint._t = setTimeout(() => hint.classList.remove('show'), 2200);
  }

  // 1. 滑块拖动
  lenRange.addEventListener('input', function (e) {
    config.length = e.target.valueAsNumber;
    lenNum.value = config.length;
  });

  // 2. 数字框输入
  lenNum.addEventListener('input', function (e) {
    let v = parseInt(e.target.value, 10);
    if (isNaN(v)) return;
    v = Math.min(20, Math.max(5, v));
    config.length = v;
    lenRange.value = v;
  });

  // 3. 复选框
  checkboxes.forEach(function (box) {
    box.addEventListener('change', function (e) {
      config[e.target.dataset.group] = e.target.checked;
    });
  });

  // 4. 生成
  genBtn.addEventListener('click', function () {
    const pool = buildPool();
    if (!pool) {
      showHint('请至少勾选一类字符');
      genBtn.classList.remove('shake');
      void genBtn.offsetWidth;
      genBtn.classList.add('shake');
      return;
    }
    currentPassword = generate(config.length, pool);
    pwText.textContent = currentPassword;
    pwText.classList.remove('placeholder');
    hint.classList.remove('show');
    copyBtn.classList.remove('copied');
  });

  // 5. 复制
  copyBtn.addEventListener('click', function () {
    if (!currentPassword) {
      showHint('还没有生成密码');
      return;
    }
    navigator.clipboard.writeText(currentPassword).then(function () {
      copyBtn.classList.add('copied');
      showHint('已复制到剪贴板');
      setTimeout(() => copyBtn.classList.remove('copied'), 1500);
    }).catch(function () {
      showHint('复制失败，请手动选中密码');
    });
  });