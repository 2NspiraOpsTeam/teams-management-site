'use client';
import {useEffect,useRef} from 'react';
const eventName='teams-operations-saved';
const channelName='teams-operations-updates';
let subscribers=0,interval:ReturnType<typeof setInterval>|undefined,checking=false,version:string|undefined;
// One cheap indexed change check per browser module, not one full-data poll per view.
async function checkForChanges(){
 if(checking||document.visibilityState!=='visible')return;
 checking=true;
 try{const response=await fetch('/api/admin/operations/sync',{cache:'no-store'});if(!response.ok)return;const data=await response.json(),next=String(data.version);if(version!==undefined&&next!==version)window.dispatchEvent(new Event(eventName));version=next;}catch{/* Keep saved data and drafts available; focus or a later check can retry. */}finally{checking=false;}
}
function subscribe(){if(subscribers++===0){version=undefined;void checkForChanges();interval=setInterval(()=>void checkForChanges(),30000);}return()=>{if(--subscribers===0){clearInterval(interval);interval=undefined;version=undefined;}};}
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
  const visible=()=>{if(document.visibilityState==='visible')reload();};
  let channel:BroadcastChannel|undefined;try{channel=new BroadcastChannel(channelName);channel.onmessage=reload;}catch{}
  window.addEventListener(eventName,reload);window.addEventListener('focus',reload);document.addEventListener('visibilitychange',visible);
  const unsubscribe=subscribe();
  return()=>{clearTimeout(timer);unsubscribe();channel?.close();window.removeEventListener(eventName,reload);window.removeEventListener('focus',reload);document.removeEventListener('visibilitychange',visible);};
 },[enabled]);
}
