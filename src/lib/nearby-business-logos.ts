import type { NearbyPlace } from './nearby-place';

export type NearbyLogo = { src: string; alt: string; background: string };
const logos: Record<string, NearbyLogo> = {
  "Caf\u00e9 Maud": { src: "/nearby-logos/caf-maud.svg", alt: "Caf\u00e9 Maud logo", background: "bg-white" },
  "Comic Strip Live": { src: "/nearby-logos/comic-strip-live.webp", alt: "Comic Strip Live logo", background: "bg-white" },
  "Madame Bont\u00e8 Caf\u00e9": { src: "/nearby-logos/madame-bont-caf.webp", alt: "Madame Bont\u00e8 Caf\u00e9 logo", background: "bg-white" },
  "Gristedes": { src: "/nearby-logos/gristedes.webp", alt: "Gristedes logo", background: "bg-white" },
  "Whole Foods Market": { src: "/nearby-logos/whole-foods-market.svg", alt: "Whole Foods Market logo", background: "bg-white" },
  "Times Square": { src: "/nearby-logos/times-square.svg", alt: "Times Square Alliance logo", background: "bg-[#242424]" },
  "Mcgoldrick": { src: "/nearby-logos/mcgoldrick.svg", alt: "Queens Public Library logo", background: "bg-white" },
  "Super Foodtown": { src: "/nearby-logos/super-foodtown.webp", alt: "Super Foodtown logo", background: "bg-white" },
  "Fairway Market": { src: "/nearby-logos/fairway-market.webp", alt: "Fairway Market logo", background: "bg-white" },
  "Caf\u00e9 Grumpy": { src: "/nearby-logos/caf-grumpy.webp", alt: "Caf\u00e9 Grumpy logo", background: "bg-white" },
  "Joe Coffee Company": { src: "/nearby-logos/joe-coffee-company.webp", alt: "Joe Coffee Company logo", background: "bg-[#242424]" },
  "Birch Coffee": { src: "/nearby-logos/birch-coffee.webp", alt: "Birch Coffee logo", background: "bg-white" },
  "D'Agostino": { src: "/nearby-logos/d-agostino.webp", alt: "D\u2019Agostino logo", background: "bg-white" },
  "The Beekman, A Thompson Hotel": { src: "/nearby-logos/the-beekman.svg", alt: "The Beekman logo", background: "bg-white" },
  "Walgreens": { src: "/nearby-logos/walgreens.webp", alt: "Walgreens logo", background: "bg-white" },
  "A Matter of Health": { src: "/nearby-logos/a-matter-of-health.webp", alt: "A Matter of Health logo", background: "bg-white" },
  "Westside Market": { src: "/nearby-logos/westside-market.webp", alt: "Westside Market logo", background: "bg-white" },
  "H Mart": { src: "/nearby-logos/h-mart.webp", alt: "H Mart logo", background: "bg-white" },
  "Aldi": { src: "/nearby-logos/aldi.webp", alt: "Aldi logo", background: "bg-white" },
  'City Fresh Market': { src: '/nearby-logos/city-fresh.webp', alt: 'City Fresh Market logo', background: 'bg-white' },
  'Capy': { src: '/nearby-logos/capy.webp', alt: 'Capy logo', background: 'bg-white' },
  'For five coffee roasters': { src: '/nearby-logos/for-five.webp', alt: 'For Five Coffee Roasters logo', background: 'bg-[#242424]' },
  'The Food Emporium': { src: '/nearby-logos/food-emporium.svg', alt: 'The Food Emporium logo', background: 'bg-[#242424]' },
  'Hotel Chelsea': { src: '/nearby-logos/hotel-chelsea.svg', alt: 'Hotel Chelsea logo', background: 'bg-white' },
};

export function nearbyBusinessLogo(item: NearbyPlace): NearbyLogo | undefined {
  // Only existing MTA-linked NY transit references receive MTA artwork.
  if (item.category === 'transit' && item.source?.startsWith('https://data.ny.gov/')) {
    return { src: '/nearby-logos/mta.svg', alt: 'MTA', background: 'bg-[#0039a6]' };
  }
  return logos[item.name];
}
