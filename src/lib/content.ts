// Real photos and notes are pulled in by `npm run sync-projects` (see README) and land in media.json.
import media from "./media.json";

// All site copy lives here so TopLine Spaces's real content can be dropped in without touching components.
// Everything marked PLACEHOLDER is neutral filler until the agency's own details arrive.

export const site = {
  name: "TopLine Spaces",
  wordmark: "TopLine Spaces",
  // Drop the logo file into /public (e.g. /public/logo.svg) and set its path here. Empty = placeholder mark.
  logo: "",
  email: "hello@toplinespaces.com", // PLACEHOLDER
  hours: "Monday to Friday",
  hoursLong: "Monday to Friday, 09:00 to 18:00", // PLACEHOLDER
  addressLines: ["Workshop address line", "Lagos, Nigeria"], // PLACEHOLDER street address
  timeZone: "Africa/Lagos", // PLACEHOLDER: used for the live studio clock on Contact
  city: "Lagos",
  since: "2026", // PLACEHOLDER
  socials: [
    { label: "Instagram", href: "https://www.instagram.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com" },
    { label: "Behance", href: "https://www.behance.net" },
    { label: "X", href: "https://x.com" },
  ],
  bookCallHref: "/contact",
  intro: {
    headline: ["WE BUILD THE ROOM.", "STEP INSIDE."],
    blurb:
      "TopLine Spaces designs and builds TV sets, stages, red carpets, kiosks and branded spaces. Made in Lagos, built for the camera and the crowd.",
    cta: "Walk in",
  },
  nav: [
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Journal", href: "/journal" },
    { label: "Contact", href: "/contact" },
  ],
};

export type Work = {
  slug: string;
  folder: string; // the matching folder name in "TopLine Spaces Website/projects" on the Desktop
  no: string; // running number, shown on the stand plates and the index
  title: string;
  services: string; // short type line, shown on the stand plate in the gallery
  tags: string[]; // the category used by the Work filters
  blurb: string;
  client: string;
  year: string;
  location: string;
  image: string;
  images: string[]; // every photo for the project page strip (cover first)
  ratio: number; // width / height
  video?: string; // optional loop that plays when you stand in front of the stand
  body: { heading: string; paragraphs: string[]; quote?: { text: string; by: string } };
};

type Media = { cover?: string; images?: string[]; video?: string; client?: string; year?: string; location?: string; about?: string; ratio?: number };
const M = media as Record<string, Media>;

export const categories = ["TV & studio sets", "Stages & shows", "Red carpets & events", "Brand activations", "Radio studios", "Kiosks, prefabs & interiors"] as const;
type Cat = (typeof categories)[number];

const mk = (folder: string, title: string, cat: Cat, services: string, blurb: string, extra: Partial<Work> = {}): Work => {
  const slug = folder.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const m = M[slug] || {};
  const cover = m.cover || `/projects/${slug}/cover.svg`;
  return {
    slug,
    folder,
    no: "",
    title,
    services,
    tags: [cat],
    blurb,
    client: m.client || extra.client || title,
    year: m.year || extra.year || "",
    location: m.location || "Lagos, Nigeria",
    image: cover,
    images: m.images?.length ? m.images : [cover],
    ratio: m.ratio || extra.ratio || 4 / 3,
    video: m.video,
    body: {
      heading: "The build",
      paragraphs: m.about
        ? m.about.split(/\n\s*\n/)
        : [
            `Photos and the full story for ${title} are on the way.`,
            "This space is for the brief, the build schedule, the materials and the night it went live.",
          ],
    },
  };
};

