// ============================================================
//  SITE SETTINGS — this is the only file you need to edit.
// ============================================================
//  Leave the two Supabase values empty to run in DEMO MODE
//  (sample data, saved only in your own browser).
//
//  After you set up Supabase (see README.md, Part 2), paste:
//    SUPABASE_URL  -> Project URL   (looks like https://abcd1234.supabase.co)
//    SUPABASE_KEY  -> Publishable key (starts with sb_publishable_...)
//                     or the older "anon public" key (starts with eyJ...)
//
//  These two values are SAFE to be public. The database security
//  rules in supabase-setup.sql control what visitors can do.
//  NEVER paste the "secret" or "service_role" key here.
// ============================================================

window.SITE_CONFIG = {
  SITE_NAME: "316 Restock Watch",
  SUPABASE_URL: "",
  SUPABASE_KEY: "",

  // Towns shown in the dropdowns
  CITIES: [
    "Wichita", "Derby", "Andover", "Haysville", "Park City", "Bel Aire",
    "Maize", "Goddard", "Valley Center", "Mulvane", "Rose Hill",
    "Augusta", "El Dorado", "Newton", "Other"
  ],

  // Store name suggestions (people can still type anything)
  STORES: [
    "Target", "Walmart", "Best Buy", "GameStop", "Barnes & Noble",
    "Dillons", "Walgreens", "CVS", "Sam's Club", "Costco",
    "Five Below", "Hobby Lobby", "Local card shop"
  ],

  // Show reports from the last N days
  DAYS_TO_SHOW: 7,

  // Seconds a visitor must wait between posts
  POST_COOLDOWN_SECONDS: 60
};
