'use client';
import {useEffect,useRef} from 'react';
const eventName='teams-operations-saved';
const channelName='teams-operations-updates';
let subscribers=0,checking=false,version:string|undefined,lastCheck=0;
// Initial load, returning to the tab, and explicit save events only; no idle polling.
async function checkForChanges(){
 if(checking||document.visibilityState!=='visible'||(lastCheck&&Date.now()-lastCheck<15000))return;
 checking=true;lastCheck=Date.now();
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
 try{const response=await fetch('/api/admin/operations/sync',{cache:'no-store',signal:controller.signal});if(!response.ok)return;const data=await response.json(),next=String(data.version);if(version!==undefined&&next!==version)window.dispatchEvent(new Event(eventName));version=next;}catch{/* Keep saved data and drafts available; focus or a later check can retry. */}finally{clearTimeout(timeout);checking=false;}
}
function subscribe(){if(subscribers++===0){version=undefined;lastCheck=0;void checkForChanges();}return()=>{if(--subscribers===0){version=undefined;lastCheck=0;}};}
export function announceOperationsChange(){
 window.dispatchEvent(new Event(eventName));
 try{const channel=new BroadcastChannel(channelName);channel.postMessage('saved');channel.close();}catch{}
}
export function useOperationsRefresh(refresh:()=>void,enabled=true){
 const latest=useRef(refresh);latest.current=refresh;
 useEffect(()=>{
  if(!enabled)return;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const reload=()=>{if(document.visibilityState!=='visible')return;clearTimeout(timer);timer=setTimeout(()=>latest.current(),150);};
  const visible=()=>{if(document.visibilityState==='visible')void checkForChanges();};
  let channel:BroadcastChannel|undefined;try{channel=new BroadcastChannel(channelName);channel.onmessage=reload;}catch{}
  window.addEventListener(eventName,reload);window.addEventListener('focus',checkForChanges);document.addEventListener('visibilitychange',visible);
  const unsubscribe=subscribe();
  return()=>{clearTimeout(timer);unsubscribe();channel?.close();window.removeEventListener(eventName,reload);window.removeEventListener('focus',checkForChanges);document.removeEventListener('visibilitychange',visible);};
 },[enabled]);
}