// Order here = order in the gallery and the Work index.
const list: Work[] = [
  mk("SILVERBIRD TV SETS", "Silverbird TV Sets", "TV & studio sets", "TV studio sets", "Studio sets for Silverbird Television, designed for camera and built to survive daily broadcast."),
  mk("MBGN", "MBGN", "Stages & shows", "Pageant stage", "The stage for the Most Beautiful Girl in Nigeria pageant: runway, lighting towers and the crowning moment."),
  mk("UBA CEO AWARD RED CARPET", "UBA CEO Award Red Carpet", "Red carpets & events", "Red carpet, step-and-repeat", "Arrival, press wall and red carpet for the UBA CEO Awards night."),
  mk("AY LIVE 2018", "AY Live 2018", "Stages & shows", "Concert stage", "The main stage for AY Live 2018, one of Lagos's biggest comedy and music nights.", { year: "2018" }),
  mk("BIG TALK WITH DSA", "Big Talk with DSA", "TV & studio sets", "Talk show set", "A talk show set for Big Talk with DSA: the host's desk, guest seating and screens that read on camera."),
  mk("BUDWEISER", "Budweiser", "Brand activations", "Brand activation", "A Budweiser activation built to pull a crowd and look good in every phone photo."),
  mk("RHYTHM FM", "Rhythm FM", "Radio studios", "Radio studio", "On-air studio fit-out for Rhythm FM, from the desk to the acoustic finish."),
  mk("OVATION RED CAROL", "Ovation Red Carol", "Stages & shows", "Carol stage", "Stage and set dressing for the Ovation Red Carol, Christmas in full colour."),
  mk("TALK ACTIVE WITH KIKE", "Talk Active with Kike", "TV & studio sets", "Talk show set", "A warm, bright set for Talk Active with Kike, built around conversation."),
  mk("HYMNODIA", "Hymnodia", "Stages & shows", "Choral stage", "A staged set for Hymnodia, giving a full choir room to sing and the cameras room to move."),
  mk("BOTTLE KING", "Bottle King", "Brand activations", "Retail space", "Brand space for Bottle King that makes the shelf the show."),
  mk("NSIA", "NSIA", "Brand activations", "Exhibition stand", "An exhibition stand for NSIA Insurance: clear, branded and easy to walk into."),
  mk("RADIO NOW", "Radio Now", "Radio studios", "Radio studio", "Studio build for Radio Now, ready for the morning show."),
  mk("AFF SET", "AFF Set", "Stages & shows", "Event set", "A set build for AFF, made for the stage and the photographs after it."),
  mk("KIOSK", "Kiosks", "Kiosks, prefabs & interiors", "Branded kiosks", "Branded kiosks made to stand up to sun, rain and a busy street.", { ratio: 1 }),
  mk("PREFABS", "Prefabs", "Kiosks, prefabs & interiors", "Prefabricated structures", "Prefab units built in the workshop and installed on site in days.", { ratio: 1 }),
  mk("INTERIOR SET", "Interior Set", "Kiosks, prefabs & interiors", "Interior set", "An interior set that feels like a real room, down to the skirting."),
  mk("OTHERS", "More builds", "Kiosks, prefabs & interiors", "Selected builds", "Smaller builds, one-off pieces and work in progress."),
];
list.forEach((w, i) => (w.no = String(i + 1).padStart(2, "0")));
export const works = list;

// The gallery shows the first nine, three to a wall.
export const galleryWorks = works.slice(0, 9);

