#!/usr/bin/env python3
import datetime as dt
import hashlib
import json
import math
import re
import ssl
import sys
import urllib.error
import urllib.request
from html import unescape
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
NORMALIZED_DIR = DATA_DIR / "normalized"
INCIDENTS_DIR = DATA_DIR / "incidents"
STATES_DIR = DATA_DIR / "states"

USER_AGENT = "Mozilla/5.0 (compatible; CodexDataBot/1.0)"

STATE_ABBR = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
    "DC": "District of Columbia",
}
STATE_NAME_TO_ABBR = {v.lower(): k for k, v in STATE_ABBR.items()}


def iso_now() -> str:
    return dt.datetime.now(tz=dt.timezone.utc).isoformat()


def ensure_dirs() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    NORMALIZED_DIR.mkdir(parents=True, exist_ok=True)
    INCIDENTS_DIR.mkdir(parents=True, exist_ok=True)
    STATES_DIR.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")


def fetch_text(url: str, timeout: int = 30, allow_insecure: bool = False, headers: Optional[Dict[str, str]] = None) -> Tuple[Optional[str], Dict[str, Any]]:
    req_headers = {"User-Agent": USER_AGENT}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, headers=req_headers)
    ctx = None
    if allow_insecure:
        ctx = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            body = resp.read()
            encoding = resp.headers.get_content_charset() or "utf-8"
            return body.decode(encoding, errors="replace"), {"status": resp.status}
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8", errors="replace")
        return None, {"status": err.code, "error": str(err), "body": body[:4000]}
    except Exception as err:  # pylint: disable=broad-except
        return None, {"status": None, "error": str(err)}


def fetch_json(url: str, timeout: int = 30, allow_insecure: bool = False, headers: Optional[Dict[str, str]] = None) -> Tuple[Optional[Any], Dict[str, Any]]:
    text, meta = fetch_text(url, timeout=timeout, allow_insecure=allow_insecure, headers=headers)
    if text is None:
        return None, meta
    try:
        return json.loads(text), meta
    except json.JSONDecodeError as err:
        return None, {**meta, "error": f"json decode error: {err}", "body": text[:4000]}


