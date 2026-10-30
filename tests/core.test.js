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
test('vote distributions use counts, preserve zeroes and ties, and keep denominators separate',()=>{
  const wear=[{label:'winter',count:20},{label:'summer',count:5},{label:'day',count:60},{label:'night',count:40}];
  const seasons=F.distribution(wear.filter(v=>['winter','summer'].includes(v.label)));
  assert.equal(seasons.total,25);
  assert.equal(seasons.items[0].share,80);
  assert.equal(F.distribution(wear.filter(v=>['day','night'].includes(v.label))).items[0].share,60);
  assert.equal(F.distribution([{label:'winter',count:0}]),null);
  assert.equal(F.distribution([]),null);
  const tied=F.distribution([{label:'weak',count:50},{label:'strong',count:50},{label:'eternal',count:0}]);
  assert.equal(tied.leaders.length,2);
  assert.equal(tied.items[2].share,0);
});
test('takeaways omit wearing recommendations for sparse or divided votes',()=>{
  const base={accords:[{name:'sweet'},{name:'warm spicy'}],family:'Oriental Spicy',wear:[]};
  assert.equal(F.takeaway(base),'Sweet with warm spice.');
  for(const wear of [
    [{label:'winter',count:4},{label:'summer',count:1}],
    [{label:'winter',count:50},{label:'summer',count:50}],
    [{label:'winter',count:51},{label:'summer',count:49}]
  ]) assert.equal(F.takeaway({...base,wear}),F.takeaway(base));
  assert.equal(F.takeaway({...base,wear:[{label:'winter',count:90},{label:'summer',count:10},{label:'night',count:80},{label:'day',count:20}]}),'Sweet with warm spice. Most wear votes: winter · night.');
  assert.equal(F.takeaway({accords:[],wear:[],family:''}),'');
  assert.equal(F.takeaway({...base,accords:[{name:'vanilla'},{name:'sweet'}],family:'Oriental Fougere'}),'Sweet vanilla.');
  assert.equal(F.takeaway({...base,wear:[{label:'winter',count:48},{label:'fall',count:38},{label:'spring',count:9},{label:'summer',count:5},{label:'night',count:70},{label:'day',count:30}]}),'Sweet with warm spice. Most wear votes: fall & winter · night.');
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