export const about = {
  hangingWords: ["We", "Build", "Rooms", "People", "Remember", "Seeing"],
  intro: "TopLine Spaces, a Lagos set and space builder. TV studios, stages, red carpets, kiosks and brand spaces, designed and built in-house.",
  expertise: [
    { title: "TV & Studio Sets", text: "Talk show, news and entertainment sets, designed for the lens first and built to take daily broadcast.", tags: "Set design, fabrication, set dressing, LED integration" },
    { title: "Stages & Shows", text: "Concert, pageant and festival stages, from the first sketch to the last screw on show night.", tags: "Stage design, runways, staging, rigging coordination" },
    { title: "Red Carpets & Events", text: "Arrivals, step-and-repeat walls and award-night sets that photograph well from every angle.", tags: "Red carpet, press walls, backdrops, décor" },
    { title: "Brand Activations & Exhibitions", text: "Stands, pop-ups and retail spaces that put a brand where people can walk into it.", tags: "Exhibition stands, pop-ups, retail fit-out" },
    { title: "Kiosks, Prefabs & Interiors", text: "Branded kiosks, prefab units and interiors, made in our workshop and installed on site.", tags: "Kiosks, prefabs, radio studios, interiors" },
  ],
  approach: [
    { old: "Answers first", now: "Curiosity first", text: "We ask better questions before making anything." },
    { old: "Make it pretty", now: "Make it matter", text: "Every creative decision should have a reason." },
    { old: "Good enough", now: "Never settle", text: "We keep refining until the work feels right." },
  ],
  testimonials: [
    { quote: "A short testimonial from a happy client goes here. Two or three sentences work best.", name: "Client Name", role: "Founder, Company", logo: "Company" },
    { quote: "Another client quote about the process, the people and the result.", name: "Client Name", role: "Marketing Lead, Company", logo: "Brand" },
    { quote: "A third quote. Keep them specific: what was made and what changed.", name: "Client Name", role: "CEO, Company", logo: "Studio" },
  ],
  clients: [
    { name: "Silverbird", year: "TV sets", h: 0.84, tone: "#F3F0EE" },
    { name: "UBA", year: "Red carpet", h: 0.76, tone: "#E4DED4" },
    { name: "Budweiser", year: "Activation", h: 0.9, tone: "#ECEAE6" },
    { name: "MBGN", year: "Stage", h: 0.7, tone: "#DFDEDC" },
    { name: "Rhythm FM", year: "Studio", h: 0.82, tone: "#F3F0EE" },
    { name: "NSIA", year: "Stand", h: 0.78, tone: "#EEEDEA" },
    { name: "Ovation", year: "Stage", h: 0.88, tone: "#E4DED4" },
    { name: "Radio Now", year: "Studio", h: 0.74, tone: "#F3F0EE" },
  ],
  story: [
    { year: 2018, title: "AY Live 2018", where: "Lagos, Nigeria", text: "Placeholder: one of the early big stages." },
    { year: 2022, title: "First TV studio sets", where: "Lagos, Nigeria", text: "Placeholder milestone about the first broadcast sets." },
    { year: 2023, title: "Red carpets and award nights", where: "Lagos, Nigeria", text: "Placeholder milestone about growing into events." },
    { year: 2024, title: "A bigger team", where: "Lagos, Nigeria", text: "Placeholder milestone about the workshop and crew." },
    { year: 2025, title: "Kiosks and prefabs", where: "Lagos, Nigeria", text: "Placeholder milestone about permanent structures." },
    { year: 2026, title: "Today", where: "Lagos, Nigeria", text: "Placeholder milestone about where TopLine is now." },
  ],
  benchIntro: "Designers, carpenters, welders, painters and riggers under one roof. The people who draw your set are the people who build it.", // PLACEHOLDER
  team: [
    { name: "Team Member", role: "Founder, creative direction", img: "/art/team-1.jpg", links: ["LinkedIn", "Instagram"] },
    { name: "Team Member", role: "Set design and 3D", img: "/art/team-2.jpg", links: ["LinkedIn", "Instagram", "Behance"] },
    { name: "Team Member", role: "Workshop and install lead", img: "/art/team-3.jpg", links: ["Instagram", "Vimeo"] },
  ],
  awards: [
    { name: "Award Name", level: "Silver", year: "2025", work: 0 },
    { name: "Award Name", level: "Gold", year: "2024", work: 1, gold: true },
    { name: "Award Name", level: "Silver", year: "2024", work: 2 },
    { name: "Award Name", level: "Certificate", year: "2024", work: 3 },
    { name: "Award Name", level: "Featured", year: "2023", work: 4 },
    { name: "Award Name", level: "Gold", year: "2022", work: 5, gold: true },
  ],
  faq: [
    { q: "How long does a build take?", a: "A talk show set or a red carpet can go from sign-off to install in two to four weeks. Big stages and fit-outs take longer. We plan backwards from your air date or show night." },
    { q: "Do you design as well as build?", a: "Yes. We draw it, show you a 3D view, then build it in our Lagos workshop and install it on site." },
    { q: "Do you work outside Lagos?", a: "Yes. We build in Lagos and travel with the crew to install across Nigeria." },
    { q: "Can you work with our production company or agency?", a: "All the time. We slot in with your producer, lighting team and brand team." },
    { q: "Do you store and reuse sets?", a: "We can store, refurbish and re-install sets for recurring shows and seasonal events." },
    { q: "Where does a budget start?", a: "Placeholder answer about starting budgets." },
  ],
};

export const journal = [
  { date: "March 12, 2026", title: "Every set starts as a floor plan", cat: "Process", min: 2 },
  { date: "February 20, 2026", title: "Building for the camera, not the room", cat: "TV", min: 2 },
  { date: "January 22, 2026", title: "Load-in night at a Lagos stage", cat: "Shows", min: 2 },
  { date: "January 8, 2026", title: "Why our kiosks are built for the rainy season", cat: "Workshop", min: 2 },
  { date: "December 4, 2025", title: "Ten red carpets in one December", cat: "Events", min: 2 },
]; // PLACEHOLDER titles
