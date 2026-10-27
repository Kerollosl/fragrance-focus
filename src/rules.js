(function (root) {
  'use strict';
  const adDomains = [
    'doubleclick.net', 'googlesyndication.com', 'googletagservices.com', 'freestar.com', 'freestar.io',
    'btloader.com', 'pubmatic.com', 'rubiconproject.com', 'adsrvr.org', 'adnxs.com', 'criteo.com',
    'criteo.net', 'amazon-adsystem.com', 'primis.tech', 'sharethrough.com', 'openx.net', 'lijit.com', '3lift.com'
  ];
  function rulesForTab(tabId, enabled, firstId = 1) {
    if (!enabled || !Number.isInteger(tabId) || tabId < 0) return [];
    return [
      { id: firstId, priority: 1, action: { type: 'block' }, condition: {
        tabIds: [tabId], requestDomains: adDomains,
        resourceTypes: ['sub_frame', 'script', 'xmlhttprequest', 'image', 'media', 'ping', 'other', 'stylesheet', 'font', 'websocket']
      } },
      { id: firstId + 1, priority: 1, action: { type: 'block' }, condition: {
        tabIds: [tabId], requestDomains: ['c.fimgs.net'], resourceTypes: ['sub_frame']
      } }
    ];
  }
  root.FragranceFocusNetwork = { adDomains, rulesForTab };
  if (typeof module !== 'undefined') module.exports = root.FragranceFocusNetwork;
})(globalThis);
