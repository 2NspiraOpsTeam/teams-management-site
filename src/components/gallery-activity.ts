'use client';
import {useEffect,useState} from 'react';

// A background/offscreen gallery must not generate network activity.
export function useGalleryActivity() {
 const [element,ref]=useState<HTMLDivElement|null>(null);
 const [visible,setVisible]=useState(false),[foreground,setForeground]=useState(false);
 useEffect(()=>{
  const update=()=>setForeground(document.visibilityState==='visible');update();
  document.addEventListener('visibilitychange',update);
  const observer=new IntersectionObserver(entries=>setVisible(entries.some(entry=>entry.isIntersecting)));
  if(element)observer.observe(element);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};
 },[element]);
 return {ref,active:visible&&foreground};
}
