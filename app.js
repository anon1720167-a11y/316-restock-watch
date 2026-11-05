(function () {
  const cfg = window.SITE_CONFIG;
  const LIVE = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_KEY);
  const db = LIVE ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY) : null;

  const KIND_LABEL = { restock: "Restock", sighting: "Sighting", sold_out: "Sold out" };
  const state = { items: [], kind: "all", city: "", q: "" };
  const $ = (id) => document.getElementById(id);

  // ---------- setup ----------
  document.title = cfg.SITE_NAME;
  $("site-name").textContent = cfg.SITE_NAME;
  if (!LIVE) $("demo-banner").hidden = false;

  for (const c of cfg.CITIES) {
    $("filter-city").add(new Option(c, c));
    $("form-city").add(new Option(c, c));
  }
  for (const s of cfg.STORES) {
    const o = document.createElement("option");
    o.value = s;
    $("store-list").appendChild(o);
  }

  // ---------- data layer ----------
  const since = () => new Date(Date.now() - cfg.DAYS_TO_SHOW * 864e5).toISOString();

  async function loadAll() {
    if (LIVE) {
      const { data, error } = await db
        .from("sightings")
        .select("*")
        .gte("created_at", since())
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data;
    }
    return demoLoad();
  }

  async function addOne(row) {
    if (LIVE) {
      const { error } = await db.from("sightings").insert(row);
      if (error) throw error;
      return null; // realtime will deliver it
    }
    const saved = { ...row, id: Date.now(), created_at: new Date().toISOString() };
    const all = demoLoad();
    all.unshift(saved);
    try { localStorage.setItem("demo-sightings", JSON.stringify(all)); } catch (e) {}
    return saved;
  }

  function subscribe() {
    if (!LIVE) { setLive("Demo data", false); return; }
    db.channel("sightings-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sightings" }, (p) => {
        if (!state.items.some((x) => x.id === p.new.id)) {
          state.items.unshift(p.new);
          render(p.new.id);
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setLive("Live", true);
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setLive("Refreshing every minute", false);
      });
    // safety net in case realtime drops
    setInterval(refresh, 60000);
  }

  function demoLoad() {
    try {
      const saved = JSON.parse(localStorage.getItem("demo-sightings") || "null");
      if (Array.isArray(saved)) return saved;
    } catch (e) {}
    const m = (min) => new Date(Date.now() - min * 60000).toISOString();
    return [
      { id: 1, created_at: m(12), kind: "restock", city: "Wichita", store: "Target – N Maize Rd", product: "Booster bundles and 3-pack blisters", notes: "Vendor just finished stocking, limit 2.", reporter: "DeltaTrainer" },
      { id: 2, created_at: m(55), kind: "sighting", city: "Derby", store: "Walmart – N Rock Rd", product: "A few Elite Trainer Boxes", notes: "Behind the counter at electronics.", reporter: "" },
      { id: 3, created_at: m(140), kind: "sold_out", city: "Andover", store: "Walmart", product: "Card aisle empty", notes: "", reporter: "AndoverAce" },
      { id: 4, created_at: m(60 * 20), kind: "restock", city: "Wichita", store: "Best Buy – E Kellogg", product: "Collection boxes, mini tins", notes: "", reporter: "" },
      { id: 5, created_at: m(60 * 30), kind: "sighting", city: "Park City", store: "Dillons", product: "Loose booster packs", notes: "Checkout lane rack.", reporter: "PC_Pulls" }
    ];
  }

  // ---------- rendering ----------
  function setLive(text, on) {
    const el = $("live-status");
    el.textContent = text;
    el.classList.toggle("on", on);
  }

  function timeAgo(iso) {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " hr ago";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) +
      " " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text; // textContent = safe from HTML injection
    return e;
  }

  function matches(x) {
    if (state.kind !== "all" && x.kind !== state.kind) return false;
    if (state.city && x.city !== state.city) return false;
    if (state.q) {
      const hay = (x.store + " " + x.product + " " + (x.notes || "")).toLowerCase();
      if (!hay.includes(state.q)) return false;
    }
    return true;
  }

  function render(newId) {
    const feed = $("feed");
    feed.replaceChildren();
    const shown = state.items.filter(matches);
    for (const x of shown) {
      const li = el("li", "card " + x.kind + (x.id === newId ? " new" : ""));
      const top = el("div", "card-top");
      top.append(el("span", "badge " + x.kind, KIND_LABEL[x.kind] || x.kind), el("span", "time", timeAgo(x.created_at)));
      top.lastChild.title = new Date(x.created_at).toLocaleString();
      li.append(top, el("p", "store", x.store + " · " + x.city), el("p", "product", x.product));
      if (x.notes) li.append(el("p", "notes", x.notes));
      li.append(el("p", "by", "Reported by " + (x.reporter || "Anonymous")));
      feed.append(li);
    }
    $("empty").hidden = shown.length > 0;
    renderStats();
  }

  function renderStats() {
    const dayAgo = Date.now() - 864e5;
    const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
    const recent = state.items.filter((x) => new Date(x.created_at).getTime() > dayAgo);
    $("stat-24h").textContent = recent.length;
    $("stat-restocks").textContent = state.items.filter((x) => x.kind === "restock" && new Date(x.created_at) >= midnight).length;
    const counts = {};
    for (const x of recent) { const k = x.store.trim(); counts[k] = (counts[k] || 0) + 1; }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    $("stat-hot").textContent = top ? top[0] : "—";
    $("stat-hot").title = top ? top[0] : "";
  }

  async function refresh() {
    try {
      state.items = await loadAll();
      render();
    } catch (e) {
      console.error(e);
      setLive("Couldn't load reports", false);
    }
  }

  // ---------- filters ----------
  document.querySelectorAll(".chip").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      b.classList.add("active");
      state.kind = b.dataset.kind;
      render();
    })
  );
  $("filter-city").addEventListener("change", (e) => { state.city = e.target.value; render(); });
  $("filter-search").addEventListener("input", (e) => { state.q = e.target.value.trim().toLowerCase(); render(); });

  // ---------- report form ----------
  const dlg = $("report-dialog");
  const form = $("report-form");
  $("open-form").addEventListener("click", () => {
    $("form-error").textContent = "";
    if (state.city) $("form-city").value = state.city;
    dlg.showModal();
  });
  $("cancel-form").addEventListener("click", () => dlg.close());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const err = $("form-error");

    if (f.get("website")) { dlg.close(); return; } // bot filled the trap

    const row = {
      kind: f.get("kind"),
      city: String(f.get("city") || "").trim(),
      store: String(f.get("store") || "").trim(),
      product: String(f.get("product") || "").trim(),
      notes: String(f.get("notes") || "").trim() || null,
      reporter: String(f.get("reporter") || "").trim() || null
    };
    if (!row.store || !row.product) { err.textContent = "Please fill in the store and what you saw."; return; }

    let last = 0;
    try { last = Number(localStorage.getItem("last-post") || 0); } catch (e2) {}
    const wait = Math.ceil((last + cfg.POST_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
    if (wait > 0) { err.textContent = "Please wait " + wait + " seconds before posting again."; return; }

    const btn = $("submit-btn");
    btn.disabled = true;
    try {
      const saved = await addOne(row);
      try { localStorage.setItem("last-post", String(Date.now())); } catch (e3) {}
      if (saved) { state.items.unshift(saved); render(saved.id); }
      try { localStorage.setItem("reporter", row.reporter || ""); } catch (e4) {}
      form.reset();
      form.reporter.value = row.reporter || "";
      dlg.close();
    } catch (ex) {
      console.error(ex);
      err.textContent = "Couldn't post that. Please try again.";
    } finally {
      btn.disabled = false;
    }
  });

  // remember nickname
  try { form.reporter.value = localStorage.getItem("reporter") || ""; } catch (e) {}

  // keep "x min ago" fresh
  setInterval(() => render(), 60000);

  refresh().then(subscribe);
})();
