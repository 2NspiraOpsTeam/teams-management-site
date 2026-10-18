'use client';
import {useEffect,useRef} from 'react';
const eventName='teams-operations-saved';
const channelName='teams-operations-updates';
export function announceOperationsChange(){
 window.dispatchEvent(new Event(eventName));
 try{const channel=new BroadcastChannel(channelName);channel.postMessage('saved');channel.close();}catch{/* Focus and timed refresh still work when channels are unavailable. */}
}
/** Refresh saved views, never a currently open editor. Polling also sees other staff sessions. */
export function useOperationsRefresh(refresh:()=>void,enabled=true){
 const latest=useRef(refresh);latest.current=refresh;
 useEffect(()=>{
  if(!enabled)return;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const reload=()=>{if(document.visibilityState!=='visible')return;clearTimeout(timer);timer=setTimeout(()=>latest.current(),150);};
  const visible=()=>{if(document.visibilityState==='visible')reload();};
  let channel:BroadcastChannel|undefined;try{channel=new BroadcastChannel(channelName);channel.onmessage=reload;}catch{}
  window.addEventListener(eventName,reload);window.addEventListener('focus',reload);document.addEventListener('visibilitychange',visible);
  const interval=setInterval(reload,30000);
  return()=>{clearTimeout(timer);clearInterval(interval);channel?.close();window.removeEventListener(eventName,reload);window.removeEventListener('focus',reload);document.removeEventListener('visibilitychange',visible);};
 },[enabled]);
}
