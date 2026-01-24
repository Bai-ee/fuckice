(() => {
  const stateCodes = {
    AK: "Alaska",
    HI: "Hawaii",
    AL: "Alabama",
    AR: "Arkansas",
    AZ: "Arizona",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    IA: "Iowa",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    MA: "Massachusetts",
    MD: "Maryland",
    ME: "Maine",
    MI: "Michigan",
    MN: "Minnesota",
    MO: "Missouri",
    MS: "Mississippi",
    MT: "Montana",
    NC: "North Carolina",
    ND: "North Dakota",
    NE: "Nebraska",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NV: "Nevada",
    NY: "New York",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VA: "Virginia",
    VT: "Vermont",
    WA: "Washington",
    WI: "Wisconsin",
    WV: "West Virginia",
    WY: "Wyoming",
    DC: "District of Columbia",
    PR: "Puerto Rico",
    VI: "U.S. Virgin Islands",
    MP: "Northern Mariana Islands",
    GU: "Guam",
    AS: "American Samoa"
  };

  const themeToggle = document.getElementById("themeToggle");
  const stateSelect = document.getElementById("state-select");
  const stateSearchInputs = document.querySelectorAll("[data-state-search]");
  const map = document.getElementById("Layer_1");
  const kpiIncidents = document.getElementById("kpi-incidents");
  const kpiLatest = document.getElementById("kpi-latest");
  const kpiSources = document.getElementById("kpi-sources");
  const kpiVerification = document.getElementById("kpi-verification");
  const mapKpiIncidents = document.getElementById("map-kpi-incidents");
  const mapKpiLatest = document.getElementById("map-kpi-latest");
  const mapKpiSources = document.getElementById("map-kpi-sources");
  const mapKpiVerification = document.getElementById("map-kpi-verification");
  const overviewState = document.getElementById("overview-state");
  const overviewVerification = document.getElementById("overview-verification");
  const contactsState = document.getElementById("contacts-state");
  const incidentsTableBody = document.getElementById("incidents-table-body");
  const incidentsEmpty = document.getElementById("incidents-empty");
  const activityFeed = document.getElementById("activity-feed");
  const verificationSummary = document.getElementById("verification-summary");
  const typeSummary = document.getElementById("type-summary");
  const verificationBars = document.getElementById("verification-bars");
  const typeBars = document.getElementById("type-bars");
  const contactsGrid = document.getElementById("contacts-grid");
  const contactsPrimary = document.getElementById("contacts-primary");
  const contactsEmpty = document.getElementById("contacts-empty");
  const gapCallouts = document.getElementById("gap-callouts");
  const sourceCards = document.getElementById("source-cards");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const filterType = document.getElementById("filter-type");
  const filterVerification = document.getElementById("filter-verification");
  const filterSource = document.getElementById("filter-source");
  const stateDashboard = document.querySelector("[data-state-dashboard]");

  let statesWithLocations = [];
  let locationsByState = {};
  let incidents = [];
  let sources = [];
  let selectedStateEl = null;
  let activeStateCode = "";
  let userSelectedState = false;
  const savedStateKey = "icerr:selectedState";
  let latestReportedAt = "";
  let generatedAt = "";

  function setThemeFromStorage() {
    const storedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
    if (storedTheme === "light") {
      themeToggle.classList.add("active");
    }
  }

  function toggleTheme() {
    themeToggle.classList.toggle("active");
    const newTheme = themeToggle.classList.contains("active") ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  }

  function clearSelectedState() {
    if (!selectedStateEl) return;
    selectedStateEl.classList.remove("selected", "state-hover");
  }

  function setSelectedStateEl(el) {
    clearSelectedState();
    if (!el) {
      selectedStateEl = null;
      return;
    }
    el.classList.add("selected");
    selectedStateEl = el;
  }

  function getSavedState() {
    const stored = localStorage.getItem(savedStateKey);
    if (stored && stateCodes[stored]) return stored;
    return "";
  }

  function saveSelectedState(code) {
    if (!code || !stateCodes[code]) return;
    localStorage.setItem(savedStateKey, code);
  }

  // Timezone/locale heuristics are conservative (single-state mappings only).
  function resolveStateFromTimezone(timezone) {
    const timezoneMap = {
      "America/Anchorage": "AK",
      "America/Juneau": "AK",
      "America/Sitka": "AK",
      "America/Yakutat": "AK",
      "America/Adak": "AK",
      "America/Honolulu": "HI",
      "America/Phoenix": "AZ",
      "America/Detroit": "MI",
      "America/Indiana/Indianapolis": "IN",
      "America/Indiana/Marengo": "IN",
      "America/Indiana/Vincennes": "IN",
      "America/Indiana/Winamac": "IN",
      "America/Indiana/Vevay": "IN",
      "America/Indiana/Tell_City": "IN",
      "America/Indiana/Knox": "IN",
      "America/Kentucky/Louisville": "KY",
      "America/Kentucky/Monticello": "KY"
    };
    return timezoneMap[timezone] || "";
  }

  function resolveStateFromLocale(locale) {
    const match = locale?.match(/-([A-Z]{2})\b/);
    const code = match?.[1] || "";
    return stateCodes[code] ? code : "";
  }

  function getTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  }

  // IP fallback is optional, async, and aborts quickly to avoid blocking render.
  async function getStateFromIpLookup() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    try {
      const response = await fetch("https://ipapi.co/json/", {
        signal: controller.signal
      });
      if (!response.ok) return "";
      const data = await response.json();
      if (data?.country_code !== "US") return "";
      return stateCodes[data?.region_code] ? data.region_code : "";
    } catch (error) {
      return "";
    } finally {
      clearTimeout(timeout);
    }
  }

  // Detection order: timezone -> locale -> IP. Empty string means "no confidence."
  async function detectStateCode() {
    const timezone = getTimezone();
    const timezoneMatch = resolveStateFromTimezone(timezone);
    if (timezoneMatch) return timezoneMatch;

    const locale = navigator.language || "";
    const localeMatch = resolveStateFromLocale(locale);
    if (localeMatch) return localeMatch;

    return await getStateFromIpLookup();
  }

  function formatDate(value) {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }

  function getStateName(code) {
    return stateCodes[code] || code || "--";
  }

  function applyDisabledStates() {
    Object.entries(stateCodes).forEach(([code, name]) => {
      if (statesWithLocations.includes(name)) return;
      const el = document.getElementById(code);
      if (el) el.classList.add("disabled");
    });
  }

  function buildSelectOptions() {
    if (!stateSelect) return;
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a state";
    stateSelect.appendChild(placeholder);

    const options = Object.entries(stateCodes).sort((a, b) => a[1].localeCompare(b[1]));
    options.forEach(([code, name]) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = name;
      stateSelect.appendChild(option);
    });
  }

  function attachStateHandlers() {
    if (!map) return;
    Object.keys(stateCodes).forEach((code) => {
      const elements = map.querySelectorAll(`[id="${code}"]`);
      elements.forEach((el) => {
        el.addEventListener("mouseover", () => !el.classList.contains("selected") && el.classList.add("state-hover"));
        el.addEventListener("mouseout", () => !el.classList.contains("selected") && el.classList.remove("state-hover"));
        el.addEventListener("click", () => setActiveState(code, { source: "manual" }));
      });
    });
  }

  function buildFilterOptions() {
    const types = new Set();
    const verifications = new Set();
    const src = new Set();
    incidents.forEach((item) => {
      if (item.activity_type) types.add(item.activity_type);
      if (item.verification) verifications.add(item.verification);
      if (item.source) src.add(item.source);
    });
    [filterType, filterVerification, filterSource].forEach((el) => {
      if (!el) return;
      el.querySelectorAll("option:not(:first-child)").forEach((opt) => opt.remove());
    });
    Array.from(types).sort().forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      filterType.appendChild(opt);
    });
    Array.from(verifications).sort().forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      filterVerification.appendChild(opt);
    });
    Array.from(src).sort().forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      filterSource.appendChild(opt);
    });
  }

  function filterIncidentsByState(code) {
    const list = Array.isArray(incidents) ? incidents : [];
    return list
      .filter((item) => {
        const matchesState = code ? (item.location && item.location.state === code) : true;
        const matchesType = filterType.value ? item.activity_type === filterType.value : true;
        const matchesVer = filterVerification.value ? item.verification === filterVerification.value : true;
        const matchesSource = filterSource.value ? item.source === filterSource.value : true;
        return matchesState && matchesType && matchesVer && matchesSource;
      })
      .sort((a, b) => new Date(b.reported_at || 0) - new Date(a.reported_at || 0));
  }

  function renderKpis(code) {
    const stateIncidents = filterIncidentsByState(code);
    const total = stateIncidents.length;
    const latest = stateIncidents[0]?.reported_at || latestReportedAt || "";
    const uniqueSources = new Set(stateIncidents.map((i) => i.source).filter(Boolean));
    const verifications = stateIncidents.reduce((acc, cur) => {
      const key = cur.verification || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    kpiIncidents.textContent = total || "--";
    kpiLatest.textContent = formatDate(latest);
    kpiSources.textContent = uniqueSources.size ? uniqueSources.size : "--";
    const verText = Object.entries(verifications)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
    kpiVerification.textContent = verText || "--";
    if (mapKpiIncidents) mapKpiIncidents.textContent = total || "--";
    if (mapKpiLatest) mapKpiLatest.textContent = formatDate(latest);
    if (mapKpiSources) mapKpiSources.textContent = uniqueSources.size ? uniqueSources.size : "--";
    if (mapKpiVerification) mapKpiVerification.textContent = verText || "--";

    overviewState.textContent = code ? getStateName(code) : "Select a state";
    overviewVerification.textContent = formatDate(generatedAt || latestReportedAt);
  }

  function renderIncidents(code) {
    if (!incidentsTableBody || !incidentsEmpty) return;
    incidentsTableBody.innerHTML = "";
    const data = filterIncidentsByState(code);
    if (!data.length) {
      incidentsEmpty.classList.remove("hidden");
      return;
    }
    incidentsEmpty.classList.add("hidden");
    data.forEach((item) => {
      const row = document.createElement("tr");
      row.className = "border-b border-neutral last:border-0 dark:border-dark-neutral-border";
      const cells = [
        formatDate(item.reported_at),
        item.location?.city || "--",
        item.activity_type || "--",
        item.verification || "--",
        typeof item.confidence === "number" ? item.confidence.toFixed(2) : "--",
        item.source || "--"
      ];
      cells.forEach((value, idx) => {
        const td = document.createElement("td");
        td.className = "px-4 py-3 text-sm text-gray-800 dark:text-gray-dark-900 align-top";
        if (idx === 2 || idx === 3 || idx === 5) {
          const badge = document.createElement("span");
          badge.className = "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-bg text-black text-xs dark:bg-dark-neutral dark:text-black";
          badge.textContent = value;
          td.appendChild(badge);
        } else {
          td.textContent = value;
        }
        row.appendChild(td);
      });
      incidentsTableBody.appendChild(row);
    });
  }

  function renderActivityFeed(code) {
    if (!activityFeed) return;
    activityFeed.innerHTML = "";
    const data = filterIncidentsByState(code).slice(0, 6);
    data.forEach((item) => {
      const li = document.createElement("li");
      li.className = "border border-neutral rounded-lg p-3 bg-black dark:bg-black dark:border-dark-neutral-border";
      const title = document.createElement("p");
      title.className = "font-semibold text-sm text-gray-900 dark:text-gray-dark-900";
      title.textContent = `${item.activity_type || "Unknown"} • ${item.verification || "Unverified"}`;
      const desc = document.createElement("p");
      desc.className = "text-sm text-gray-600 dark:text-gray-dark-600 mt-1";
      desc.textContent = item.description || "No description available.";
      const meta = document.createElement("p");
      meta.className = "text-xs text-gray-500 dark:text-gray-dark-500 mt-1";
      meta.textContent = `${formatDate(item.reported_at)} • ${item.location?.city || "Unknown city"}, ${item.location?.state || ""}`;
      li.append(title, desc, meta);
      activityFeed.appendChild(li);
    });
  }

  function renderMiniSummaries(code) {
    const data = filterIncidentsByState(code);
    const verifications = data.reduce((acc, cur) => {
      const key = cur.verification || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const types = data.reduce((acc, cur) => {
      const key = cur.activity_type || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const verText = Object.entries(verifications)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
    const typeText = Object.entries(types)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
    verificationSummary.textContent = verText || "No verification data";
    typeSummary.textContent = typeText || "No activity type data";
    renderBars(verificationBars, verifications);
    renderBars(typeBars, types);
  }

  function renderBars(container, data) {
    if (!container) return;
    container.innerHTML = "";
    const entries = Object.entries(data);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    if (!total) {
      const empty = document.createElement("p");
      empty.className = "text-xs text-gray-500 dark:text-gray-dark-500";
      empty.textContent = "No data";
      container.appendChild(empty);
      return;
    }
    entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .forEach(([label, count]) => {
        const row = document.createElement("div");
        row.className = "flex items-center gap-2";
        const name = document.createElement("span");
        name.className = "text-xs text-gray-500 dark:text-gray-dark-500 w-24 truncate";
        name.textContent = label;
        const barWrap = document.createElement("div");
        barWrap.className = "flex-1 h-2 rounded-full bg-neutral dark:bg-dark-neutral-border overflow-hidden";
        const bar = document.createElement("div");
        bar.className = "h-full bg-[#f1f1f1]";
        bar.style.width = `${Math.max(6, Math.round((count / total) * 100))}%`;
        const value = document.createElement("span");
        value.className = "text-xs text-gray-500 dark:text-gray-dark-500 w-8 text-right";
        value.textContent = `${count}`;
        barWrap.appendChild(bar);
        row.append(name, barWrap, value);
        container.appendChild(row);
      });
  }

  function renderContacts(code) {
    if (!contactsGrid || !contactsEmpty) return;
    if (contactsPrimary) contactsPrimary.innerHTML = "";
    contactsGrid.innerHTML = "";
    const payload = locationsByState[code];
    const locations = payload?.locations || [];
    contactsState.textContent = getStateName(code);
    if (!locations.length) {
      contactsEmpty.classList.remove("hidden");
      if (contactsPrimary) contactsPrimary.classList.add("hidden");
      return;
    }
    contactsEmpty.classList.add("hidden");
    if (contactsPrimary) contactsPrimary.classList.remove("hidden");
    const primaryList = locations.slice(0, Math.min(2, locations.length));
    const secondaryList = locations.slice(primaryList.length);

    primaryList.forEach((location) => {
      if (!contactsPrimary) return;
      const card = document.createElement("div");
      card.className = "border border-neutral rounded-xl p-4 bg-black dark:bg-black dark:border-dark-neutral-border flex flex-col gap-2";
      const title = document.createElement("p");
      title.className = "text-sm font-semibold text-gray-900 dark:text-gray-dark-900";
      title.textContent = location.name || location.state || "Organization";
      const phone = document.createElement("a");
      phone.className = "text-2xl font-semibold text-gray-1100 dark:text-gray-dark-1100";
      phone.textContent = location.phone || "No phone";
      if (location.phone) {
        const tel = location.phone.replace(/[^\d+]/g, "");
        phone.href = `tel:${tel || location.phone}`;
      } else {
        phone.href = "#";
      }
      const area = document.createElement("p");
      area.className = "text-xs text-gray-600 dark:text-gray-dark-600";
      area.textContent = location.service_area || "Service area not listed";
      card.append(title, phone, area);
      contactsPrimary.appendChild(card);
    });

    secondaryList.forEach((location) => {
      const card = document.createElement("div");
      card.className = "border border-neutral rounded-xl p-4 bg-black dark:bg-black dark:border-dark-neutral-border flex flex-col gap-2";
      const title = document.createElement("p");
      title.className = "text-base font-semibold text-gray-900 dark:text-gray-dark-900";
      title.textContent = location.name || location.state || "Organization";
      const area = document.createElement("p");
      area.className = "text-sm text-gray-600 dark:text-gray-dark-600";
      area.textContent = location.service_area || "Service area not listed";
      const phone = document.createElement("button");
      phone.className = "text-sm font-semibold text-white hover:underline text-left";
      phone.type = "button";
      phone.textContent = location.phone || "No phone";
      phone.addEventListener("click", () => {
        if (location.phone) navigator.clipboard?.writeText(location.phone);
      });

      card.append(title, area, phone);
      const links = Array.isArray(location.links) ? location.links : [];
      if (links.length) {
        const linksWrap = document.createElement("div");
        linksWrap.className = "flex flex-wrap gap-2 text-xs";
        links.forEach((link) => {
          const anchor = document.createElement("a");
          anchor.className = "px-2 py-1 rounded-full bg-neutral-bg border border-neutral text-gray-100 dark:bg-dark-neutral-bg dark:border-dark-neutral-border dark:text-white";
          anchor.href = link.url;
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
          anchor.textContent = link.type || "Link";
          linksWrap.appendChild(anchor);
        });
        card.appendChild(linksWrap);
      }
      if (location.notes) {
        const notes = document.createElement("p");
        notes.className = "text-xs text-gray-500 dark:text-gray-dark-500";
        notes.textContent = location.notes;
        card.appendChild(notes);
      }
      contactsGrid.appendChild(card);
    });
  }

  function renderGapCallouts() {
    if (!gapCallouts) return;
    gapCallouts.innerHTML = "";
    const gaps = [
      "Padlet (People Over Papers) unavailable in this snapshot.",
      "ICE In My Area blocked (Firebase AppCheck required).",
      "ICE Tea Watch offline (SSL / deployment missing).",
      "DeportationTracker & TRAC provide statistics only (no incident feed).",
      "Some incidents have missing city/state when source addresses are not parseable."
    ];
    gaps.forEach((text) => {
      const alert = document.createElement("div");
      alert.className = "border border-orange-200 bg-black rounded-xl p-3 text-sm text-gray-800 dark:text-gray-dark-900 dark:bg-black dark:border-dark-neutral-border";
      alert.textContent = text;
      gapCallouts.appendChild(alert);
    });
  }

  function renderSourceCards() {
    if (!sourceCards) return;
    sourceCards.innerHTML = "";
    sources.forEach((src) => {
      const card = document.createElement("div");
      card.className = "border border-neutral rounded-xl p-4 bg-black dark:bg-black dark:border-dark-neutral-border flex flex-col gap-2";
      const title = document.createElement("p");
      title.className = "font-semibold text-gray-900 dark:text-gray-dark-900";
      title.textContent = src.name || src.id;
      const tier = document.createElement("p");
      tier.className = "text-xs text-gray-500 dark:text-gray-dark-500";
      tier.textContent = `Tier: ${src.tier || "-"}`;
      const status = document.createElement("span");
      status.className = "inline-flex px-2 py-1 rounded-full bg-neutral-bg text-xs text-gray-800 dark:bg-dark-neutral dark:text-gray-dark-800";
      status.textContent = src.access?.status || "unknown";
      const notes = document.createElement("p");
      notes.className = "text-xs text-gray-600 dark:text-gray-dark-600";
      notes.textContent = src.access?.notes || src.coverage || "";
      card.append(title, tier, status, notes);
      sourceCards.appendChild(card);
    });
  }

  function setActiveState(code, options = {}) {
    if (!code || !stateCodes[code]) return;
    const { source = "system" } = options;
    if (source === "manual") {
      userSelectedState = true;
      saveSelectedState(code);
    }
    activeStateCode = code;
    if (stateSelect) stateSelect.value = code;
    stateSearchInputs.forEach((input) => {
      input.value = stateCodes[code];
    });
    const el = document.getElementById(code);
    if (el) setSelectedStateEl(el);
    renderKpis(code);
    renderIncidents(code);
    renderActivityFeed(code);
    renderMiniSummaries(code);
    renderContacts(code);
    contactsState.textContent = getStateName(code);
    stateDashboard?.classList.remove("hidden");
  }

  function handleSelectChange(event) {
    const code = event.target.value;
    if (code) setActiveState(code, { source: "manual" });
  }

  function handleSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    if (!query) return;
    const matchEntry = Object.entries(stateCodes).find(
      ([code, name]) => code.toLowerCase() === query || name.toLowerCase().includes(query)
    );
    if (matchEntry) setActiveState(matchEntry[0], { source: "manual" });
  }

  function setupTabs() {
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("active", "bg-black", "shadow"));
        tabPanels.forEach((p) => p.classList.add("hidden"));
        btn.classList.add("active", "bg-black", "shadow");
        const target = document.querySelector(btn.dataset.target);
        if (target) target.classList.remove("hidden");
      });
    });
  }

  function getDefaultStateCode() {
    const counts = {};
    incidents.forEach((item) => {
      const code = item.location?.state;
      if (!code || !stateCodes[code]) return;
      counts[code] = (counts[code] || 0) + 1;
    });
    let topCode = "";
    let topCount = 0;
    Object.entries(counts).forEach(([code, count]) => {
      if (count > topCount) {
        topCount = count;
        topCode = code;
      }
    });
    return topCode;
  }

  async function init() {
    // Fetch static config data and live incident data in parallel
    const [statesResponse, locationsResponse, sourcesResponse, liveData] = await Promise.all([
      fetch("data/states.json"),
      fetch("data/locations.json"),
      fetch("data/sources.json"),
      typeof LiveData !== 'undefined' ? LiveData.fetchAllData() : fetch("data/index.json").then(r => r.json())
    ]);

    const statesPayload = await statesResponse.json();
    statesWithLocations = Array.isArray(statesPayload.states) ? statesPayload.states : [];
    locationsByState = await locationsResponse.json();

    // Use live data if available, fallback to static
    if (liveData && liveData.incidents) {
      incidents = liveData.incidents;
      latestReportedAt = incidents.length > 0 ? incidents[0].reported_at : "";
      generatedAt = new Date().toISOString();
      console.log(`Loaded ${liveData.liveCount || 0} live incidents, ${incidents.length} total`);
    } else if (liveData && liveData.incidents === undefined) {
      // Fallback: liveData is actually static index.json
      incidents = Array.isArray(liveData.incidents) ? liveData.incidents : [];
      latestReportedAt = liveData.latest_reported_at || "";
      generatedAt = liveData.generated_at || "";
    } else {
      incidents = [];
      latestReportedAt = "";
      generatedAt = "";
    }
    const sourcesPayload = await sourcesResponse.json();
    sources = Array.isArray(sourcesPayload.sources) ? sourcesPayload.sources : [];

    setThemeFromStorage();
    buildSelectOptions();
    applyDisabledStates();
    attachStateHandlers();
    buildFilterOptions();
    renderGapCallouts();
    renderSourceCards();
    setupTabs();

    themeToggle?.addEventListener("click", toggleTheme);
    stateSelect?.addEventListener("change", handleSelectChange);
    stateSearchInputs.forEach((input) => {
      input.addEventListener("input", handleSearch);
    });
    [filterType, filterVerification, filterSource].forEach((el) =>
      el?.addEventListener("change", () => setActiveState(activeStateCode))
    );

    const savedState = getSavedState();
    if (savedState) {
      userSelectedState = true;
      setActiveState(savedState, { source: "manual" });
      return;
    }

    detectStateCode().then((code) => {
      if (userSelectedState) return;
      if (code) {
        setActiveState(code, { source: "auto" });
        return;
      }
      const defaultState = getDefaultStateCode();
      if (defaultState) setActiveState(defaultState, { source: "auto" });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
