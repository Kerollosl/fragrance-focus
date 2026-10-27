const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
test('session lifecycle scopes and clears blocking across navigation, settings, and close',async()=>{
  const events={}; let rules=[]; let blockAds=true;
  const perfume='https://www.fragrantica.com/perfume/Lattafa-Perfumes/Khamrah-75805.html';
  const tabs=[{id:1187758784,url:perfume},{id:5,url:'https://www.fragrantica.com/designers/Lattafa.html'},{id:8,url:perfume}];
  const event = key => ({addListener:fn=>{events[key]=fn;}});
  const context = vm.createContext({URL,console,chrome:{
    storage:{local:{get:async()=>({blockAds})},onChanged:event('settings')},
    tabs:{query:async()=>tabs,onUpdated:event('updated'),onRemoved:event('removed')},
    runtime:{onInstalled:event('installed'),onStartup:event('startup')},
    declarativeNetRequest:{getSessionRules:async()=>rules,updateSessionRules:async({removeRuleIds,addRules})=>{
      rules=rules.filter(r=>!removeRuleIds.includes(r.id)).concat(addRules);
      assert.equal(new Set(rules.map(r=>r.id)).size,rules.length);
    }}
  }});
  context.importScripts=(...files)=>files.forEach(file=>vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),context));
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/background.js'),'utf8'),context);
  const flush=()=>vm.runInContext('queue',context);
  await flush(); assert.equal(rules.length,4);
  assert.equal(rules.some(r=>r.condition.tabIds.includes(5)),false);
  events.updated(1187758784,{url:'https://www.fragrantica.com/'},{url:'https://www.fragrantica.com/'});
  await flush(); assert.equal(rules.length,2);
  events.updated(5,{url:perfume},{url:perfume}); await flush(); assert.equal(rules.length,4);
  events.removed(8); await flush(); assert.equal(rules.length,2);
  blockAds=false; events.settings({blockAds:{newValue:false}},'local'); await flush(); assert.equal(rules.length,0);
});
