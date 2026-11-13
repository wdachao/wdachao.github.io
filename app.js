'use strict';
(() => {
  const products = window.MANGYIN_PRODUCTS || [];
  const getProduct = id => products.find(product => product.id === id);
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const releaseRoot = 'https://mangyin-cash-weighing-2026.oss-cn-hangzhou.aliyuncs.com/';
  let selectedProductId = 'weighing';
  let windowsReady = false;
  const releaseCaption = release => release
    ? 'v' + release.version + ' · 更新 ' + release.publishedAt.slice(0, 10)
    : '版本与更新日期以下载页为准';
  const androidCaption = document.createElement('p');
  androidCaption.className = 'release-caption';
  $('.download-card-top').after(androidCaption);
  const windowsCaption = document.createElement('p');
  windowsCaption.className = 'release-caption windows-release-caption';
  $('.windows-download-heading').after(windowsCaption);

  function renderReleaseInfo() {
    products.forEach(product => {
      const button = $('[data-download="' + product.id + '"]');
      let label = button.querySelector('.download-tab-release');
      if (!label) {
        const title = button.querySelector('span');
        title.classList.add('download-tab-label');
        label = document.createElement('small');
        label.className = 'download-tab-release';
        title.append(label);
      }
      label.textContent = releaseCaption(product.android);
    });
    androidCaption.textContent = 'Android ' + releaseCaption(getProduct(selectedProductId).android);
    const windows = getProduct('weighing').windows;
    windowsCaption.textContent = windowsReady
      ? releaseCaption(windows) : '正在获取 Windows 发布信息…';
    if (windowsReady) {
      $('#windows-package-sha256').textContent = windows.sha256;
    }
    $('.download-integrity').hidden = !windowsReady;
    $$('a.windows-direct').forEach(anchor => {
      anchor.setAttribute('aria-disabled', String(!windowsReady));
      if (windowsReady) {
        anchor.href = windows.url;
        anchor.download = windows.filename;
      } else {
        anchor.removeAttribute('href');
      }
    });
  }

  function validRelease(release, product, platform) {
    if (!release || release.productId !== product.id || release.platform !== platform ||
        !/^\d+\.\d+\.\d+$/.test(release.version) ||
        !/^\d{4}-\d{2}-\d{2}T/.test(release.publishedAt) ||
        Number.isNaN(Date.parse(release.publishedAt))) return false;
    if (platform === 'android') return release.url === product.url;
    return /^https:\/\/mangyin-cash-weighing-2026\.oss-cn-hangzhou\.aliyuncs\.com\/download\//.test(release.url) &&
      release.filename === 'Mangyin_Scale_Setup.exe' && /^[a-f0-9]{64}$/.test(release.sha256);
  }

  function loadRelease(product, platform) {
    const channel = product.id + '-' + platform;
    const script = document.createElement('script');
    script.src = releaseRoot + 'releases/' + channel + '.js?t=' + Date.now();
    script.async = true;
    const timeout = window.setTimeout(() => script.onerror(), 12000);
    script.onload = () => {
      window.clearTimeout(timeout);
      const release = (window.MANGYIN_RELEASES || {})[channel];
      if (validRelease(release, product, platform)) {
        product[platform] = release;
        if (platform === 'windows') windowsReady = true;
        renderReleaseInfo();
      } else if (platform === 'windows') {
        windowsCaption.textContent = 'Windows 发布信息校验失败，请刷新重试';
      }
      script.remove();
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      if (platform === 'windows' && !windowsReady) {
        windowsCaption.textContent = '暂时无法获取 Windows 版本，请刷新重试';
      }
      script.remove();
    };
    document.head.append(script);
  }
  const menuButton = $('.menu-toggle');
  const menu = $('#mobile-menu');

  function closeMenu() {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '展开导航');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '收起导航' : '展开导航');
  });
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const dialog = $('.qr-dialog');
  function showQR(id) {
    const product = getProduct(id);
    if (!product) return;
    if (typeof dialog.showModal !== 'function') { window.open(product.url, '_blank', 'noopener,noreferrer'); return; }
    $('#qr-dialog-title').textContent = product.name;
    $('#qr-dialog-scene').textContent = product.scene;
    $('#qr-dialog-image').src = './assets/' + id + '-qr.png';
    $('#qr-dialog-image').alt = product.name + '下载二维码';
    $('#qr-dialog-link').href = product.url;
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  $$('[data-qr]').forEach(button => button.addEventListener('click', () => showQR(button.dataset.qr)));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });

  const windowsDialog = document.createElement('dialog');
  windowsDialog.className = 'windows-confirm-dialog';
  windowsDialog.setAttribute('aria-labelledby', 'windows-confirm-title');
  windowsDialog.innerHTML = '<button type="button" class="dialog-close" data-windows-close aria-label="关闭下载确认"><svg class="icon" aria-hidden="true"><use href="#i-close"></use></svg></button>' +
    '<span class="windows-confirm-eyebrow">WINDOWS · 芒音称重收银</span>' +
    '<h2 id="windows-confirm-title">确认下载 Windows 安装包</h2>' +
    '<p>安装程序将从芒音称重下载到本机。</p>' +
    '<p class="release-caption" data-windows-release></p>' +
    '<div class="windows-confirm-file"><svg class="icon" aria-hidden="true"><use href="#i-windows"></use></svg><span><strong data-windows-filename></strong><small>Windows 安装程序</small></span></div>' +
    '<div class="windows-confirm-actions"><button type="button" class="windows-confirm-cancel" data-windows-cancel>取消</button><button type="button" class="windows-confirm-submit" data-windows-confirm>确认下载</button></div>';
  document.body.append(windowsDialog);

  let pendingWindowsDownload = null;
  const closeWindowsDialog = () => windowsDialog.close();
  windowsDialog.querySelector('[data-windows-close]').addEventListener('click', closeWindowsDialog);
  windowsDialog.querySelector('[data-windows-cancel]').addEventListener('click', closeWindowsDialog);
  windowsDialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    pendingWindowsDownload = null;
  });
  windowsDialog.addEventListener('click', event => {
    if (event.target !== windowsDialog) return;
    const box = windowsDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeWindowsDialog();
  });
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a.windows-direct');
    if (!anchor) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!windowsReady) return;
    if (windowsDialog.open) return;
    pendingWindowsDownload = { url: anchor.href, filename: anchor.download || 'Mangyin_Scale_Setup.exe' };
    windowsDialog.querySelector('[data-windows-filename]').textContent = pendingWindowsDownload.filename;
    windowsDialog.querySelector('[data-windows-release]').textContent = releaseCaption(getProduct('weighing').windows);
    if (typeof windowsDialog.showModal !== 'function') {
      window.open(pendingWindowsDownload.url, '_blank', 'noopener,noreferrer');
      pendingWindowsDownload = null;
      return;
    }
    windowsDialog.showModal();
    document.body.classList.add('modal-open');
  }, true);
  windowsDialog.querySelector('[data-windows-confirm]').addEventListener('click', () => {
    if (!pendingWindowsDownload) return;
    const file = pendingWindowsDownload;
    closeWindowsDialog();
    const download = document.createElement('a');
    download.href = file.url;
    download.download = file.filename;
    download.target = '_blank';
    download.rel = 'noopener';
    document.body.append(download);
    download.click();
    download.remove();
  });

  $$('[data-download]').forEach(button => button.addEventListener('click', () => {
    const product = getProduct(button.dataset.download);
    if (!product) return;
    selectedProductId = product.id;
    $$('[data-download]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
    $('#download-name').textContent = product.name;
    $('#download-scene').textContent = product.scene;
    $('#download-icon').src = './assets/' + product.id + '-icon.webp';
    $('#download-qr').src = './assets/' + product.id + '-qr.png';
    $('#download-qr').alt = product.name + '下载二维码';
    $('#download-link').href = product.url;
    $('#download-link-label').textContent = '前往下载';
    $('#windows-download').hidden = !product.windows;
    renderReleaseInfo();
  }));
  renderReleaseInfo();
  products.forEach(product => {
    loadRelease(product, 'android');
    if (product.windows) loadRelease(product, 'windows');
  });

  // These local, labelled illustrations demonstrate the product's interaction.
  $$('[data-scale]').forEach(button => button.addEventListener('click', () => {
    const device = button.closest('.scale-device');
    let tare = device.dataset.tared === 'true';
    let zero = device.dataset.zero === 'true';
    if (button.dataset.scale === 'tare') { tare = !tare; zero = false; }
    else { zero = !zero; tare = false; }
    device.dataset.tared = String(tare);
    device.dataset.zero = String(zero);
    const weight = zero ? 0 : (tare ? 1.200 : 1.280);
    device.querySelector('[data-weight]').textContent = weight.toFixed(3);
    device.querySelector('[data-tare]').textContent = tare ? '0.080' : '0.000';
    device.querySelector('[data-weight-total]').textContent = (weight * 12.8).toFixed(2);
    device.querySelector('[data-scale=tare]').textContent = tare ? '清皮' : '去皮';
    device.querySelector('[data-scale=reset]').textContent = zero ? '复位' : '置零';
    $('#demo-status').textContent = '称重演示：净重 ' + weight.toFixed(3) + ' 千克，金额 ' + (weight * 12.8).toFixed(2) + ' 元。';
  }));
  const periods = { week: [36,61,45,87,58,72,43], month: [69,43,82,56,76,48,91] };
  $$('[data-period]').forEach(button => button.addEventListener('click', () => {
    const period = button.dataset.period;
    $$('[data-period]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
    $$('.book-chart > span').forEach((bar, index) => {
      bar.style.setProperty('--bar', periods[period][index] + '%');
      bar.querySelector('small').textContent = period === 'week' ? ['一','二','三','四','五','六','日'][index] : ['1','5','10','15','20','25','30'][index];
    });
    $('.book-chart').setAttribute('aria-label', period === 'week' ? '示例本周支出趋势' : '示例本月支出趋势');
  }));

  if ('IntersectionObserver' in window) {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('has-motion');
      const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); reveal.unobserve(entry.target); } });
      }, { threshold: .08 });
      $$('.reveal').forEach(element => reveal.observe(element));
    }
    const navigation = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = $('.desktop-nav a[href=\"#' + entry.target.id + '\"]');
        if (link) {
          if (entry.isIntersecting) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-20% 0px -40% 0px' });
    $$('.product-panel').forEach(section => navigation.observe(section));
  }
  $('#year').textContent = new Date().getFullYear();
})();
