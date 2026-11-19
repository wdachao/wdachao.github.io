"""Read current public Android releases from the official Pgyer API."""
from datetime import datetime, timedelta, timezone
import json
import re
from urllib.parse import urlencode
from urllib.request import Request, urlopen

PRODUCTS = {
    "weighing": ("mangyincheng", "com.app.mangyin.scale"),
    "register": ("mangyinshouyintai", "com.app.cash_register"),
    "bookkeeping": ("mangyinjizhang", "com.app.myin.bookkeeping"),
    "mobile": ("sujietong", "com.merchant.senmang"),
}
CHINA = timezone(timedelta(hours=8))


def fetch_release(product_id, api_key):
    slug, identifier = PRODUCTS[product_id]
    request = Request("https://www.pgyer.com/apiv2/app/getByShortcut", data=urlencode({
        "_api_key": api_key, "buildShortcutUrl": slug,
    }).encode("utf-8"))
    with urlopen(request, timeout=8) as response:
        body = json.load(response)
    if body.get("code") != 0:
        raise ValueError("Pgyer lookup failed")
    data = body["data"]
    if data.get("buildIdentifier") != identifier or str(data.get("buildType")) != "2":
        raise ValueError("Pgyer application or platform mismatch")
    version, build = str(data["buildVersion"]), str(data["buildVersionNo"])
    if not re.fullmatch(r"\d+\.\d+\.\d+", version) or not build.isdigit():
        raise ValueError("Invalid Android version")
    published = datetime.strptime(data["buildCreated"], "%Y-%m-%d %H:%M:%S").replace(tzinfo=CHINA)
    return {
        "productId": product_id, "platform": "android", "version": version,
        "buildNumber": build, "publishedAt": published.isoformat(),
        "url": "https://www.pgyer.com/" + slug,
    }
