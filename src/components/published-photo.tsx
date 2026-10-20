'use client';
import {forwardRef,type ImgHTMLAttributes} from 'react';
import {photoAttributes} from '@/lib/photo-variants';
// Preserve image/ref/alt/loading/layout contracts; only responsive pixel delivery changes.
export const PublishedPhoto=forwardRef<HTMLImageElement,ImgHTMLAttributes<HTMLImageElement>>(function PublishedPhoto({src,sizes,...props},ref){return <img {...photoAttributes(src,sizes||(props.width?`${props.width}px`:undefined))} {...props} ref={ref}/>;});
