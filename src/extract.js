/* Shared, DOM-only extraction. Never reads site stores, cookies, or account data. */
(function (root) {
  'use strict';
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const text = el => clean(el?.textContent);
  const number = value => {
    const match = clean(value).replace(/,/g, '').match(/^(\d+(?:\.\d+)?)\s*([km])?$/i);
    return match ? Number(match[1]) * ({ k: 1000, m: 1000000 }[match[2]?.toLowerCase()] || 1) : null;
  };
  const perfumeURL = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'www.fragrantica.com' && /^\/perfume\/[^/]+\/[^/]+-\d+\.html$/.test(url.pathname);
    } catch { return false; }
  };
  function safeURL(value, base, image = false) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value, base);
      const hosts = image ? ['fimgs.net', 'www.fragrantica.com'] : ['www.fragrantica.com'];
      return url.protocol === 'https:' && hosts.includes(url.hostname) ? url.href : '';
    } catch { return ''; }
  }
  function voteItems(card) {
    if (!card) return [];
    // Read rendered labels and counts, not the visual bar width (which is normalized).
    const controls = Array.from(card.querySelectorAll('div.cursor-pointer'));
    return controls.map(control => {
      // Performance labels/counts are siblings of the clickable bar, unlike wear votes.
      const el = card.classList.contains('tw-perf-card') ? control.parentElement?.parentElement : control;
      const spans = Array.from(el.querySelectorAll('span')).map(text).filter(Boolean);
      const label = spans.find(s => /^[a-z][a-z\s-]*$/i.test(s));
      const countText = spans.find(s => number(s) !== null);
      return label && countText ? { label: label.toLowerCase(), count: number(countText), countText } : null;
    }).filter(Boolean);
  }
  function cardLabel(card) {
    return text(card.querySelector('.tw-rating-card-label')) ||
      Array.from(card.querySelectorAll('span')).map(text).find(label => /^(longevity|sillage|gender|price value)$/i.test(label)) || '';
  }
  function distribution(items) {
    const valid = items.filter(item => Number.isFinite(item.count) && item.count >= 0);
    const total = valid.reduce((sum, item) => sum + item.count, 0);
    if (!total) return null;
    const max = Math.max(...valid.map(item => item.count));
    const leaders = valid.filter(item => item.count === max);
    return { total, items: valid.map(item => ({...item, share:item.count / total * 100})), leaders };
  }
  function preference(items, labels) {
    const result = distribution(items.filter(item => labels.includes(item.label)));
    if (!result) return '';
    // Avoid turning a narrow lead, tie, or a handful of votes into a recommendation.
    if (result.total < 20) return '';
    const ranked = [...result.items].sort((a,b) => b.count - a.count);
    if (ranked.length < 2 || ranked[0].share - ranked[1].share < 10) return '';
    return ranked[0].label;
  }
  function takeaway(data) {
    const names = data.accords.slice(0, 2).map(item => item.name.toLowerCase());
    const nouns = {'warm spicy':'warm spice','fresh spicy':'fresh spice','sweet':'sweetness','woody':'woods','fruity':'fruit','floral':'floral notes','powdery':'powdery notes','aromatic':'aromatic notes','musky':'musk','green':'green notes'};
    const scent = names.includes('vanilla') && names.includes('sweet') ? 'Sweet vanilla' :
      names.length ? `${names[0].charAt(0).toUpperCase() + names[0].slice(1)}${names[1] ? ` with ${nouns[names[1]] || names[1]}` : ''}` : '';
    const seasons = distribution(data.wear.filter(item=>['winter','spring','summer','fall'].includes(item.label)));
    let season = preference(data.wear, ['winter','spring','summer','fall']);
    if (seasons?.total >= 20) {
      for (const pair of [['fall','winter'],['spring','summer']]) {
        const members = seasons.items.filter(item=>pair.includes(item.label));
        if (members.length === 2 && members.every(item=>item.share >= 20) && members.reduce((sum,item)=>sum+item.share,0) >= 70) season = pair.join(' & ');
      }
    }
    const time = preference(data.wear, ['day','night']);
    const context = [season,time].filter(Boolean).join(' · ');
    if (scent && context) return `${scent}. Most wear votes: ${context}.`;
    if (scent) return `${scent}.`;
    return data.family ? `${data.family} fragrance.` : '';
  }
  function leading(items, labels) {
    return items.filter(item => labels.includes(item.label) && item.count > 0).sort((a, b) => b.count - a.count);
  }
  function extract(doc, base = doc.baseURI) {
    const product = doc.querySelector('[itemscope][itemtype$="schema.org/Product"]');
    const h1 = product?.querySelector('h1');
    const image = product?.querySelector('img[itemprop="image"]');
    const brandEl = product?.querySelector('[itemprop="brand"]');
    const brand = text(brandEl?.querySelector('[itemprop="name"]')) || text(brandEl?.querySelector('a'));
    const fullName = h1 ? clean(Array.from(h1.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(' ')) : '';
    const audience = text(h1?.querySelector('span'));
    const name = brand && fullName.endsWith(brand) ? clean(fullName.slice(0, -brand.length)) : fullName;
    const description = text(doc.querySelector('#perfume-description-content p')) || text(doc.querySelector('#perfume-description-content'));
    const year = description.match(/(?:launched|released) in (\d{4})\b/i)?.[1] || '';
    const family = description.match(/\bis (?:a|an) (.+?) fragrance\b/i)?.[1] || '';
    const accordHeading = Array.from(product?.querySelectorAll('h6') || []).find(el => /main accords/i.test(text(el)));
    const accords = Array.from(accordHeading?.parentElement?.querySelectorAll('div[style*="width:"]') || []).map(el => ({
      name: text(el), strength: Math.max(0, Math.min(100, parseFloat(el.style.width) || 0))
    })).filter(item => item.name && item.name.length < 45 && item.strength > 0);
    const cards = Array.from(product?.querySelectorAll('.tw-rating-card,.tw-perf-card') || []);
    const wear = voteItems(cards.find(el => /when to wear/i.test(cardLabel(el))));
    const performance = ['Longevity', 'Sillage', 'Gender', 'Price value'].map(label => {
      const card = cards.find(el => cardLabel(el).toLowerCase() === label.toLowerCase());
      return { label, items: voteItems(card) };
    });
    const notes = Array.from(doc.querySelectorAll('#pyramid h4')).map(heading => {
      const group = heading.parentElement?.parentElement;
      return { stage: text(heading), notes: Array.from(group?.querySelectorAll('a[href*="/notes/"]') || []).map(a => ({
        name: text(a), href: safeURL(a.getAttribute('href'), base), image: safeURL(a.querySelector('img')?.getAttribute('src'), base, true)
      })) };
    }).filter(group => group.notes.length);
    const rating = number(text(product?.querySelector('[itemprop="ratingValue"]')));
    const countEl = product?.querySelector('[itemprop="ratingCount"]');
    const ratingCount = number(countEl?.getAttribute('content') || text(countEl));
    const reviewLink = product?.querySelector('a[href*="#all-reviews"]') || Array.from(product?.querySelectorAll('a') || []).find(a => /^Reviews\s*\(/i.test(text(a)));
    return {
      product, name, brand, brandURL: safeURL(brandEl?.querySelector('a')?.getAttribute('href'), base), audience, year, family,
      image: safeURL(image?.getAttribute('src'), base, true), rating, ratingCount, reviewLabel: text(reviewLink),
      accords, wear, seasons: leading(wear, ['winter', 'spring', 'summer', 'fall']), times: leading(wear, ['day', 'night']), performance, notes
    };
  }
  const api = { clean, number, perfumeURL, safeURL, leading, voteItems, cardLabel, distribution, preference, takeaway, extract };
  root.FragranceFocus = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
