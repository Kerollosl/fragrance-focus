(function () {
  'use strict';
  const F = globalThis.FragranceFocus;
  const S = F.SELECTORS;
  const preview = location.hostname === '127.0.0.1' && document.documentElement.dataset.ffPreview === 'true';
  if (!preview && !F.perfumeURL(location.href)) return;
  // One controller per document, even if duplicate unpacked copies are enabled.
  if (document.documentElement.hasAttribute('data-ff-controller')) return;
  document.documentElement.setAttribute('data-ff-controller', 'clarity-v3');
  let settings = { reader: true, blockAds: true };
  let product, host, insights, signature = '', timer, showVotes = false;
  const disclosures = new WeakSet();
  const $ = selector => host?.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const capitalize = value => value.charAt(0).toUpperCase() + value.slice(1);
  function sectionOf(el) {
    if (!el || !product?.contains(el)) return null;
    while (el.parentElement !== product) { el = el.parentElement; if (!el) return null; }
    return el;
  }
  function mark(el, type) { const section = sectionOf(el); if (section) section.dataset.ffSection = type; return section; }
  function classify() {
    mark(product.querySelector(S.heading), 'identity');
    mark(product.querySelector(S.bottleImage), 'bottle');
    mark(product.querySelector(S.rating), 'votes');
    mark(product.querySelector(S.description), 'description');
    mark(product.querySelector(S.notes), 'notes');
    mark(product.querySelector(S.performance), 'performance');
    mark(product.querySelector(S.demographics), 'value');
    mark(product.querySelector(S.photos), 'photos');
    mark(product.querySelector(S.community), 'photos');
    mark(product.querySelector(S.newReview), 'write-review');
    for (const heading of product.querySelectorAll('h3')) {
      const text = F.clean(heading.textContent);
      if (text === 'What People Say') mark(heading, 'verdict');
      else if (/People who like this also like/i.test(text)) mark(heading, 'related');
      else if (/^Designer\s/.test(text)) mark(heading, 'designer');
      else if (/\bNews$/.test(text)) mark(heading, 'news');
      else if (/^Collections\s/.test(text)) mark(heading, 'collection');
      else if (/reminds me of|similar (perfumes|fragrances|scents)|compare (with|to)/i.test(text)) mark(heading, 'similar');
    }
    // Any other carousel the page lazy-loads under a heading we do not know: keep it visible, unfolded,
    // and placed with the other carousels below the composition, instead of leaving it unclassified.
    for (const child of product.children) {
      const type = child.dataset.ffSection;
      if (type && type !== 'ad' && type !== 'carousel') continue;
      if (child.querySelector('.carousel-scroll-btn') && child.querySelectorAll('a[href*="/perfume/"]').length >= 3) child.dataset.ffSection = 'carousel';
    }
    for (const card of product.querySelectorAll(S.voteCards)) {
      const label = F.cardLabel(card);
      if (/longevity|sillage/i.test(label)) mark(card, 'performance');
      else if (/gender|price value/i.test(label)) mark(card, 'value');
    }
    for (const ad of product.querySelectorAll(S.adBlocks)) {
      const section = sectionOf(ad);
      if (section && !section.dataset.ffSection) section.dataset.ffSection = 'ad';
    }
    for (const child of product.children) {
      if (child.querySelector(S.reviewBody) || child.querySelector(S.reviewItem)) child.dataset.ffSection = 'reviews';
    }
    const parent = product.parentElement;
    parent?.classList.add('ff-column');
    parent?.parentElement?.classList.add('ff-columns');
    parent?.closest('main')?.classList.add('ff-main');
    if (parent?.parentElement) for (const sibling of parent.parentElement.children) {
      if (sibling !== parent && (sibling.tagName === 'ASIDE' || sibling.classList.contains('sm:col-span-3'))) sibling.classList.add('ff-sidebar');
    }
    // Only known, populated sections are folded. Empty Vue/lazy wrappers stay mounted.
    // Carousels (reminds me of, also like, other editions, news, designer, unknown ones) are never folded.
    const folds = {description:'About this fragrance', photos:'Community photos'};
    for (const [type,label] of Object.entries(folds)) {
      const section = product.querySelector(`:scope > [data-ff-section="${type}"]`);
      if (!section || !F.clean(section.textContent)) continue;
      const previous = section.querySelector(':scope > .ff-disclosure');
      if (previous && disclosures.has(previous)) continue;
      previous?.remove();
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'ff-disclosure';
      button.textContent = label; button.setAttribute('aria-expanded',String(section.classList.contains('ff-expanded')));
      button.addEventListener('click',()=>{
        const open = section.classList.toggle('ff-expanded');
        button.setAttribute('aria-expanded',String(open));
      });
      section.classList.add('ff-fold'); section.prepend(button); disclosures.add(button);
    }
  }
  function jump(section) {
    const behavior = matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth';
    if (section === 'overview') { product.querySelector(S.heading)?.scrollIntoView({ behavior, block:'start' }); return; }
    let target = product.querySelector(`[data-ff-section="${section}"]`);
    // "Similar scents" falls back to the "People who like this also like" carousel when the page has no
    // dedicated reminds-me-of section.
    if (section === 'similar') target ||= product.querySelector('[data-ff-section="related"]');
    if (section === 'reviews') {
      target ||= product.querySelector(S.reviewsTrigger) || product.querySelector(S.newReview);
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
    if (toggle) { toggle.textContent = settings.reader ? 'Original page' : 'Organize page'; toggle.setAttribute('aria-pressed', String(settings.reader)); }
  }
  function updateNativeCharts(data) {
    // Keep the site's colorful, labeled charts and emoji controls as the evidence.
    for (const card of product.querySelectorAll(S.voteCards)) {
      const label = F.cardLabel(card);
      const result = F.distribution(F.voteItems(card));
      let summary = card.querySelector('.ff-community-summary');
      if (!label || !result) { summary?.remove(); continue; }
      let headline, detail;
      if (/^rating$/i.test(label)) {
        const positive = result.items.filter(item=>['love','like'].includes(item.label)).reduce((sum,item)=>sum+item.count,0);
        headline = `≈${Math.round(positive / result.total * 100)}% love or like it`;
        detail = 'of reaction votes';
      } else if (/when to wear/i.test(label)) {
        const seasons = F.distribution(data.wear.filter(item=>['winter','spring','summer','fall'].includes(item.label)));
        const times = F.distribution(data.wear.filter(item=>['day','night'].includes(item.label)));
        const winners = [seasons,times].filter(Boolean).map(group=>group.leaders.map(item=>capitalize(item.label)).join(' / '));
        headline = `Most votes: ${winners.join(' · ')}`;
        detail = 'season and time voted separately';
      } else {
        const winners = result.leaders.map(item=>capitalize(item.label)).join(' / ');
        headline = `${result.total < 20 ? 'Early votes' : result.leaders.length > 1 ? 'Tied' : 'Most votes'}: ${winners}`;
        const total = new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(result.total);
        detail = `≈${Math.round(result.leaders[0].count / result.total * 100)}% of ${total} votes`;
      }
      if (!summary) {
        summary = document.createElement('div'); summary.className = 'ff-community-summary';
        const header = card.querySelector(S.ratingCardHeader);
        const title = Array.from(card.querySelectorAll('span')).find(el=>F.clean(el.textContent).toLowerCase() === label.toLowerCase());
        if (header) header.after(summary);
        else if (title && title.parentElement !== card) title.parentElement.after(summary);
        else if (title) title.after(summary);
        else card.prepend(summary);
      }
      const html = `<strong>${escape(headline)}</strong><span>${escape(detail)}</span>`;
      if (summary.innerHTML !== html) summary.innerHTML = html;
      for (const slider of card.querySelectorAll(S.slider)) slider.parentElement.classList.add('ff-personal-vote');
    }
  }
  function renderInsights(data) {
    updateNativeCharts(data);
    const rating = data.rating !== null && data.rating >= 0 && data.rating <= 5;
    $('#ff-takeaway').innerHTML = `<div class="ff-insight-heading"><div><p class="ff-eyebrow">The scent in a sentence</p><h2>${escape(F.takeaway(data))}</h2></div>${rating ? `<div class="ff-rating" aria-label="Community rating ${data.rating} out of 5"><strong>${data.rating.toFixed(2)}<small>/5</small></strong>${data.ratingCount !== null ? `<span>${data.ratingCount.toLocaleString('en-US')} ratings</span>` : ''}</div>` : ''}</div>`;
    const hasSliders = !!product.querySelector('.ff-personal-vote');
    insights.innerHTML = hasSliders ? `<button type="button" id="ff-votes-toggle" aria-expanded="${showVotes}">${showVotes ? 'Hide personal voting sliders' : 'Show personal voting sliders'}</button>` : '';
    insights.hidden = !hasSliders;
    insights.querySelector('#ff-votes-toggle')?.addEventListener('click',event=>{
      showVotes = !showVotes;
      product.classList.toggle('ff-show-votes',showVotes);
      event.currentTarget.textContent = showVotes ? 'Hide personal voting sliders' : 'Show personal voting sliders';
      event.currentTarget.setAttribute('aria-expanded',String(showVotes));
    });
  }
  async function toggleReader() {
    settings.reader = !settings.reader;
    applySettings();
    try { if (!preview) await chrome.storage.local.set({reader:settings.reader}); }
    catch { $('#ff-status').textContent = 'Layout changed for this page, but your preference could not be saved. Reload the page and try again.'; }
  }
  function render(data) {
    const active = document.activeElement;
    const focusSelector = host.contains(active) || insights.contains(active) ?
      (active.id ? `#${active.id}` : active.dataset.jump ? `[data-jump="${active.dataset.jump}"]` : '') : '';
    const available = [
      ['overview', 'Overview'], ['performance', 'Performance'], ['notes', 'Notes'], ['reviews', data.reviewLabel || 'Reviews'], ['similar', 'Similar scents']
    ].filter(([key]) => {
      const target = product.querySelector(`[data-ff-section="${key}"]`) || (key === 'similar' ? product.querySelector('[data-ff-section="related"]') : null);
      return key === 'overview' || (target && F.clean(target.textContent)) || (key === 'reviews' && product.querySelector(`${S.reviewsTrigger},${S.newReview}`));
    });
    host.innerHTML = `<div class="ff-toolbar"><nav class="ff-nav" aria-label="Fragrance page sections">${available.map(([key,label])=>`<button type="button" data-jump="${key}">${escape(label)}</button>`).join('')}</nav><button id="ff-layout-toggle" type="button"></button></div><p id="ff-status" class="ff-status" role="status"></p><section id="ff-takeaway" aria-label="Fragrance takeaway"></section>`;
    $('#ff-layout-toggle').addEventListener('click', toggleReader);
    for (const button of host.querySelectorAll('[data-jump]')) button.addEventListener('click',()=>jump(button.dataset.jump));
    renderInsights(data);
    applySettings();
    if (focusSelector) product.querySelector(focusSelector)?.focus({preventScroll:true});
  }
  let passes = 0;
  function refresh() {
    document.documentElement.dataset.ffPasses = String(++passes); // diagnostic: how often the controller re-ran
    if (!preview && !F.perfumeURL(location.href)) {
      document.documentElement.classList.remove('ff-reader-on','ff-block-ads');
      host?.remove(); insights?.remove(); return;
    }
    const data = F.extract(document, preview ? 'https://www.fragrantica.com/' : location.href);
    if (!data.product || !data.name || (!data.accords.length && !data.notes.length)) {
      // Fail soft: if the page layout is not recognised, leave Fragrantica exactly as it is.
      if (host || insights) {
        document.documentElement.classList.remove('ff-reader-on');
        host?.remove(); insights?.remove(); host = insights = undefined; signature = '';
      }
      document.documentElement.dataset.ffState = 'page-not-recognised';
      return;
    }
    delete document.documentElement.dataset.ffState;
    // Site hydration can clone previously inserted UI. Keep only the live controller's nodes.
    for (const node of data.product.querySelectorAll('#ff-reader,#ff-insights')) {
      if (node !== host && node !== insights) node.remove();
    }
    if (product !== data.product || !host?.isConnected || !insights?.isConnected) {
      host?.remove(); insights?.remove(); product = data.product; product.classList.add('ff-product');
      // Read-only charts supplement native source nodes; Vue voting controls never move.
      host = document.createElement('div'); host.id = 'ff-reader';
      const identity = sectionOf(product.querySelector(S.heading));
      identity ? identity.after(host) : product.prepend(host);
      insights = document.createElement('section'); insights.id = 'ff-insights';
      insights.setAttribute('aria-label','Fragrance at a glance'); host.after(insights);
      signature = '';
    }
    classify();
    const {product:ignored, ...model} = data;
    const next = JSON.stringify([model, product.querySelectorAll(S.slider).length, Array.from(product.children).map(el=>el.dataset.ffSection || '')]);
    if (next !== signature) { signature = next; render(data); }
    else updateNativeCharts(data);
    watch();
  }
  const observer = new MutationObserver(records => {
    if (product && !product.isConnected) watch();
    if (records.every(r=>r.target === host || host?.contains(r.target) || r.target === insights || insights?.contains(r.target) || r.target.classList?.contains('ff-disclosure') || r.target.closest?.('.ff-community-summary'))) return;
    if (product?.isConnected && records.every(r=>{
      const el = r.target.nodeType === 1 ? r.target : r.target.parentElement;
      return !product.contains(r.target) || el?.closest(S.adContainers);
    })) return;
    if (timer) return;
    timer = setTimeout(()=>{timer=null;refresh();},180);
  });
  const OBSERVE = {childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['src','content']};
  let watched;
  // Watch the whole document only until the product container exists; then watch just that container
  // (plus its parent's direct children, to notice the container being replaced).
  function watch() {
    const target = product?.isConnected ? product : document.documentElement;
    if (watched === target) return;
    observer.disconnect(); watched = target;
    observer.observe(target, OBSERVE);
    if (target === product && product.parentElement) observer.observe(product.parentElement, {childList:true});
  }
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
    watch();
    refresh();
    startSafetyNet();
  }
  // Lazy sections (carousels especially) can mount after the observer has stopped reporting, so also
  // re-check the page shape on scroll and for the first minute. It is a cheap count comparison; a full
  // refresh only runs when the number of sections, carousels or headings has changed.
  function startSafetyNet() {
    const shape = () => product?.isConnected ? `${product.children.length}:${product.querySelectorAll('.carousel-scroll-btn').length}:${product.querySelectorAll('h3').length}` : '';
    let last = shape(), waiting = false;
    document.documentElement.dataset.ffNet = 'on'; // diagnostic
    const check = () => {
      waiting = false;
      document.documentElement.dataset.ffChecks = String((Number(document.documentElement.dataset.ffChecks) || 0) + 1); // diagnostic
      const now = shape();
      if (!now || now === last) return;
      refresh(); last = shape();
    };
    window.addEventListener('scroll', () => { if (!waiting) { waiting = true; setTimeout(check, 500); } }, { passive: true });
    const interval = setInterval(check, 2000);
    setTimeout(() => clearInterval(interval), 60000);
  }
  start();
})();