def sha1_id(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()


def parse_city_state(value: str) -> Tuple[str, str]:
    if not value:
        return "", ""
    cleaned = re.sub(r"\s+", " ", value.strip())
    # Prefer explicit state abbreviation after comma
    abbr_match = re.search(r",\s*([A-Z]{2})\b", cleaned)
    if abbr_match:
        state = abbr_match.group(1)
        city = cleaned.split(",")[0].strip()
        if state in STATE_ABBR:
            return city, state
    # Fallback: scan tokens for state abbreviation
    tokens = re.split(r"[\s,]+", cleaned)
    for idx, token in enumerate(tokens):
        if token in STATE_ABBR:
            city = " ".join(tokens[:idx]).strip()
            return city, token
    # Fallback: scan for full state name
    lowered = cleaned.lower()
    for name, abbr in STATE_NAME_TO_ABBR.items():
        if name in lowered:
            city = cleaned[: lowered.index(name)].strip(" ,")
            return city, abbr
    return "", ""


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def parse_stopice_timestamp(value: str, fallback_iso: str) -> str:
    if not value:
        return fallback_iso
    cleaned = value.strip()
    try:
        # Example: "jan 17, 2026 (15:15:54) PST"
        cleaned = cleaned.title().replace(" Pst", " PST")
        dt_obj = dt.datetime.strptime(cleaned, "%b %d, %Y (%H:%M:%S) PST")
        tz = dt.timezone(dt.timedelta(hours=-8))
        dt_obj = dt_obj.replace(tzinfo=tz)
        return dt_obj.astimezone(dt.timezone.utc).isoformat()
    except Exception:
        return fallback_iso


def normalize_activity_type(value: str) -> str:
    if not value:
        return "unknown"
    text = value.lower()
    if "raid" in text:
        return "raid"
    if "checkpoint" in text:
        return "checkpoint"
    if "arrest" in text or "detain" in text or "detention" in text:
        return "arrest"
    if "sighting" in text or "presence" in text or "stakeout" in text or "staging" in text or "patrol" in text:
        return "presence"
    if "traffic stop" in text:
        return "checkpoint"
    return "unknown"


def has_vague_language(text: str) -> bool:
    if not text:
        return True
    lowered = text.lower()
    if len(lowered) < 40:
        return True
    vague_terms = ["maybe", "possible", "possibly", "seems", "unclear"]
    return any(term in lowered for term in vague_terms)


def has_rumor_language(text: str) -> bool:
    if not text:
        return False
    lowered = text.lower()
    return "rumor" in lowered or "unconfirmed" in lowered


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def similarity(a: str, b: str) -> float:
    from difflib import SequenceMatcher

    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def parse_stopice_map_data(text: str) -> List[Dict[str, str]]:
    if not text:
        return []
    blocks = re.findall(r"<map_data>(.*?)</map_data>", text, flags=re.IGNORECASE | re.DOTALL)
    records = []
    for block in blocks:
        def get_tag(tag: str) -> str:
            match = re.search(rf"<{tag}>(.*?)</{tag}>", block, flags=re.IGNORECASE | re.DOTALL)
            if not match:
                return ""
            return unescape(match.group(1).strip())

        record = {
            "id": get_tag("id"),
            "url": get_tag("url"),
            "lat": get_tag("lat"),
            "long": get_tag("long"),
            "priorityimg": get_tag("priorityimg"),
            "thispriority": get_tag("thispriority"),
            "location": get_tag("location"),
            "timestamp": get_tag("timestamp"),
            "comments": get_tag("comments"),
            "media": get_tag("media"),
        }
        records.append(record)
    return records


def normalize_stopice(records: List[Dict[str, str]], fetched_at: str) -> List[Dict[str, Any]]:
    normalized = []
    for rec in records:
        try:
            lat = float(rec.get("lat") or "")
            lng = float(rec.get("long") or "")
        except ValueError:
            continue
        timestamp = parse_stopice_timestamp(rec.get("timestamp") or "", fetched_at)
        description = (rec.get("comments") or rec.get("thispriority") or "").strip()
        city, state = parse_city_state(rec.get("location") or "")
        priority_text = (rec.get("thispriority") or "").lower()
        verification = "community"
        base_confidence = 0.65
        if "unconfirmed" in priority_text:
            verification = "unverified"
            base_confidence = 0.30
        activity = normalize_activity_type(rec.get("thispriority") or rec.get("comments") or "")
        confidence = base_confidence
        if rec.get("media"):
            confidence += 0.05
        if "confirmed" in priority_text:
            confidence += 0.10
        if has_vague_language(description):
            confidence -= 0.15
        if has_rumor_language(description):
            confidence -= 0.20
        confidence = clamp(confidence)
        norm = {
            "id": f"stopice-{rec.get('id') or sha1_id(description + timestamp)}",
            "source": "stop_ice",
            "reported_at": timestamp,
            "location": {
                "city": city,
                "state": state,
                "lat": lat,
                "lng": lng,
            },
            "activity_type": activity,
            "description": description,
            "verification": verification,
            "confidence": confidence,
        }
        normalized.append(norm)
    return normalized


def normalize_ojonc(records: List[Dict[str, Any]], fetched_at: str) -> List[Dict[str, Any]]:
    normalized = []
    for rec in records:
        lat = rec.get("latitude")
        lng = rec.get("longitude")
        if lat is None or lng is None:
            continue
        reported_at = rec.get("incident_time") or rec.get("created_at") or fetched_at
        description = (rec.get("description_en") or rec.get("description") or "").strip()
        address = rec.get("address") or rec.get("city_or_town") or rec.get("specific_location") or ""
        city, state = parse_city_state(address)
        incident_type = rec.get("incident_type") or ""
        activity = normalize_activity_type(incident_type)
        verification = "community"
        base_confidence = 0.55
        if rec.get("moderation_status") == "approved":
            verification = "moderator"
        if not rec.get("active", True):
            verification = "unverified"
            base_confidence = 0.30
        confidence = base_confidence
        if rec.get("confirmations_count", 0) > 0:
            confidence += 0.10
        if rec.get("image_url"):
            confidence += 0.05
        if has_vague_language(description):
            confidence -= 0.15
        if has_rumor_language(description):
            confidence -= 0.20
        confidence = clamp(confidence)
        norm = {
            "id": f"ojonc-{rec.get('id') or sha1_id(description + reported_at)}",
            "source": "ojonc",
            "reported_at": reported_at,
            "location": {
                "city": city,
                "state": state,
                "lat": float(lat),
                "lng": float(lng),
            },
            "activity_type": activity,
            "description": description,
            "verification": verification,
            "confidence": confidence,
        }
        normalized.append(norm)
    return normalized


def deduplicate(incidents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    incidents = sorted(incidents, key=lambda x: x.get("reported_at", ""))
    merged: List[Dict[str, Any]] = []
    for inc in incidents:
        matched_idx = None
        for idx, existing in enumerate(merged):
            try:
                t1 = dt.datetime.fromisoformat(inc["reported_at"].replace("Z", "+00:00"))
                t2 = dt.datetime.fromisoformat(existing["reported_at"].replace("Z", "+00:00"))
            except Exception:
                continue
            if abs((t1 - t2).total_seconds()) > 2 * 3600:
                continue
            dist = haversine_km(
                inc["location"]["lat"],
                inc["location"]["lng"],
                existing["location"]["lat"],
                existing["location"]["lng"],
            )
            if dist > 1.0:
                continue
            sim = similarity(inc.get("description", ""), existing.get("description", ""))
            if sim < 0.75:
                continue
            matched_idx = idx
            break
        if matched_idx is None:
            merged.append(inc)
            continue
        base = merged[matched_idx]
        sources = {s.strip() for s in (base.get("source", "").split(";") + inc.get("source", "").split(";")) if s.strip()}
        base["source"] = ";".join(sorted(sources))
        if len(inc.get("description", "")) > len(base.get("description", "")):
            base["description"] = inc.get("description", "")
        if inc.get("confidence", 0.0) > base.get("confidence", 0.0):
            base["confidence"] = inc.get("confidence", 0.0)
            base["location"] = inc.get("location", base.get("location"))
            base["activity_type"] = inc.get("activity_type", base.get("activity_type"))
            base["verification"] = inc.get("verification", base.get("verification"))
            base["reported_at"] = inc.get("reported_at", base.get("reported_at"))
        base["confidence"] = clamp(base.get("confidence", 0.0) + 0.10)
        merged[matched_idx] = base
    # Rebuild IDs to reflect merged sources
    for inc in merged:
        id_seed = f"{inc.get('source')}|{inc.get('reported_at')}|{inc.get('location', {}).get('lat')}|{inc.get('location', {}).get('lng')}|{inc.get('description', '')}"
        inc["id"] = f"inc-{sha1_id(id_seed)}"
    return merged


def group_by_date(incidents: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    buckets: Dict[str, List[Dict[str, Any]]] = {}
    for inc in incidents:
        try:
            dt_obj = dt.datetime.fromisoformat(inc["reported_at"].replace("Z", "+00:00"))
            date_key = dt_obj.date().isoformat()
        except Exception:
            date_key = "unknown"
        buckets.setdefault(date_key, []).append(inc)
    return buckets


def group_by_state(incidents: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    buckets: Dict[str, List[Dict[str, Any]]] = {}
    for inc in incidents:
        state = inc.get("location", {}).get("state") or ""
        if not state:
            continue
        buckets.setdefault(state, []).append(inc)
    return buckets


def parse_html_tables(html_text: str) -> List[Dict[str, Any]]:
    from html.parser import HTMLParser

    class TableParser(HTMLParser):
        def __init__(self) -> None:
            super().__init__()
            self.tables: List[List[List[str]]] = []
            self.current_table: List[List[str]] = []
            self.current_row: List[str] = []
            self.current_cell: List[str] = []
            self.in_table = False
            self.in_row = False
            self.in_cell = False

        def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
            if tag == "table":
                self.in_table = True
                self.current_table = []
            elif tag == "tr" and self.in_table:
                self.in_row = True
                self.current_row = []
            elif tag in ("td", "th") and self.in_row:
                self.in_cell = True
                self.current_cell = []

        def handle_endtag(self, tag: str) -> None:
            if tag in ("td", "th") and self.in_cell:
                cell_text = " ".join("".join(self.current_cell).split())
                self.current_row.append(cell_text)
                self.in_cell = False
            elif tag == "tr" and self.in_row:
                if any(cell for cell in self.current_row):
                    self.current_table.append(self.current_row)
                self.in_row = False
            elif tag == "table" and self.in_table:
                if self.current_table:
                    self.tables.append(self.current_table)
                self.in_table = False

        def handle_data(self, data: str) -> None:
            if self.in_cell:
                self.current_cell.append(data)

    parser = TableParser()
    parser.feed(html_text)
    tables_out = []
    for table in parser.tables:
        headers = table[0] if table else []
        rows = table[1:] if len(table) > 1 else []
        tables_out.append({"headers": headers, "rows": rows})
    return tables_out


def main() -> int:
    ensure_dirs()
    fetched_at = iso_now()

    # Source: People Over Papers (Padlet)
    pop_url = "https://padlet.com/peopleoverpapers/ice-map"
    pop_text, pop_meta = fetch_text(pop_url, timeout=30)
    pop_raw = {
        "source": "people_over_papers",
        "url": pop_url,
        "fetched_at": fetched_at,
        "status": pop_meta.get("status"),
        "error": pop_meta.get("error"),
        "body": pop_meta.get("body") or (pop_text[:4000] if pop_text else None),
    }
    write_json(RAW_DIR / "people_over_papers.json", pop_raw)

    # Source: ICE in my area (Firebase RTDB with AppCheck)
    icein_url = "https://iceinmyarea-default-rtdb.firebaseio.com/verified.json"
    icein_json, icein_meta = fetch_json(icein_url, timeout=30)
    icein_raw = {
        "source": "ice_in_my_area",
        "url": icein_url,
        "fetched_at": fetched_at,
        "status": icein_meta.get("status"),
        "error": icein_meta.get("error"),
        "response": icein_json if icein_json is not None else icein_meta.get("body"),
    }
    write_json(RAW_DIR / "ice_in_my_area.json", icein_raw)

    # Source: Stop ICE (public map data)
    stopice_url = "https://www.stopice.net/login/?recentmapdata=1&duration=since_yesterday"
    stopice_text, stopice_meta = fetch_text(stopice_url, timeout=60)
    stopice_records = parse_stopice_map_data(stopice_text or "")
    stopice_raw = {
        "source": "stop_ice",
        "url": stopice_url,
        "fetched_at": fetched_at,
        "status": stopice_meta.get("status"),
        "error": stopice_meta.get("error"),
        "records": stopice_records,
    }
    write_json(RAW_DIR / "stop_ice.json", stopice_raw)

    # Source: ICE Tea Watch
    icetea_url = "https://icetea.peoplesrebellion.org"
    icetea_text, icetea_meta = fetch_text(icetea_url, timeout=30, allow_insecure=True)
    icetea_raw = {
        "source": "icetea_watch",
        "url": icetea_url,
        "fetched_at": fetched_at,
        "status": icetea_meta.get("status"),
        "error": icetea_meta.get("error"),
        "body": icetea_meta.get("body") or (icetea_text[:2000] if icetea_text else None),
    }
    write_json(RAW_DIR / "icetea_watch.json", icetea_raw)

    # Source: DeportationTracker.live (Firestore stats)
    deportation_url = "https://firestore.googleapis.com/v1/projects/tracker-114f3/databases/(default)/documents/stats/deportation_data"
    deportation_json, deportation_meta = fetch_json(deportation_url, timeout=30)
    deportation_raw = {
        "source": "deportationtracker",
        "url": deportation_url,
        "fetched_at": fetched_at,
        "status": deportation_meta.get("status"),
        "error": deportation_meta.get("error"),
        "document": deportation_json,
    }
    write_json(RAW_DIR / "deportationtracker.json", deportation_raw)

    # Source: Local networks (OjoNC / Ojo Obrero)
    ojonc_url = "https://xeypvrvvqgjmajccowfy.supabase.co/rest/v1/markers?select=*&active=eq.true&moderation_status=eq.approved"
    supabase_key = (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhleXB2cnZ2cWdqbWFqY2Nvd2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDYxOTIsImV4cCI6MjA3ODgwNjE5Mn0.mbT6DuE1wJSk1Fc9f110BJX7a1cBfwuYxjVrh2wWr6k"
    )
    ojonc_json, ojonc_meta = fetch_json(
        ojonc_url,
        timeout=30,
        headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"},
    )
    local_networks_raw = {
        "source": "local_networks",
        "fetched_at": fetched_at,
        "sources": [
            {
                "id": "ojonc",
                "name": "Siembra NC - Ojo Obrero",
                "url": "https://ojonc.org",
                "status": "ok" if ojonc_json is not None else "error",
                "error": ojonc_meta.get("error"),
                "records": ojonc_json or [],
            },
            {
                "id": "icirr",
                "name": "Illinois Coalition for Immigrant and Refugee Rights",
                "url": "https://www.icirr.org",
                "status": "no_public_feed",
            },
            {
                "id": "waisn",
                "name": "Washington Immigrant Solidarity Network",
                "url": "https://www.waisn.org",
                "status": "no_public_feed",
            },
        ],
    }
    write_json(RAW_DIR / "local_networks.json", local_networks_raw)

    # Source: ICEwatch archive (IDP)
    icewatch_url = "https://www.immigrantdefenseproject.org/icewatch/"
    icewatch_text, icewatch_meta = fetch_text(icewatch_url, timeout=30)
    archive_notice = None
    if icewatch_text:
        match = re.search(r"ICEwatch was last updated.*?\.", icewatch_text, flags=re.IGNORECASE)
        if match:
            archive_notice = " ".join(match.group(0).split())
    icewatch_raw = {
        "source": "icewatch_archive",
        "url": icewatch_url,
        "fetched_at": fetched_at,
        "status": icewatch_meta.get("status"),
        "error": icewatch_meta.get("error"),
        "notice": archive_notice,
    }
    write_json(RAW_DIR / "icewatch_archive.json", icewatch_raw)

    # Source: TRAC Immigration (contextual quick facts)
    trac_url = "https://tracreports.org/immigration/quickfacts/detention.html"
    trac_text, trac_meta = fetch_text(trac_url, timeout=30)
    trac_tables = parse_html_tables(trac_text or "")
    trac_current_as_of = None
    if trac_text:
        match = re.search(r"current as of <strong>([^<]+)</strong>", trac_text, flags=re.IGNORECASE)
        if match:
            trac_current_as_of = match.group(1)
    trac_raw = {
        "source": "trac_context",
        "url": trac_url,
        "fetched_at": fetched_at,
        "status": trac_meta.get("status"),
        "error": trac_meta.get("error"),
        "current_as_of": trac_current_as_of,
        "tables": trac_tables,
    }
    write_json(RAW_DIR / "trac_context.json", trac_raw)

    # Normalize incidents
    normalized_stopice = normalize_stopice(stopice_records, fetched_at)
    normalized_ojonc = normalize_ojonc(ojonc_json or [], fetched_at)

    write_json(NORMALIZED_DIR / "stop_ice.json", {
        "source": "stop_ice",
        "fetched_at": fetched_at,
        "count": len(normalized_stopice),
        "incidents": normalized_stopice,
    })
    write_json(NORMALIZED_DIR / "local_networks.json", {
        "source": "local_networks",
        "fetched_at": fetched_at,
        "count": len(normalized_ojonc),
        "incidents": normalized_ojonc,
    })
    write_json(NORMALIZED_DIR / "deportationtracker.json", {
        "source": "deportationtracker",
        "fetched_at": fetched_at,
        "document": deportation_json,
    })
    write_json(NORMALIZED_DIR / "trac_context.json", {
        "source": "trac_context",
        "fetched_at": fetched_at,
        "current_as_of": trac_current_as_of,
        "tables": trac_tables,
    })

    # Deduplicate and partition
    combined = normalized_stopice + normalized_ojonc
    deduped = deduplicate(combined)

    # Write incidents by date
    by_date = group_by_date(deduped)
    for date_key, items in by_date.items():
        if date_key == "unknown":
            continue
        write_json(INCIDENTS_DIR / f"{date_key}.json", {
            "date": date_key,
            "count": len(items),
            "incidents": items,
        })

    # Write incidents by state
    by_state = group_by_state(deduped)
    for state, items in by_state.items():
        write_json(STATES_DIR / f"{state}.json", {
            "state": state,
            "count": len(items),
            "incidents": items,
        })

    # Index
    all_states = sorted(by_state.keys())
    latest_reported = None
    if deduped:
        latest_reported = max((i.get("reported_at") for i in deduped if i.get("reported_at")), default=None)
    index = {
        "generated_at": fetched_at,
        "incident_count": len(deduped),
        "states": all_states,
        "sources": ["stop_ice", "ojonc"],
        "latest_reported_at": latest_reported,
        "incidents": deduped,
    }
    write_json(DATA_DIR / "index.json", index)

    return 0


if __name__ == "__main__":
    sys.exit(main())
