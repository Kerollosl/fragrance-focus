(function () {
  'use strict';
  const F = globalThis.FragranceFocus;
  const preview = location.hostname === '127.0.0.1' && document.documentElement.dataset.ffPreview === 'true';
  if (!preview && !F.perfumeURL(location.href)) return;
  // One controller per document, even if duplicate unpacked copies are enabled.
  if (document.documentElement.hasAttribute('data-ff-controller')) return;
  document.documentElement.setAttribute('data-ff-controller', 'native-v2');
  let settings = { reader: true, blockAds: true };
  let product, host, signature = '', timer;
  const $ = selector => host?.querySelector(selector);
  function sectionOf(el) {
    if (!el || !product?.contains(el)) return null;
    while (el.parentElement !== product) { el = el.parentElement; if (!el) return null; }
    return el;
  }
  function mark(el, type) { const section = sectionOf(el); if (section) section.dataset.ffSection = type; return section; }
  function classify() {
    mark(product.querySelector('h1'), 'identity');
    mark(product.querySelector('img[itemprop="image"]'), 'bottle');
    mark(product.querySelector('[itemprop="aggregateRating"]'), 'votes');
    mark(product.querySelector('#perfume-description-content'), 'description');
    mark(product.querySelector('#pyramid'), 'notes');
    mark(product.querySelector('#performance'), 'performance');
    mark(product.querySelector('#demographics'), 'value');
    mark(product.querySelector('#fragram-photos'), 'photos');
    mark(product.querySelector('#newreview'), 'write-review');
    for (const heading of product.querySelectorAll('h3')) {
      const text = F.clean(heading.textContent);
      if (text === 'What People Say') mark(heading, 'verdict');
      else if (/People who like this also like/i.test(text)) mark(heading, 'related');
      else if (/^Designer\s/.test(text)) mark(heading, 'designer');
      else if (/\bNews$/.test(text)) mark(heading, 'news');
      else if (/^Collections\s/.test(text)) mark(heading, 'collection');
      else if (/This perfume reminds me of/i.test(text)) mark(heading, 'similar');
    }
    for (const card of product.querySelectorAll('.tw-rating-card')) {
      const label = F.clean(card.querySelector('.tw-rating-card-label')?.textContent);
      if (/longevity|sillage/i.test(label)) mark(card, 'performance');
      else if (/gender|price value/i.test(label)) mark(card, 'value');
    }
    for (const ad of product.querySelectorAll('.perfume-offer-box,.sliding-ad-container,.freeStarFragrantica,iframe[src*="c.fimgs.net"],.affiliate-disclosure')) {
      const section = sectionOf(ad);
      if (section && !section.dataset.ffSection) section.dataset.ffSection = 'ad';
    }
    for (const child of product.children) {
      if (child.querySelector('[itemprop="reviewBody"]') || child.querySelector('[itemtype$="schema.org/Review"]')) child.dataset.ffSection = 'reviews';
    }
    const parent = product.parentElement;
    parent?.classList.add('ff-column');
    parent?.parentElement?.classList.add('ff-columns');
    parent?.closest('main')?.classList.add('ff-main');
    if (parent?.parentElement) for (const sibling of parent.parentElement.children) {
      if (sibling !== parent && (sibling.tagName === 'ASIDE' || sibling.classList.contains('sm:col-span-3'))) sibling.classList.add('ff-sidebar');
    }
  }
  function jump(section) {
    const behavior = matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth';
    if (section === 'overview') { product.querySelector('h1')?.scrollIntoView({ behavior, block:'start' }); return; }
    let target = product.querySelector(`[data-ff-section="${section}"]`);
    if (section === 'reviews') {
      target ||= product.querySelector('.reviewstrigger') || product.querySelector('#newreview');
    }
    if (!target) { $('#ff-status').textContent = `The ${section} section has not loaded on this page yet.`; return; }
    target.scrollIntoView({ behavior, block:'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
    $('#ff-status').textContent = '';
  }
  function applySettings() {
    document.documentElement.classList.toggle('ff-reader-on', settings.reader);
    document.documentElement.classList.toggle('ff-block-ads', settings.blockAds);
    const toggle = $('#ff-layout-toggle');
    if (toggle) { toggle.textContent = settings.reader ? 'Original spacing' : 'Organize page'; toggle.setAttribute('aria-pressed', String(settings.reader)); }
  }
  async function toggleReader() {
    settings.reader = !settings.reader;
    applySettings();
    try { if (!preview) await chrome.storage.local.set({reader:settings.reader}); }
    catch { $('#ff-status').textContent = 'Layout changed for this page. Reload the extension to save this preference.'; }
  }
  function render(data) {
    const available = [
      ['overview', 'Overview'], ['votes', 'Ratings & wear'], ['notes', 'Notes'],
      ['performance', 'Performance'], ['verdict', 'Pros & cons'], ['reviews', 'Reviews'], ['similar', 'Similar scents']
    ].filter(([key]) => {
      const target = product.querySelector(`[data-ff-section="${key}"]`);
      return key === 'overview' || (target && F.clean(target.textContent)) || (key === 'reviews' && product.querySelector('.reviewstrigger,#newreview'));
    });
    host.innerHTML = `<div class="ff-toolbar"><nav class="ff-nav" aria-label="Fragrance page sections">${available.map(([key,label])=>`<button type="button" data-jump="${key}">${label}</button>`).join('')}</nav><button id="ff-layout-toggle" type="button"></button></div><p id="ff-status" class="ff-status" role="status"></p>`;
    $('#ff-layout-toggle').addEventListener('click', toggleReader);
    for (const button of host.querySelectorAll('[data-jump]')) button.addEventListener('click',()=>jump(button.dataset.jump));
    applySettings();
  }
  function refresh() {
    if (!preview && !F.perfumeURL(location.href)) {
      document.documentElement.classList.remove('ff-reader-on','ff-block-ads');
      host?.remove(); return;
    }
    const data = F.extract(document, preview ? 'https://www.fragrantica.com/' : location.href);
    if (!data.product || !data.name || (!data.accords.length && !data.notes.length)) return;
    if (product !== data.product || !host?.isConnected) {
      host?.remove(); product = data.product; product.classList.add('ff-product');
      // Only a small navigator is generated. All fragrance content remains native.
      host = document.createElement('div'); host.id = 'ff-reader';
      const identity = sectionOf(product.querySelector('h1'));
      identity ? identity.after(host) : product.prepend(host);
      signature = '';
    }
    classify();
    const {product:ignored, ...model} = data;
    const next = JSON.stringify([model, Array.from(product.children).map(el=>el.dataset.ffSection || '')]);
    if (next !== signature) { signature = next; render(data); }
  }
  const observer = new MutationObserver(records => {
    if (records.every(r=>r.target === host || host?.contains(r.target))) return;
    if (product?.isConnected && records.every(r=>{
      const el = r.target.nodeType === 1 ? r.target : r.target.parentElement;
      return !product.contains(r.target) || el?.closest('.sliding-ad-container,.freeStarFragrantica,[data-ff-section="ad"]');
    })) return;
    if (timer) return;
    timer = setTimeout(()=>{timer=null;refresh();},180);
  });
  async function start() {
    if (!preview) {
      try { Object.assign(settings,await chrome.storage.local.get(['reader','blockAds'])); }
      catch { /* Defaults keep the page usable when extension context is invalidated. */ }
      chrome.storage.onChanged.addListener((changes,area)=>{
        if(area !== 'local') return;
        for(const key of ['reader','blockAds']) if(changes[key]) settings[key] = changes[key].newValue !== false;
        applySettings();
      });
    }
    document.documentElement.classList.toggle('ff-block-ads', settings.blockAds);
    observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['src','content']});
    refresh();
  }
  start();
})();
