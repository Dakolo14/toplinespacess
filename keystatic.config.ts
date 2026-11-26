import { config, fields, singleton } from "@keystatic/core";

// Admin for project texts. Open /keystatic while `npm run dev` is running: edits save straight
// into src/content/projects.json on this computer. On the live site the same screen saves to
// GitHub (one-time setup, see README), and Vercel redeploys with the change.
// Photos still come from the Desktop project folders via `npm run sync-projects`.
const categoryOptions = [
  { label: "Stage Design", value: "stage-design" },
  { label: "Television", value: "television" },
  { label: "Corporate", value: "corporate" },
  { label: "Parties & Events", value: "parties-events" },
  { label: "Radio Studios", value: "radio" },
  { label: "Interiors & Kiosks", value: "interiors-kiosks" },
];

export default config({
  storage:
    process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
      ? { kind: "local" }
      : { kind: "github", repo: "Dakolo14/toplinespacess" },
  ui: { brand: { name: "TopLine Spaces admin" } },
  singletons: {
    projects: singleton({
      label: "Projects",
      path: "src/content/projects",
      format: { data: "json" },
      schema: {
        projects: fields.array(
          fields.object({
            title: fields.text({ label: "Project name", validation: { isRequired: true } }),
            category: fields.select({ label: "Category", options: categoryOptions, defaultValue: "stage-design" }),
            services: fields.text({ label: "What we built", description: "Short line, e.g. “Talk show set”. Shown on the stand and in lists." }),
            client: fields.text({ label: "Client", description: "Leave empty to use the project name." }),
            year: fields.text({ label: "Year" }),
            location: fields.text({ label: "Location", description: "Leave empty for “Lagos, Nigeria”." }),
            blurb: fields.text({ label: "Summary", description: "One or two sentences under the title.", multiline: true }),
            story: fields.text({ label: "The build (full story)", description: "Leave a blank line between paragraphs.", multiline: true }),
            quote: fields.text({ label: "Client quote", multiline: true }),
            quoteBy: fields.text({ label: "Quote by", description: "e.g. “Ada Obi, Producer”" }),
            onHomeGallery: fields.checkbox({ label: "Show in the 3D gallery on the home page", description: "The first nine ticked projects are shown.", defaultValue: false }),
            slug: fields.text({ label: "Page address (advanced)", description: "Used in the link: /projects/<this>. Must match the photo folder slug. Change only if you know why." }),
            folder: fields.text({ label: "Desktop photo folder (advanced)", description: "Folder name in “TopLine Spaces Website/projects”." }),
          }),
          {
            label: "Projects",
            itemLabel: (p) => `${p.fields.title.value || "Untitled"} · ${categoryOptions.find((c) => c.value === p.fields.category.value)?.label ?? ""}`,
            description: "Drag to reorder. The order here is the order on the site.",
          },
        ),
      },
    }),
  },
});
