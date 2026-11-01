import type {Action,Board,Game,Level,PlayAction} from './types';
export const clone=<T,>(x:T):T=>structuredClone(x);
export function createGame(l:Level):Game{return {levelId:l.id,board:clone(l.initial),history:[],hintsUsed:0,undosUsed:0};}
export function status(l:Level,g:Game){return g.board.completed.length===l.groups.length?'won':g.board.moves===0?'lost':'playing';}
export function stars(g:Game){return 1+Number(g.hintsUsed===0)+Number(g.undosUsed===0);}
export function playable(b:Board):string[]{return [...b.columns.map(c=>c.at(-1)),b.waste.at(-1)].filter((x):x is string=>!!x);}
export function legal(l:Level,b:Board,a:PlayAction):boolean{
 if(a.type==='draw')return b.stock.length>0;
 if(a.type==='recycle')return !b.stock.length&&b.waste.length>0;
 const card=l.cards.find(c=>c.id===a.card);
 if(!card||!playable(b).includes(a.card)||!Number.isInteger(a.to.index))return false;
 if(a.to.type==='column'){
  const pile=b.columns[a.to.index];
  if(!pile||pile.at(-1)===a.card)return false;
  return !pile.length||l.cards.find(c=>c.id===pile.at(-1))!.group===card.group;
 }
 const pile=b.foundations[a.to.index];if(!pile)return false;
 return !pile.length?card.kind==='title':card.kind==='word'&&l.cards.find(c=>c.id===pile[0])!.group===card.group;
}
export function hint(l:Level,g:Game):PlayAction|undefined{
 if(status(l,g)!=='playing')return;
 const b=g.board,available=playable(b);
 const foundations:PlayAction[]=available.flatMap(card=>b.foundations.map((_,index)=>({type:'move' as const,card,to:{type:'foundation' as const,index}}))).filter(a=>legal(l,b,a));
 foundations.sort((a,c)=>{
  if(a.type!=='move'||c.type!=='move')return 0;
  return b.foundations[c.to.index].length-b.foundations[a.to.index].length;
 });
 if(foundations.length)return foundations[0];
 // Prefer a move from the known solution when it is currently legal.
 const witness=l.solution.find(a=>a.type==='move'&&legal(l,b,a));if(witness)return witness;
 // Free a hidden card, then free the waste. Avoid suggesting an empty-to-empty shuffle.
 for(const card of available){
  const source=b.columns.findIndex(p=>p.at(-1)===card);
  if(source>=0&&b.columns[source].length<2)continue;
  for(let index=0;index<b.columns.length;index++){
   const a:PlayAction={type:'move',card,to:{type:'column',index}};
   if(legal(l,b,a))return a;
  }
 }
 if(b.stock.length)return {type:'draw'};
 if(b.waste.length)return {type:'recycle'};
}
export function act(l:Level,g:Game,a:Action):Game{
 if(a.type==='undo'){
  if(g.undosUsed>=3||!g.history.length||status(l,g)==='won')return g;
  return {...g,board:clone(g.history.at(-1)!),history:g.history.slice(0,-1),undosUsed:g.undosUsed+1};
 }
 if(status(l,g)!=='playing')return g;
 if(a.type==='hint')return g.hintsUsed<3&&hint(l,g)?{...g,hintsUsed:g.hintsUsed+1}:g;
 if(!legal(l,g.board,a))return g;
 const b=clone(g.board);
 if(a.type==='draw'){const card=b.stock.pop()!;b.waste.push(card);if(!b.revealed.includes(card))b.revealed.push(card);}
 else if(a.type==='recycle'){b.stock=b.waste.slice().reverse();b.waste=[];}
 else{
  const source=b.columns.find(c=>c.at(-1)===a.card);
  if(source){source.pop();const top=source.at(-1);if(top&&!b.revealed.includes(top))b.revealed.push(top);}
  else b.waste.pop();
  const dest=a.to.type==='column'?b.columns[a.to.index]:b.foundations[a.to.index];dest.push(a.card);
  if(a.to.type==='foundation'&&dest.length===5){b.completed.push(l.cards.find(c=>c.id===a.card)!.group);b.foundations[a.to.index]=[];}
 }
 b.moves--;
 return {...g,board:b,history:[...g.history.slice(-2),clone(g.board)]};
}
