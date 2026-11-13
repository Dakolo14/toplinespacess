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
  addressLines: ["Studio address line", "City, Country"], // PLACEHOLDER
  timeZone: "Africa/Lagos", // PLACEHOLDER: used for the live studio clock on Contact
  city: "the studio", // PLACEHOLDER
  since: "2026", // PLACEHOLDER
  socials: [
    { label: "Instagram", href: "https://www.instagram.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com" },
    { label: "Behance", href: "https://www.behance.net" },
    { label: "X", href: "https://x.com" },
  ],
  bookCallHref: "/contact",
  intro: {
    headline: ["COME IN.", "THE WORK IS INSIDE."],
    blurb:
      "TopLine Spaces is an independent creative agency. We give ambitious brands their names, identities, campaigns and websites.", // PLACEHOLDER
    cta: "Enter the gallery",
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
  title: string;
  services: string; // shown under the frame in the gallery
  tags: string[];
  blurb: string;
  client: string;
  year: string;
  image: string;
  ratio: number; // width / height
  video?: string; // optional loop that plays when you stand in front of the frame
  body: { heading: string; paragraphs: string[]; quote?: { text: string; by: string } };
};

const lorem = (n: string) =>
  `Placeholder case study for ${n}. Replace this with a short summary of the brief, what the agency made and what changed for the client afterwards.`;

const mk = (
  slug: string,
  title: string,
  services: string,
  tags: string[],
  blurb: string,
  img: string,
  ratio: number,
  year = "2026",
): Work => ({
  slug,
  title,
  services,
  tags,
  blurb,
  client: "Client name",
  year,
  image: `/art/work-${img}.jpg`,
  ratio,
  body: {
    heading: "Where it started",
    paragraphs: [lorem(title), "A second paragraph for process notes, the people involved and the craft details worth pointing out."],
    quote: { text: "A short line from the client about working with the agency goes here.", by: "Client name, role" },
  },
});

// PLACEHOLDER projects. Order here = order on the gallery walls and the Work grid.
export const works: Work[] = [
  mk("project-one", "Project One", "Identity, film", ["Identity", "Commercial", "Vertical"], "A one-line teaser for the project sits here.", "01", 3 / 4),
  mk("project-two", "Project Two", "Campaign film", ["Commercial", "Brand film"], "A one-line teaser for the project sits here.", "02", 4 / 3),
  mk("project-three", "Project Three", "Brand film", ["Brand film"], "A one-line teaser for the project sits here.", "03", 1),
  mk("project-four", "Project Four", "Title sequence", ["Short film"], "A one-line teaser for the project sits here.", "04", 4 / 3),
  mk("project-five", "Project Five", "Short film", ["Short film"], "A one-line teaser for the project sits here.", "05", 4 / 3),
  mk("project-six", "Project Six", "Brand film", ["Brand film"], "A one-line teaser for the project sits here.", "06", 4 / 3),
  mk("project-seven", "Project Seven", "Campaign film", ["Commercial"], "A one-line teaser for the project sits here.", "07", 4 / 3),
  mk("project-eight", "Project Eight", "Identity, product", ["Identity", "Product"], "A one-line teaser for the project sits here.", "08", 4 / 3),
  mk("project-nine", "Project Nine", "Commercial, reel", ["Commercial", "Reel", "Vertical"], "A one-line teaser for the project sits here.", "09", 3 / 4),
  mk("project-ten", "Project Ten", "Brand film", ["Brand film"], "A one-line teaser for the project sits here.", "10", 4 / 3),
  mk("project-eleven", "Project Eleven", "Brand film, vertical", ["Brand film", "Vertical"], "A one-line teaser for the project sits here.", "11", 3 / 4),
  mk("project-twelve", "Project Twelve", "Commercial, product", ["Commercial", "Product"], "A one-line teaser for the project sits here.", "12", 4 / 3),
];

// The gallery hangs the first eight.
export const galleryWorks = works.slice(0, 8);

