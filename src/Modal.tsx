import {useEffect,useRef} from 'react';
import type {ReactNode} from 'react';
import {X} from 'lucide-react';
export function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const el=ref.current!,previous=document.activeElement as HTMLElement|null;el.showModal();return ()=>{el.close();previous?.focus();};},[]);
 return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current)onClose();}}><div className="modal-body"><button className="icon-button close" onClick={onClose} aria-label="Fechar"><X size={20}/></button><h2 id="dialog-title">{title}</h2>{children}</div></dialog>;
}
