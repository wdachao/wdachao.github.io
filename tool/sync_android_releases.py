"""Standalone GitHub Actions job: query Pgyer and update changed OSS channels only.

No source-code credentials; environment variables are supplied by Actions Secrets.
This file is also copied to the public website repository at the same path.
"""
import base64
import hashlib
import json
import os
from concurrent.futures import ThreadPoolExecutor

try:
    from .pgyer_releases import PRODUCTS, fetch_release
except ImportError:
    from pgyer_releases import PRODUCTS, fetch_release

BUCKET = "mangyin-cash-weighing-2026"
REGION = "cn-hangzhou"


def release_script(release):
    return ("window.MANGYIN_RELEASES = window.MANGYIN_RELEASES || {};\n"
            f'window.MANGYIN_RELEASES["{release["productId"]}-android"] = '
            + json.dumps(release, ensure_ascii=False, indent=2) + ";\n").encode("utf-8")


def sync(api_key, bucket):
    def lookup(product_id):
        # One bad or temporarily unavailable app does not block the other three.
        try:
            return product_id, fetch_release(product_id, api_key)
        except Exception:
            return product_id, None

    failures = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        releases = list(pool.map(lookup, PRODUCTS))
    for product_id, release in releases:
        if release is None:
            failures.append(product_id)
            print(f"{product_id}: 蒲公英查询失败，保留当前官网信息")
            continue
        key = f"releases/{product_id}-android.js"
        data = release_script(release)
        try:
            current = bucket.get_object(key).read()
        except Exception as error:
            if getattr(error, "code", None) != "NoSuchKey":
                raise
            current = None
        if current == data:
            print(f"{product_id}: {release['version']} 无变化")
            continue
        bucket.put_object(key, data, headers={
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "no-store, max-age=0",
            "Content-MD5": base64.b64encode(hashlib.md5(data).digest()).decode("ascii"),
        })
        if bucket.get_object(key).read() != data:
            raise ValueError(f"{product_id}: 发布后校验失败")
        print(f"{product_id}: 已更新为 {release['version']}，发布日期 {release['publishedAt']}")
    if failures:
        raise RuntimeError("查询失败: " + ", ".join(failures))


def main():
    names = ("PGYER_API_KEY", "OSS_ACCESS_KEY_ID", "OSS_ACCESS_KEY_SECRET")
    values = [os.environ.get(name, "").strip() for name in names]
    missing = [name for name, value in zip(names, values) if not value]
    if missing:
        raise ValueError("缺少 GitHub Actions Secrets: " + ", ".join(missing))
    import oss2
    from oss2.credentials import StaticCredentialsProvider
    api_key, key_id, secret = values
    bucket = oss2.Bucket(oss2.ProviderAuthV4(StaticCredentialsProvider(key_id, secret)),
                         f"https://oss-{REGION}.aliyuncs.com", BUCKET,
                         region=REGION, connect_timeout=20)
    sync(api_key, bucket)


if __name__ == "__main__":
    main()
