'use strict';
(() => {
  const products = window.MANGYIN_PRODUCTS || [];
  const getProduct = id => products.find(product => product.id === id);
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
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

  $$('[data-download]').forEach(button => button.addEventListener('click', () => {
    const product = getProduct(button.dataset.download);
    if (!product) return;
    $$('[data-download]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
    $('#download-name').textContent = product.name;
    $('#download-scene').textContent = product.scene;
    $('#download-icon').src = './assets/' + product.id + '-icon.webp';
    $('#download-qr').src = './assets/' + product.id + '-qr.png';
    $('#download-qr').alt = product.name + '下载二维码';
    $('#download-link').href = product.url;
    $('#download-link-label').textContent = '前往下载';
    $('#windows-download').hidden = !product.windows;
    if (product.windows) {
      $('#windows-download-link').href = product.windows.url;
      $('#windows-package-size').textContent = '.exe · ' + (product.windows.sizeBytes / (1024 * 1024)).toFixed(1) + ' MiB';
      $('#windows-package-bytes').textContent = product.windows.sizeBytes.toLocaleString('zh-CN');
      $('#windows-package-sha256').textContent = product.windows.sha256;
    }
  }));

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
