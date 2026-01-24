/**
 * LIVE DATA FETCHER
 * Fetches real-time data from community sources with static fallback
 * Designed for static hosting (Arweave compatible)
 */

const LiveData = (() => {
  // Data source configurations
  const SOURCES = {
    stopIce: {
      name: 'Stop ICE Alerts',
      url: 'https://www.stopice.net/login/?recentmapdata=1&duration=since_yesterday',
      type: 'xml'
    },
    deportationTracker: {
      name: 'DeportationTracker',
      url: 'https://firestore.googleapis.com/v1/projects/tracker-114f3/databases/(default)/documents/stats/deportation_data',
      type: 'json'
    },
    ojonc: {
      name: 'OJONC (Siembra NC)',
      url: 'https://xeypvrvvqgjmajccowfy.supabase.co/rest/v1/markers?select=*&active=eq.true&moderation_status=eq.approved',
      type: 'json',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhleXB2cnZ2cWdqbWFqY2Nvd2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDYxOTIsImV4cCI6MjA3ODgwNjE5Mn0.mbT6DuE1wJSk1Fc9f110BJX7a1cBfwuYxjVrh2wWr6k',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhleXB2cnZ2cWdqbWFqY2Nvd2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDYxOTIsImV4cCI6MjA3ODgwNjE5Mn0.mbT6DuE1wJSk1Fc9f110BJX7a1cBfwuYxjVrh2wWr6k'
      }
    }
  };

  // State abbreviation mapping
  const STATE_NAME_TO_ABBR = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC'
  };

  const STATE_ABBRS = new Set(Object.values(STATE_NAME_TO_ABBR));

  // Cache for fetched data
  let cache = {
    incidents: null,
    stats: null,
    lastFetch: null,
    sources: {}
  };

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Parse Stop ICE XML-like map data
   */
  function parseStopIceData(text) {
    const incidents = [];
    const mapDataMatches = text.match(/<map_data>([\s\S]*?)<\/map_data>/gi) || [];

    for (const block of mapDataMatches) {
      const getValue = (tag) => {
        const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        return match ? match[1].trim() : '';
      };

      const lat = parseFloat(getValue('lat'));
      const lng = parseFloat(getValue('long'));
      const description = getValue('message') || getValue('description') || '';
      const timestamp = getValue('timestamp') || getValue('date') || '';
      const id = getValue('id') || getValue('alert_id') || '';
      const location = getValue('location') || getValue('address') || '';
      const status = getValue('status') || '';

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) continue;

      // Parse state from location
      let state = '';
      const stateMatch = location.match(/,\s*([A-Z]{2})\b/) || location.match(/\b([A-Z]{2})\s*\d{5}/);
      if (stateMatch && STATE_ABBRS.has(stateMatch[1])) {
        state = stateMatch[1];
      }

      // Determine activity type
      let activityType = 'presence';
      const descLower = description.toLowerCase();
      if (descLower.includes('arrest') || descLower.includes('detained') || descLower.includes('custody')) {
        activityType = 'arrest';
      } else if (descLower.includes('checkpoint') || descLower.includes('roadblock')) {
        activityType = 'checkpoint';
      } else if (descLower.includes('raid') || descLower.includes('operation')) {
        activityType = 'raid';
      }

      // Determine verification status
      let verification = 'community';
      if (status.toLowerCase().includes('confirmed') || status.toLowerCase().includes('verified')) {
        verification = 'verified';
      } else if (status.toLowerCase().includes('unconfirmed')) {
        verification = 'unverified';
      }

      incidents.push({
        id: `stopice-${id || hashCode(description + timestamp)}`,
        source: 'stop_ice',
        reported_at: parseTimestamp(timestamp),
        location: {
          city: location.split(',')[0]?.trim() || '',
          state: state,
          lat: lat,
          lng: lng
        },
        activity_type: activityType,
        description: description,
        verification: verification,
        confidence: verification === 'verified' ? 0.85 : 0.65
      });
    }

    return incidents;
  }

  /**
   * Parse OJONC Supabase markers
   */
  function parseOjoncData(records) {
    if (!Array.isArray(records)) return [];

    return records.map(rec => {
      const lat = parseFloat(rec.latitude);
      const lng = parseFloat(rec.longitude);
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

      const description = rec.description || rec.title || '';
      const activityType = (rec.marker_type || 'presence').toLowerCase();

      let state = '';
      if (rec.state && STATE_ABBRS.has(rec.state.toUpperCase())) {
        state = rec.state.toUpperCase();
      }

      return {
        id: `ojonc-${rec.id || hashCode(description + rec.created_at)}`,
        source: 'ojonc',
        reported_at: rec.created_at || rec.updated_at || new Date().toISOString(),
        location: {
          city: rec.city || rec.address || '',
          state: state,
          lat: lat,
          lng: lng
        },
        activity_type: activityType.includes('arrest') ? 'arrest' :
                       activityType.includes('checkpoint') ? 'checkpoint' :
                       activityType.includes('raid') ? 'raid' : 'presence',
        description: description,
        verification: rec.moderation_status === 'approved' ? 'moderator' : 'community',
        confidence: rec.moderation_status === 'approved' ? 0.75 : 0.55
      };
    }).filter(Boolean);
  }

  /**
   * Parse DeportationTracker stats
   */
  function parseDeportationStats(data) {
    if (!data || !data.fields) return null;

    const getVal = (field) => {
      const f = data.fields[field];
      if (!f) return 0;
      return parseInt(f.integerValue || f.stringValue || '0', 10);
    };

    return {
      daily_arrests: getVal('daily_arrests'),
      daily_deportations: getVal('daily_deportations'),
      daily_detentions: getVal('daily_detentions'),
      total_arrests: getVal('total_arrests'),
      total_deportations: getVal('total_deportations'),
      total_detentions: getVal('total_detentions'),
      lastUpdated: data.fields.lastUpdated?.timestampValue || new Date().toISOString()
    };
  }

  /**
   * Simple hash function for generating IDs
   */
  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Parse various timestamp formats
   */
  function parseTimestamp(value) {
    if (!value) return new Date().toISOString();

    // Try ISO format first
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) {
      return isoDate.toISOString();
    }

    // Try common formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/,  // MM/DD/YYYY HH:MM
      /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/  // ISO-ish
    ];

    for (const fmt of formats) {
      const match = value.match(fmt);
      if (match) {
        try {
          const d = new Date(value);
          if (!isNaN(d.getTime())) return d.toISOString();
        } catch (e) {}
      }
    }

    return new Date().toISOString();
  }

  /**
   * Fetch with timeout and error handling
   */
  async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: 'cors'
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Fetch from Stop ICE
   */
  async function fetchStopIce() {
    try {
      const response = await fetchWithTimeout(SOURCES.stopIce.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const incidents = parseStopIceData(text);
      cache.sources.stopIce = { status: 'ok', count: incidents.length, fetchedAt: new Date().toISOString() };
      return incidents;
    } catch (error) {
      console.warn('Stop ICE fetch failed (CORS expected):', error.message);
      cache.sources.stopIce = { status: 'error', error: error.message };
      return null;
    }
  }

  /**
   * Fetch from OJONC Supabase
   */
  async function fetchOjonc() {
    try {
      const response = await fetchWithTimeout(SOURCES.ojonc.url, {
        headers: SOURCES.ojonc.headers
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const incidents = parseOjoncData(data);
      cache.sources.ojonc = { status: 'ok', count: incidents.length, fetchedAt: new Date().toISOString() };
      return incidents;
    } catch (error) {
      console.warn('OJONC fetch failed:', error.message);
      cache.sources.ojonc = { status: 'error', error: error.message };
      return null;
    }
  }

  /**
   * Fetch from DeportationTracker
   */
  async function fetchDeportationStats() {
    try {
      const response = await fetchWithTimeout(SOURCES.deportationTracker.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const stats = parseDeportationStats(data);
      cache.sources.deportationTracker = { status: 'ok', fetchedAt: new Date().toISOString() };
      return stats;
    } catch (error) {
      console.warn('DeportationTracker fetch failed:', error.message);
      cache.sources.deportationTracker = { status: 'error', error: error.message };
      return null;
    }
  }

  /**
   * Fetch static fallback data
   */
  async function fetchStaticData() {
    try {
      const response = await fetch('data/index.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Static data fetch failed:', error);
      return null;
    }
  }

  /**
   * Merge live data with static data, deduplicating by ID
   */
  function mergeIncidents(liveIncidents, staticData) {
    const seen = new Set();
    const merged = [];

    // Add live incidents first (they're more recent)
    for (const incident of liveIncidents) {
      if (!seen.has(incident.id)) {
        seen.add(incident.id);
        merged.push(incident);
      }
    }

    // Add static incidents that aren't duplicates
    if (staticData && staticData.incidents) {
      for (const incident of staticData.incidents) {
        if (!seen.has(incident.id)) {
          seen.add(incident.id);
          merged.push(incident);
        }
      }
    }

    // Sort by reported_at descending
    merged.sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at));

    return merged;
  }

  /**
   * Main fetch function - gets live data with static fallback
   */
  async function fetchAllData(forceRefresh = false) {
    // Check cache
    if (!forceRefresh && cache.incidents && cache.lastFetch) {
      const age = Date.now() - cache.lastFetch;
      if (age < CACHE_DURATION) {
        console.log('Using cached data, age:', Math.round(age / 1000), 'seconds');
        return {
          incidents: cache.incidents,
          stats: cache.stats,
          sources: cache.sources,
          fromCache: true
        };
      }
    }

    console.log('Fetching live data from sources...');

    // Fetch from all sources in parallel
    const [stopIceData, ojoncData, deportationStats, staticData] = await Promise.all([
      fetchStopIce(),
      fetchOjonc(),
      fetchDeportationStats(),
      fetchStaticData()
    ]);

    // Combine live incident data
    const liveIncidents = [
      ...(stopIceData || []),
      ...(ojoncData || [])
    ];

    // Merge with static data
    const allIncidents = mergeIncidents(liveIncidents, staticData);

    // Update cache
    cache.incidents = allIncidents;
    cache.stats = deportationStats || (staticData?.stats || null);
    cache.lastFetch = Date.now();

    const liveCount = liveIncidents.length;
    const staticCount = staticData?.incidents?.length || 0;
    console.log(`Data loaded: ${liveCount} live incidents, ${allIncidents.length} total (${staticCount} from static)`);

    return {
      incidents: allIncidents,
      stats: cache.stats,
      sources: cache.sources,
      liveCount: liveCount,
      staticCount: staticCount,
      fromCache: false
    };
  }

  /**
   * Get incidents filtered by state
   */
  async function getIncidentsByState(stateCode) {
    const data = await fetchAllData();
    return data.incidents.filter(i =>
      i.location?.state?.toUpperCase() === stateCode.toUpperCase()
    );
  }

  /**
   * Get current data source status
   */
  function getSourceStatus() {
    return {
      sources: cache.sources,
      lastFetch: cache.lastFetch ? new Date(cache.lastFetch).toISOString() : null,
      cacheAge: cache.lastFetch ? Math.round((Date.now() - cache.lastFetch) / 1000) : null
    };
  }

  // Public API
  return {
    fetchAllData,
    getIncidentsByState,
    getSourceStatus,
    SOURCES,
    clearCache: () => {
      cache = { incidents: null, stats: null, lastFetch: null, sources: {} };
    }
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiveData;
}
