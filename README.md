# Hue Art Gallery website

React + Vite + Tailwind site. All content comes from JSON files that the CMS edits:

    public/data/paintings.json   public/data/painters.json
    public/data/events.json      public/data/site.json (gallery info, About/Home text)
    public/images/               uploaded photos
    public/admin/                Decap CMS (login via DecapBridge) -> yoursite.netlify.app/admin/

Colors and fonts: top of `src/index.css` (the DESIGN TOKENS block).
Contact form: Netlify Forms (declared in `index.html`, sent from `src/pages/AboutPage.tsx`).

    npm install
    npm run dev      # local preview
    npm run build    # what Netlify runs (see netlify.toml)
