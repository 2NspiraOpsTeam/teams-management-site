'use client';
import {useEffect} from 'react';
export default function OneDriveCallback(){useEffect(()=>{void import('@azure/msal-browser/redirect-bridge').then(m=>m.broadcastResponseToMainFrame()).catch(()=>{});},[]);return <p role="status">Completing Microsoft sign-in…</p>;}
