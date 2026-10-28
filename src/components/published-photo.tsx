'use client';
import {forwardRef,type ImgHTMLAttributes} from 'react';
import {photoAttributes} from '@/lib/photo-variants';
// Preserve image/ref/alt/loading/layout contracts; only responsive pixel delivery changes.
export const PublishedPhoto=forwardRef<HTMLImageElement,ImgHTMLAttributes<HTMLImageElement>>(function PublishedPhoto({src,sizes,...props},ref){const delivered=typeof src==='string'?photoAttributes(src,sizes||(props.width?`${props.width}px`:undefined)):{src};return <img {...delivered} {...props} ref={ref}/>;});
