'use client';
import { createContext, useContext, type ReactNode } from 'react';
const WebsiteCopy = createContext<Record<string, string>>({});
/** Text only: no wrapper, HTML parsing, styling, links or layout changes. */
export function WebsiteContentProvider({ values, children }: { values: Record<string,string>; children: ReactNode }) {
  return <WebsiteCopy.Provider value={values}>{children}</WebsiteCopy.Provider>;
}
export function WebsiteText({ contentKey, children }: { contentKey: string; children: ReactNode }) {
  const values = useContext(WebsiteCopy);
  return <>{values[contentKey] ?? children}</>;
}
