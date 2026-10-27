// Authentic artwork only. Unmatched businesses intentionally use a text-only card.
// Source URLs and verification notes: docs/design/business-logo-sources.md.
export type BusinessLogo = { src: string; background: string };
export const businessLogos: Record<string, BusinessLogo> = {
  "Pipo's Restaurant": { src: '/storefronts/pipos.webp', background: 'bg-white' },
  'Pipos Restaurant': { src: '/storefronts/pipos.webp', background: 'bg-white' },
  'Mexiterranean Restaurant': { src: '/storefronts/mexiterranean.webp', background: 'bg-[#242424]' },
  'Maria Cortes NY Salon': { src: '/storefronts/maria-cortes.webp', background: 'bg-[#242424]' },
  'Delizia Restaurant Corp.': { src: '/storefronts/delizia.webp', background: 'bg-white' },
  '1626 Restaurant Group LLC dba FUMO': { src: '/storefronts/fumo.webp', background: 'bg-white' },
  'NY Sang Yuan Body Works': { src: '/storefronts/sang-yuan.webp', background: 'bg-white' },
  'Mala Midtown LLC dba Mala Project': { src: '/storefronts/mala-project.svg', background: 'bg-white' },
  'JazzCultural LLC': { src: '/storefronts/jazzcultural.webp', background: 'bg-black' },
  'Neurothareputix LLC c/o Dr. Robert Scolnick': { src: '/storefronts/neurotherapeutix.webp', background: 'bg-[#242424]' },
  'Caspare Physical Therapy Wellness P.C.': { src: '/storefronts/phitwell.webp', background: 'bg-[#242424]' },
  'Samuel Lippin PT': { src: '/storefronts/sam-lippin.webp', background: 'bg-white' },
  'Kristen R Riani': { src: '/storefronts/kristen-riani.webp', background: 'bg-white' },
  'HOT POT': { src: '/storefronts/hou-hot-pot.webp', background: 'bg-[#5b1717]' },
};
