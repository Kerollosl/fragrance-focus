const {test} = require('node:test');
const assert = require('node:assert/strict');
const F = require('../src/extract');
const {rulesForTab,adDomains} = require('../src/rules');

test('matches only HTTPS English perfume detail pages',()=>{
  assert.equal(F.perfumeURL('https://www.fragrantica.com/perfume/Lattafa-Perfumes/Khamrah-75805.html'),true);
  assert.equal(F.perfumeURL('https://www.fragrantica.com/perfume/French-Avenue/Liquid-Brun-94713.html?x=1'),true);
  for(const url of ['https://www.fragrantica.com/','https://www.fragrantica.com/designers/Lattafa-Perfumes.html','https://www.fragrantica.com/perfume/','https://www.fragrantica.com/perfume/x/not-a-detail.html','https://evil.com/perfume/x/a-1.html','http://www.fragrantica.com/perfume/x/a-1.html','invalid']) assert.equal(F.perfumeURL(url),false,url);
});
test('parses full and abbreviated vote counts without inventing missing values',()=>{
  for(const [value,expected] of [['31,330',31330],['16.7k',16700],['2M',2000000],['0',0],['',null],['Not available',null],['53.3%',null]]) assert.equal(F.number(value),expected);
});
test('only returns safe source links and fragrance image hosts',()=>{
  const base='https://www.fragrantica.com/';
  assert.equal(F.safeURL('/notes/Cinnamon-65.html',base),base+'notes/Cinnamon-65.html');
  assert.equal(F.safeURL('https://fimgs.net/bottle.jpg',base,true),'https://fimgs.net/bottle.jpg');
  for(const value of [undefined,null,'','javascript:alert(1)','https://evil.com/a','https://www.fragrantica.com.evil.com/a']) assert.equal(F.safeURL(value,base), '');
});
test('season ranking excludes day/night and empty votes',()=>{
  const votes=[{label:'day',count:99},{label:'summer',count:0},{label:'fall',count:12},{label:'winter',count:20}];
  assert.deepEqual(F.leading(votes,['winter','spring','summer','fall']).map(v=>v.label),['winter','fall']);
});
test('ad rules target one tab, never main-frame navigation or bottle image host',()=>{
  const rules=rulesForTab(1187758784,true,9);
  assert.deepEqual(rules.map(r=>r.id),[9,10]);
  for(const rule of rules) { assert.deepEqual(rule.condition.tabIds,[1187758784]); assert.equal(rule.condition.resourceTypes.includes('main_frame'),false); }
  assert.equal(adDomains.includes('fimgs.net'),false);
  assert.deepEqual(rules[1].condition.resourceTypes,['sub_frame']);
  assert.deepEqual(rulesForTab(2,false),[]);
  assert.deepEqual(rulesForTab(-1,true),[]);
});
