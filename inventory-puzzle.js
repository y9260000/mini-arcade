// Every letter is one item in a complete packing. Boards and items are derived
// together, so every shuffled puzzle has a solution without adding new items.
export const TEMPLATES = [
  ['AAAB', 'CC.B', 'CCDB', '..DD'],
  ['AAAB', 'CCDB', 'CCDB'],
  ['AABBC', 'AABBC', 'AADEC', 'FFDEE'],
  ['AABBC.', 'AABBC.', 'AADDCF', 'EE.DDF'],
  ['AAABB', 'CCDDB', 'CCDEB'],
  ['AAABC', 'DDBBC', 'DD.EC', 'FFEEE'],
];
export const bounds = cells => ({w:Math.max(...cells.map(p=>p[0]))+1,h:Math.max(...cells.map(p=>p[1]))+1});
export function normalize(cells) {
  const x=Math.min(...cells.map(p=>p[0])),y=Math.min(...cells.map(p=>p[1]));
  return cells.map(([a,b])=>[a-x,b-y]);
}
export function turn(cells) { return normalize(cells.map(([x,y])=>[-y,x])); }
export function makePuzzle(random=Math.random, templateIndex=Math.floor(random()*TEMPLATES.length)) {
  const letters=new Map();
  TEMPLATES[templateIndex].forEach((row,y)=>[...row].forEach((letter,x)=>{
    if(letter!=='.') { if(!letters.has(letter))letters.set(letter,[]);letters.get(letter).push([x,y]); }
  }));
  let packed=[...letters.values()];
  const rotations=Math.floor(random()*4);
  for(let n=0;n<rotations;n++) {
    const all=packed.flat(),minY=Math.min(...all.map(p=>-p[0]));
    packed=packed.map(c=>c.map(([x,y])=>[y,-x-minY]));
  }
  const mask=normalize(packed.flat()),all=packed.flat(),ox=Math.min(...all.map(p=>p[0])),oy=Math.min(...all.map(p=>p[1]));
  const items=packed.map((cells,id)=>{
    const solution={x:Math.min(...cells.map(p=>p[0]))-ox,y:Math.min(...cells.map(p=>p[1]))-oy,cells:normalize(cells)};
    const base=solution.cells, b=bounds(base), area=base.length;
    const rectangular=area===b.w*b.h;
    const kind=area===1?'potion':area===2?'dagger':area===3?(rectangular?'sword':'boot'):area===4?(b.w===2&&b.h===2?'shield':rectangular?'staff':'axe'):area>=6?'armor':'helm';
    let shape=base.map(p=>[...p]);
    for(let n=Math.floor(random()*4);n>0;n--)shape=turn(shape);
    return {id,kind,cells:shape,solution,x:null,y:null,placed:false};
  });
  for(let n=items.length-1;n>0;n--){const j=Math.floor(random()*(n+1));[items[n],items[j]]=[items[j],items[n]];}
  return {...bounds(mask),mask,items};
}
export function canPlace(puzzle,item,x,y,cells=item.cells) {
  const mask=new Set(puzzle.mask.map(p=>p.join(',')));
  const occupied=new Set(puzzle.items.filter(o=>o!==item&&o.placed).flatMap(o=>o.cells.map(([a,b])=>`${o.x+a},${o.y+b}`)));
  return cells.every(([a,b])=>mask.has(`${x+a},${y+b}`)&&!occupied.has(`${x+a},${y+b}`));
}
export const complete = puzzle => puzzle.items.every(i=>i.placed);
