import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RetailFitSections } from '@/components/retail-fit-sections';

const render = (facts: {label:string;value:string}[] = [], floorplans: {src:string;alt:string;kind:string}[] = []) => renderToStaticMarkup(<RetailFitSections facts={facts} floorplans={floorplans}/>);
describe('Published retail space details', () => {
  it('omits the entire section when there are no publishable details', () => {
    expect(render()).toBe('');
    expect(render([{label:'Gas',value:'  '}])).toBe('');
    expect(render([{label:'Unknown field',value:'Not a published space detail'}])).toBe('');
  });
  it('shows populated groups only without unfinished messaging', () => {
    const html = render([{label:'Retail square feet',value:'750 sq ft'}]);
    expect(html).toContain('750 sq ft');
    expect(html).not.toContain('Visibility &amp; access');
    expect(html).not.toContain('Use context');
    expect(html).not.toMatch(/not yet published|Confirm the physical fit|Published use information/);
  });
  it('retains floor plans even without facts and safe external links', () => {
    const html = render([], [{src:'/floorplan.svg',alt:'Space floor plan',kind:'floorplan'}]);
    expect(html).toContain('View floor plan');
    expect(html).toContain('noopener noreferrer');
    expect(html).not.toContain('Visibility &amp; access');
  });
  it('retains all populated groups', () => {
    const html = render([{label:'Retail square feet',value:'750 sq ft'},{label:'Nearby transit',value:'Subway nearby'},{label:'Approved uses',value:'Retail'}]);
    expect(html).toContain('Space details');
    expect(html).toContain('Visibility &amp; access');
    expect(html).toContain('Use context');
  });
});
