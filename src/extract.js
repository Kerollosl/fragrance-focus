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
    return Array.from(card.querySelectorAll('div.cursor-pointer')).map(el => {
      const spans = Array.from(el.querySelectorAll('span')).map(text).filter(Boolean);
      const label = spans.find(s => /^[a-z][a-z\s-]*$/i.test(s));
      const countText = spans.find(s => number(s) !== null);
      return label && countText ? { label: label.toLowerCase(), count: number(countText), countText } : null;
    }).filter(Boolean);
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
    const cards = Array.from(product?.querySelectorAll('.tw-rating-card') || []);
    const wear = voteItems(cards.find(el => /when to wear/i.test(text(el.querySelector('.tw-rating-card-label')))));
    const performance = ['Longevity', 'Sillage', 'Gender', 'Price value'].map(label => {
      const card = cards.find(el => text(el.querySelector('.tw-rating-card-label')).toLowerCase() === label.toLowerCase());
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
  const api = { clean, number, perfumeURL, safeURL, leading, voteItems, extract };
  root.FragranceFocus = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
