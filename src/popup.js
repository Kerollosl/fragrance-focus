'use strict';
async function init() {
  const settings = await chrome.storage.local.get({reader:true,blockAds:true});
  for (const key of ['reader','blockAds']) {
    const input = document.getElementById(key); input.checked = settings[key];
    input.addEventListener('change',async()=>{
      try { await chrome.storage.local.set({[key]:input.checked}); document.getElementById('status').textContent = 'Preference saved.'; }
      catch { input.checked = !input.checked; document.getElementById('status').textContent = 'Could not save. Please reopen the popup.'; }
    });
  }
}
init().catch(()=>{document.getElementById('status').textContent='Could not load preferences. Please reopen the popup.';});
