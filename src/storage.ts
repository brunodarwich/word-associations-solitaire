import {levels} from './levels';
import type {Board,Game} from './types';
export const STORAGE_KEY='paciencia-palavras-v1';
export type Save={version:1;unlocked:number;stars:Record<number,number>;game:Game|null;prefs:{sound:boolean;reducedMotion:boolean}};
export const defaultSave=():Save=>({version:1,unlocked:1,stars:{},game:null,prefs:{sound:false,reducedMotion:false}});
const integer=(x:unknown,min:number,max:number)=>typeof x==='number'&&Number.isInteger(x)&&x>=min&&x<=max;
function validBoard(b:Board,levelId:number){
 const l=levels[levelId-1];
 if(!b||!Array.isArray(b.columns)||b.columns.length!==l.initial.columns.length||!Array.isArray(b.foundations)||b.foundations.length!==3||!Array.isArray(b.stock)||!Array.isArray(b.waste)||!Array.isArray(b.completed)||!Array.isArray(b.revealed)||!integer(b.moves,0,l.limit))return false;
 if([...b.columns,...b.foundations].some(p=>!Array.isArray(p)))return false;
 if(b.completed.some(g=>!integer(g,0,l.groups.length-1))||new Set(b.completed).size!==b.completed.length)return false;
 const removed=l.cards.filter(c=>b.completed.includes(c.group)).map(c=>c.id);
 const ids=[...b.columns.flat(),...b.stock,...b.waste,...b.foundations.flat(),...removed];
 if(ids.length!==l.cards.length||new Set(ids).size!==ids.length||ids.some(id=>!l.cards.some(c=>c.id===id)))return false;
 if(b.revealed.some(id=>!l.cards.some(c=>c.id===id))||new Set(b.revealed).size!==b.revealed.length)return false;
 if([...b.columns.map(p=>p.at(-1)),...b.waste,...b.foundations.flat()].filter(Boolean).some(id=>!b.revealed.includes(id!)))return false;
 return b.foundations.every(p=>{
  if(!p.length)return true;
  const first=l.cards.find(c=>c.id===p[0])!;
  return p.length<=4&&first.kind==='title'&&p.slice(1).every(id=>{const c=l.cards.find(x=>x.id===id)!;return c.group===first.group&&c.kind==='word';});
 });
}
export function decode(raw:string):Save|null{
 try{
  const s=JSON.parse(raw) as Save;
  if(!s||s.version!==1||!integer(s.unlocked,1,30)||!s.stars||typeof s.stars!=='object'||Array.isArray(s.stars)||!s.prefs||typeof s.prefs.sound!=='boolean'||typeof s.prefs.reducedMotion!=='boolean')return null;
  if(Object.entries(s.stars).some(([id,n])=>!/^\d+$/.test(id)||!integer(Number(id),1,30)||!integer(n,1,3)))return null;
  if(s.game!==null){
   const g=s.game;
   if(!g||!integer(g.levelId,1,s.unlocked)||!integer(g.hintsUsed,0,3)||!integer(g.undosUsed,0,3)||!Array.isArray(g.history)||g.history.length>3||!validBoard(g.board,g.levelId)||g.history.some(b=>!validBoard(b,g.levelId)))return null;
  }
  return s;
 }catch{return null;}
}
export function loadSave():{save:Save;warning:string}{
 try{
  const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return {save:defaultSave(),warning:''};
  const save=decode(raw);
  return save?{save,warning:''}:{save:defaultSave(),warning:'O progresso salvo estava inválido. Iniciamos uma nova campanha.'};
 }catch{return {save:defaultSave(),warning:'O armazenamento está indisponível. Você pode jogar, mas o progresso não será salvo.'};}
}
export function recordWin(s:Save,id:number,n:number):Save{return {...s,unlocked:Math.max(s.unlocked,Math.min(id+1,30)),stars:{...s.stars,[id]:Math.max(s.stars[id]||0,n)}};}
