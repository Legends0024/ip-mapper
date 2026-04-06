"""
Heuristic-based IP risk detection.
Uses ISP/org name pattern matching and known datacenter indicators
to flag potentially suspicious IPs without requiring a paid API.
"""

import re
import ipaddress

# Known VPN/Proxy provider patterns (case-insensitive)
VPN_PROVIDERS = [
    'nordvpn', 'expressvpn', 'surfshark', 'cyberghost', 'protonvpn',
    'private internet access', 'pia', 'mullvad', 'windscribe',
    'tunnelbear', 'hotspot shield', 'ipvanish', 'vypr', 'hide.me',
    'purevpn', 'zenmate', 'torguard', 'strongvpn', 'astrill',
]

# Hosting/datacenter provider patterns
HOSTING_PROVIDERS = [
    'amazon', 'aws', 'google cloud', 'microsoft azure', 'azure',
    'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner',
    'cloudflare', 'akamai', 'fastly', 'leaseweb', 'choopa',
    'contabo', 'scaleway', 'rackspace', 'oracle cloud',
    'alibaba cloud', 'tencent cloud', 'kamatera', 'upcloud',
    'hostinger', 'bluehost', 'godaddy', 'namecheap',
    'datacenter', 'hosting', 'server', 'cloud', 'colocation',
    'dedicated', 'vps',
]

# Proxy/anonymizer indicators
PROXY_INDICATORS = [
    'proxy', 'tor ', 'tor-', 'relay', 'exit node', 'anonymi',
    'vpn', 'virtual private', 'tunnel',
]

# Private/reserved IP ranges
PRIVATE_RANGES = [
    ipaddress.ip_network('10.0.0.0/8'),
    ipaddress.ip_network('172.16.0.0/12'),
    ipaddress.ip_network('192.168.0.0/16'),
    ipaddress.ip_network('127.0.0.0/8'),
    ipaddress.ip_network('169.254.0.0/16'),
    ipaddress.ip_network('::1/128'),
    ipaddress.ip_network('fc00::/7'),
    ipaddress.ip_network('fe80::/10'),
]


def _check_patterns(text, patterns):
    """Check if any pattern matches in the given text."""
    if not text:
        return False
    text_lower = text.lower()
    return any(p in text_lower for p in patterns)


def _is_private_ip(ip_str):
    """Check if an IP address is in a private/reserved range."""
    try:
        ip = ipaddress.ip_address(ip_str)
        return any(ip in net for net in PRIVATE_RANGES)
    except ValueError:
        return False


def assess_risk(geo_data):
    """
    Assess the risk level of an IP address based on available geo data.
    
    Returns:
        dict: {
            'level': 'low' | 'medium' | 'high',
            'reasons': list[str]
        }
    """
    reasons = []
    score = 0  # 0-10 scale

    ip = geo_data.get('query', '') or geo_data.get('ip', '')
    isp = geo_data.get('isp', '')
    org = geo_data.get('org', '')
    as_name = geo_data.get('as', '')

    combined_text = f"{isp} {org} {as_name}"

    # Check for VPN providers
    if _check_patterns(combined_text, VPN_PROVIDERS):
        reasons.append('Known VPN provider detected')
        score += 5

    # Check for proxy/anonymizer indicators
    if _check_patterns(combined_text, PROXY_INDICATORS):
        reasons.append('Proxy/anonymizer indicators found')
        score += 4

    # Check for hosting/datacenter providers
    if _check_patterns(combined_text, HOSTING_PROVIDERS):
        reasons.append('Hosting/datacenter provider detected')
        score += 3

    # Check for private IPs
    if _is_private_ip(ip):
        reasons.append('Private/reserved IP address')
        score += 1

    # Check if ISP name looks like a consumer ISP (lower risk)
    consumer_indicators = ['telecom', 'broadband', 'cable', 'wireless', 'mobile', 'cellular', 'communications', 'telekom']
    if _check_patterns(combined_text, consumer_indicators) and score == 0:
        reasons.append('Consumer ISP detected')
        # This is actually low-risk, don't increase score

    # Determine risk level
    if score >= 5:
        level = 'high'
    elif score >= 3:
        level = 'medium'
    else:
        level = 'low'
        if not reasons:
            reasons.append('No risk indicators detected')

    return {
        'level': level,
        'reasons': reasons
    }
