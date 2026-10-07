import ipaddress
import socket
from urllib.parse import urlsplit


class UnsafeURL(ValueError):
    """The URL points somewhere the scraper must not reach from inside our network."""


def ensure_public_url(url):
    """Refuse anything but http(s) to a host whose every address is on the public internet.

    Without this, any signed-up user could make the server fetch localhost, the
    cloud metadata endpoint or a private network address and read the result.
    """
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https"):
        raise UnsafeURL("Only http and https URLs can be monitored.")
    if not parts.hostname:
        raise UnsafeURL("The URL has no host.")

    try:
        infos = socket.getaddrinfo(parts.hostname, parts.port or None, proto=socket.IPPROTO_TCP)
    except (socket.gaierror, UnicodeError):
        raise UnsafeURL(f"Could not resolve {parts.hostname}.")

    for info in infos:
        address = ipaddress.ip_address(str(info[4][0]).split("%")[0])
        if not address.is_global:
            raise UnsafeURL(f"{parts.hostname} is not a public address.")
