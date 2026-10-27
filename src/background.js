/* Session rules are tab-specific: other Fragrantica page types are untouched. */
importScripts('extract.js', 'rules.js');
let queue = Promise.resolve();
const enqueue = work => { queue = queue.then(work).catch(error => console.error('Fragrance Focus:', error)); };

async function updateTab(tabId, url) {
  const { blockAds = true } = await chrome.storage.local.get('blockAds');
  const existing = await chrome.declarativeNetRequest.getSessionRules();
  const removeRuleIds = existing.filter(rule => rule.condition.tabIds?.includes(tabId)).map(rule => rule.id);
  const usedIds = new Set(existing.filter(rule => !removeRuleIds.includes(rule.id)).map(rule => rule.id));
  let firstId = 1;
  while (usedIds.has(firstId) || usedIds.has(firstId + 1)) firstId += 2;
  const addRules = FragranceFocusNetwork.rulesForTab(tabId, blockAds && FragranceFocus.perfumeURL(url), firstId);
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds, addRules });
}
async function syncTabs() {
  const existing = await chrome.declarativeNetRequest.getSessionRules();
  const tabs = await chrome.tabs.query({});
  const { blockAds = true } = await chrome.storage.local.get('blockAds');
  const addRules = tabs.filter(tab => FragranceFocus.perfumeURL(tab.url)).flatMap((tab,index) => FragranceFocusNetwork.rulesForTab(tab.id, blockAds, index * 2 + 1));
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: existing.map(rule => rule.id), addRules });
}
chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (change.url || change.status === 'loading') enqueue(() => updateTab(tabId, change.url || tab.url));
});
chrome.tabs.onRemoved.addListener(tabId => enqueue(() => updateTab(tabId, '')));
chrome.runtime.onInstalled.addListener(() => enqueue(syncTabs));
chrome.runtime.onStartup.addListener(() => enqueue(syncTabs));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.blockAds) enqueue(syncTabs);
});
// Handles a worker restart while existing tabs remain open.
enqueue(syncTabs);
