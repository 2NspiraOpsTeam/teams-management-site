'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Decorative photos may crop to fill, but never enlarge beyond source pixels. */
export function HeroPhotoSizing() {
  const pathname=usePathname();
  useEffect(()=>{
    const cleanups:Array<()=>void>=[];
    const frame=requestAnimationFrame(()=>{
      document.querySelectorAll<HTMLElement>('.gold-street-hero').forEach(hero=>{
        const value=getComputedStyle(hero).getPropertyValue('--gold-street-photo').trim();
        const match=value.match(/^url\(["']?(.*?)["']?\)$/);
        if(!match)return;
        const photo=new Image();let disposed=false;
        const resize=()=>{
          if(disposed||!photo.naturalWidth||!photo.naturalHeight)return;
          const {width,height}=hero.getBoundingClientRect();
          const scale=Math.min(1,Math.max(width/photo.naturalWidth,height/photo.naturalHeight));
          hero.style.setProperty('--hero-photo-size',`${photo.naturalWidth*scale}px ${photo.naturalHeight*scale}px`);
          hero.dataset.photoSizing='native-capped';
        };
        const observer=new ResizeObserver(resize);observer.observe(hero);
        photo.onload=resize;photo.src=match[1];
        if(photo.complete)resize();
        cleanups.push(()=>{disposed=true;photo.onload=null;observer.disconnect();hero.style.removeProperty('--hero-photo-size');delete hero.dataset.photoSizing;});
      });
    });
    return ()=>{cancelAnimationFrame(frame);cleanups.forEach(cleanup=>cleanup());};
  },[pathname]);
  return null;
}