export const about = {
  hangingWords: ["We", "Make", "Brands", "People", "Stop", "For"],
  intro: "TopLine Spaces, an independent creative agency. Identities, campaigns and websites, made with care down to the last detail.", // PLACEHOLDER
  expertise: [
    { title: "Strategy & Positioning", text: "Who the brand is for, what it stands for and what to call it, agreed on one page before anything is drawn.", tags: "Research, positioning, naming, tone of voice" },
    { title: "Brand Identity", text: "Marks, type, colour and the rules that hold them together, built to work on a phone screen and a shop front alike.", tags: "Logo, typography, colour, guidelines" },
    { title: "Art Direction & Campaigns", text: "Shoots, films and launches that look like they came from the same hand as the identity.", tags: "Photography, film, campaigns" },
    { title: "Digital Experiences", text: "Websites and products designed and built in-house, fast, accessible and easy to update.", tags: "Websites, e-commerce, motion" },
    { title: "Packaging & Print", text: "Boxes, labels and printed matter, specified down to the paper stock and finished on the back too.", tags: "Packaging, print, production" },
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
    { name: "Client One", year: "2024", h: 0.84, tone: "#F3F0EE" },
    { name: "Client Two", year: "2023", h: 0.76, tone: "#E4DED4" },
    { name: "Client Three", year: "2025", h: 0.9, tone: "#ECEAE6" },
    { name: "Client Four", year: "2025", h: 0.7, tone: "#DFDEDC" },
    { name: "Client Five", year: "2024", h: 0.82, tone: "#F3F0EE" },
    { name: "Client Six", year: "2022", h: 0.78, tone: "#EEEDEA" },
    { name: "Client Seven", year: "2021", h: 0.88, tone: "#E4DED4" },
    { name: "Client Eight", year: "2022", h: 0.74, tone: "#F3F0EE" },
  ],
  story: [
    { year: 2021, title: "TopLine Spaces opens", where: "City, Country", text: "A placeholder milestone. Replace with how the agency started." },
    { year: 2022, title: "First big identity", where: "City, Country", text: "A placeholder milestone for the first major project." },
    { year: 2023, title: "More than logos", where: "City, Country", text: "A placeholder milestone about growing services." },
    { year: 2024, title: "A bigger team", where: "City, Country", text: "A placeholder milestone about new people and space." },
    { year: 2025, title: "Into digital", where: "City, Country", text: "A placeholder milestone about websites and products." },
    { year: 2026, title: "Today", where: "City, Country", text: "A placeholder milestone about where the agency is now." },
  ],
  benchIntro: "A small team sharing one studio. The person who draws your mark also sets it on the box and builds the site.", // PLACEHOLDER
  team: [
    { name: "Team Member", role: "Founder, creative direction", img: "/art/team-1.jpg", links: ["LinkedIn", "Instagram"] },
    { name: "Team Member", role: "Identity and type", img: "/art/team-2.jpg", links: ["LinkedIn", "Instagram", "Behance"] },
    { name: "Team Member", role: "Film and motion", img: "/art/team-3.jpg", links: ["Instagram", "Vimeo"] },
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
    { q: "How long does a project take?", a: "An identity usually takes six to eight weeks from the first workshop to the final files. A website adds four to six." },
    { q: "Where does a budget start?", a: "Placeholder answer about starting budgets." },
    { q: "Do you work with brands outside our city?", a: "Placeholder answer. Most of our work happens remotely with on-site visits where they help." },
    { q: "Who will we work with?", a: "Placeholder answer about the team on each project." },
    { q: "What happens after launch?", a: "Placeholder answer about support and retainers." },
    { q: "Who owns the work?", a: "Placeholder answer about rights and handover." },
  ],
};

export const journal = [
  { date: "March 12, 2026", title: "Every headline starts on paper", cat: "Process", min: 2 },
  { date: "February 20, 2026", title: "What a business card says about a brand", cat: "Objects", min: 2 },
  { date: "January 22, 2026", title: "In the edit suite with our film team", cat: "Conversations", min: 2 },
  { date: "January 8, 2026", title: "We read every mark at arm's length", cat: "Studio", min: 2 },
  { date: "December 4, 2025", title: "Cutting a logo out by hand", cat: "Process", min: 2 },
]; // PLACEHOLDER titles
