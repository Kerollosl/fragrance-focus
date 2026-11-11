'use strict';
const status = text => { document.getElementById('status').textContent = text; };
// Ad blocking is applied while a page loads, so reload the active perfume tab for the change to take effect.
async function reloadActivePerfumeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && FragranceFocus.perfumeURL(tab.url)) { await chrome.tabs.reload(tab.id); return true; }
  return false;
}
async function init() {
  const settings = await chrome.storage.local.get({reader:true,blockAds:true});
  for (const key of ['reader','blockAds']) {
    const input = document.getElementById(key); input.checked = settings[key];
    input.addEventListener('change',async()=>{
      try {
        await chrome.storage.local.set({[key]:input.checked});
        status('Preference saved.');
        if (key === 'blockAds' && await reloadActivePerfumeTab()) status('Preference saved. Page reloaded.');
      } catch { input.checked = !input.checked; status('Could not save. Please reopen the popup.'); }
    });
  }
}
init().catch(()=>status('Could not load preferences. Please reopen the popup.'));
