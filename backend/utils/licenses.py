def license_allows_riffing(license_name: str) -> bool:
    """
    Returns True if the license permits remixing/riffing.
    """
    if not license_name:
        return False

    allowed = {
        "CC0",
        "CC-BY",
        "CC-BY-SA"
    }

    return license_name.upper() in allowed