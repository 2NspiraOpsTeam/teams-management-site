'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export function ResidentNavigation({lease}:{lease:boolean}){const path=usePathname();const links=[['My home','/tenant'],['Maintenance','/tenant/maintenance'],['Household','/tenant/household'],...(lease?[['My lease','/tenant/lease']]:[]),['My account','/tenant/account'],['Contact','/tenant/contact']];return <nav className="resident-nav" aria-label="Tenant navigation">{links.map(([label,href])=><Link prefetch={false} key={href} href={href} aria-current={(href==='/tenant'?path===href:path.startsWith(href))?'page':undefined}>{label}</Link>)}</nav>;}
