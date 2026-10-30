'use strict';
if(new URLSearchParams(location.search).has('clean')) document.documentElement.dataset.clean='true';
for(const [name,width] of [['sweet',100],['warm spicy',82.2837],['vanilla',80.5518],['amber',76.1035],['cinnamon',68.8186],['woody',48.737],['fresh spicy',48.2213],['fruity',44.2154]]) {
  const wrapper=document.createElement('div'); const bar=document.createElement('div'); bar.style.width=width+'%'; bar.style.backgroundColor=({'sweet':'#ee363b','warm spicy':'#cc3300','vanilla':'#fffec0','amber':'#bc4d10','cinnamon':'#d2691e','woody':'#774414','fresh spicy':'#83c928','fruity':'#fc4b29'})[name]; bar.textContent=name; wrapper.append(bar); document.querySelector('#fixture-accords').append(wrapper);
}
function votes(id,items) {
  const container=document.querySelector(id+' .fixture-vote-items');
  for(const [label,count] of items) {
    const el=document.createElement('div');el.className='cursor-pointer';
    const labelSpan=document.createElement('span');labelSpan.textContent=label;
    const countSpan=document.createElement('span');countSpan.textContent=count;
    el.append(labelSpan,countSpan);el.tabIndex=0;el.role='button';el.setAttribute('aria-label','Vote '+label);
    el.addEventListener('click',()=>{container.dataset.clicked=label;}); container.append(el);
  }
}
votes('#fixture-rating',[['love','16.7k'],['like','8.5k'],['ok','3k'],['dislike','1.9k'],['hate','1.2k']]);
votes('#fixture-wear',[['winter','22.4k'],['spring','4k'],['summer','2.5k'],['fall','17.7k'],['day','7.7k'],['night','17.6k']]);
// Match the site's performance DOM: the clickable bar has no label/count descendants.
function performanceCard(label,items) {
  const card=document.createElement('div');card.className='tw-perf-card';
  const heading=document.createElement('span');heading.textContent=label.toUpperCase();card.append(heading);
  const personal=document.createElement('div');const personalLabel=document.createElement('span');personalLabel.textContent='Your vote: no vote';
  const slider=document.createElement('div');slider.className='vue-slider';slider.tabIndex=0;slider.role='slider';slider.setAttribute('aria-label',`Your ${label} vote`);slider.setAttribute('aria-valuemin','0');slider.setAttribute('aria-valuemax','5');slider.setAttribute('aria-valuenow','0');
  slider.addEventListener('click',()=>{card.dataset.sliderClicked='true';});personal.append(personalLabel,slider);card.append(personal);
  const rows=document.createElement('div');rows.className='fixture-performance-rows';
  for(const [name,count] of items) {
    const row=document.createElement('div');
    const labelBox=document.createElement('div');const labelSpan=document.createElement('span');labelSpan.textContent=name;labelBox.append(labelSpan);
    const countBox=document.createElement('div');const countSpan=document.createElement('span');countSpan.textContent=count;countBox.append(countSpan);
    const barBox=document.createElement('div');const bar=document.createElement('div');bar.className='cursor-pointer';bar.tabIndex=0;bar.role='button';bar.setAttribute('aria-label',`Vote ${label} ${name}`);
    bar.addEventListener('click',()=>{card.dataset.clicked=name;});barBox.append(bar);
    row.append(labelBox,countBox,barBox);rows.append(row);
  }
  card.append(rows);return card;
}
document.querySelector('#fixture-demographics').append(
  performanceCard('Gender',[['female','1.6k'],['more female','3k'],['unisex','14.1k'],['more male','3.8k'],['male','1.4k']]),
  performanceCard('Price value',[['way overpriced','315'],['overpriced','316'],['ok','1.8k'],['good value','7.6k'],['great value','12.8k']])
);
for(const [stage,items] of [
  ['Top Notes',[['Cinnamon',65],['Nutmeg',59],['Bergamot',75]]],
  ['Middle Notes',[['Dates',355],['Praline',198],['Tuberose',25],['Mahonial',990]]],
  ['Base Notes',[['Vanilla',74],['Tonka Bean',73],['Amberwood',691],['Myrrh',98],['Benzoin',69],['Akigalawood',697]]]
]) {
  const level=document.createElement('div');level.className='mx-auto max-w-xl';
  const heading=document.createElement('div');heading.className='relative'; const h4=document.createElement('h4');h4.textContent=stage;heading.append(h4);
  const group=document.createElement('div');const links=document.createElement('div');links.className='pyramid-level-container';
  for(const [name,id] of items) {
    const a=document.createElement('a');a.className='pyramid-note-link';a.href=`https://www.fragrantica.com/notes/${name.replace(/ /g,'-')}-${id}.html`;
    const div=document.createElement('div'); const image=document.createElement('img');image.src=`https://fimgs.net/mdimg/sastojci/t.${id}.jpg`;image.alt=name;div.append(image);
    const label=document.createElement('span');label.className='pyramid-note-label';label.textContent=name;a.append(div,label);links.append(a);
  }
  group.append(links);level.append(heading,group);document.querySelector('#fixture-notes').append(level);
}
document.querySelector('#fixture-note-toggle').addEventListener('click',event=>{
  const el=event.currentTarget;el.textContent=el.textContent==='Show votes'?'Hide votes':'Show votes';
});
