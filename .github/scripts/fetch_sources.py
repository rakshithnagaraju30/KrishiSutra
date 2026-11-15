"""
Reads public agricultural source pages (TNAU, ICAR, UAS, KVK…) and prints their text to the job log,
so content can be entered with exact citations. Nothing is stored in the repository.

Usage: python fetch_sources.py "<url1> <url2> …"   (max 25 URLs, whitespace/newline separated)
"""
import io
import re
import sys
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

MAX_URLS = 25
MAX_CHARS = 20000
HEADERS = {"User-Agent": "KrishiSutra-content-research/1.0 (reading public extension pages for citation)"}


def page_text(html: str, base: str):
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    title = (soup.title.get_text(" ", strip=True) if soup.title else "")
    # Table cells become " | "-separated; nested layout tables repeat text, so duplicate lines are dropped.
    for cell in soup.find_all(["td", "th"]):
        cell.append(" | ")
    for row in soup.find_all("tr"):
        row.append("\n")
    raw = soup.get_text("")
    out, seen = [], set()
    for line in raw.splitlines():
        line = re.sub(r"[ \t\xa0]+", " ", line).strip(" |")
        line = re.sub(r"(\s*\|\s*)+", " | ", line).strip()
        if not line or line in seen:
            continue
        if line.startswith("Home | Seasons") or line.startswith("© All Rights") or "All Rights Reserved" in line:
            continue
        seen.add(line)
        out.append(line)
    text = "\n".join(out)
    host = urlparse(base).netloc
    links, seen_links = [], set()
    for a in BeautifulSoup(html, "html.parser").find_all("a", href=True):
        href = urljoin(base, a["href"].strip())
        if urlparse(href).netloc == host and href not in seen_links and not href.startswith("mailto:"):
            seen_links.add(href)
            links.append(f"{a.get_text(' ', strip=True)[:80]} -> {href}")
    return title, text, links


def pdf_text(data: bytes) -> str:
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(data))
    return "\n".join((p.extract_text() or "") for p in reader.pages)


def main():
    urls = [u for u in re.split(r"\s+", " ".join(sys.argv[1:])) if u.startswith("http")][:MAX_URLS]
    print(f"Fetching {len(urls)} source(s) at {datetime.now(timezone.utc).isoformat()}")
    for i, url in enumerate(urls, 1):
        print(f"\n===== SOURCE {i}: {url} =====")
        try:
            r = requests.get(url, headers=HEADERS, timeout=40)
            print(f"HTTP {r.status_code} | {r.headers.get('content-type', '')}")
            if "pdf" in r.headers.get("content-type", "").lower() or url.lower().endswith(".pdf"):
                body, links, title = pdf_text(r.content), [], "(PDF)"
            else:
                r.encoding = r.apparent_encoding or r.encoding
                title, body, links = page_text(r.text, url)
            print(f"TITLE: {title}")
            print("--- TEXT ---")
            print(body[:MAX_CHARS] + ("\n[…truncated…]" if len(body) > MAX_CHARS else ""))
            if links:
                print("--- LINKS (same site) ---")
                print("\n".join(links[:120]))
        except Exception as exc:  # report and continue with the next URL
            print(f"ERROR: {type(exc).__name__}: {exc}")
        print(f"===== END SOURCE {i} =====")


if __name__ == "__main__":
    main()
