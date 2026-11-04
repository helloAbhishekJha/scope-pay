export type VideoPackagePreset = {
  id: string;
  name: string;
  tagline: string;
  basePrice: number;
  currency: string;
  deliverables: string[];
  revisionCap: number;
  defaultLineItems: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  sampleBrief: string;
};

export const VIDEO_PACKAGE_PRESETS: VideoPackagePreset[] = [
  {
    id: "reel-bundle",
    name: "Reel Bundle",
    tagline: "4 vertical reels + captions + 2 revision rounds",
    basePrice: 850,
    currency: "USD",
    deliverables: [
      "4× 9:16 reels (15–30s each)",
      "Auto-captions + hook text overlays",
      "Licensed music bed (client-provided or stock)",
      "2 consolidated revision rounds",
    ],
    revisionCap: 2,
    defaultLineItems: [
      {
        name: "Vertical reel edits (×4)",
        description: "Hook, pacing, captions, export 1080×1920",
        quantity: 4,
        unitPrice: 125,
      },
      {
        name: "Caption & motion text pack",
        description: "Brand-safe caption styling across all reels",
        quantity: 1,
        unitPrice: 150,
      },
      {
        name: "Revision allowance",
        description: "Up to 2 consolidated feedback rounds",
        quantity: 1,
        unitPrice: 100,
      },
    ],
    sampleBrief:
      "Need 4 reels from my podcast interview footage for Instagram — punchy hooks, captions, ready by next Friday. Client: Nova Skincare, contact priya@novaskincare.demo",
  },
  {
    id: "ad-cut",
    name: "Ad Cut + Ratios",
    tagline: "30s hero ad + 3 platform cuts + 1 revision",
    basePrice: 1200,
    currency: "USD",
    deliverables: [
      "1× 30s hero ad (9:16 master)",
      "1:1 and 16:9 ratio exports",
      "Sound mix + supers for offer CTA",
      "1 revision round on hero cut",
    ],
    revisionCap: 1,
    defaultLineItems: [
      {
        name: "Hero ad edit (30s)",
        description: "Script-to-timeline, supers, CTA end card",
        quantity: 1,
        unitPrice: 750,
      },
      {
        name: "Platform ratio exports",
        description: "1:1 feed + 16:9 YouTube pre-roll",
        quantity: 1,
        unitPrice: 250,
      },
      {
        name: "Revision round",
        description: "One consolidated feedback pass",
        quantity: 1,
        unitPrice: 200,
      },
    ],
    sampleBrief:
      "30 second UGC-style ad for our protein bar launch — need square and landscape too. One round of notes max. Bill to Apex Athletics, billing@apexathletics.demo",
  },
  {
    id: "podcast-clips",
    name: "Podcast Clips Pack",
    tagline: "8 clips + audiograms + brand template",
    basePrice: 950,
    currency: "USD",
    deliverables: [
      "8× clip selects (45–90s)",
      "Audiogram variants for LinkedIn/X",
      "Reusable lower-third template",
      "2 revision rounds on clip selection",
    ],
    revisionCap: 2,
    defaultLineItems: [
      {
        name: "Clip selects & edits (×8)",
        description: "Timestamped pulls with hook-first open",
        quantity: 8,
        unitPrice: 75,
      },
      {
        name: "Audiogram batch",
        description: "Waveform + cover art for 4 top clips",
        quantity: 1,
        unitPrice: 150,
      },
      {
        name: "Brand template setup",
        description: "Lower-third + caption style preset",
        quantity: 1,
        unitPrice: 100,
      },
    ],
    sampleBrief:
      "Pull 8 best moments from episode 42 for YouTube Shorts and LinkedIn audiograms. Brand colors attached mentally — teal/white. Invoice Startup Radio host, finance@startupradio.demo",
  },
];

export function getPresetById(id: string): VideoPackagePreset | undefined {
  return VIDEO_PACKAGE_PRESETS.find((p) => p.id === id);
}
