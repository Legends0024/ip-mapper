import requests
import ipaddress

def get_rir(ip):
    # Simplified RIR mapping based on common ranges
    try:
        first_octet = int(ip.split('.')[0])
        if first_octet >= 1 and first_octet <= 126:
            return "ARIN / RIPE"
        return "APNIC/AFRINIC/LACNIC"
    except:
        return "Unknown"

def detect_risk(data):
    reasons = []
    level = "low"
    
    if data.get('proxy'):
        reasons.append("Proxy Detected")
        level = "medium"
    if data.get('hosting'):
        reasons.append("Data Center/Hosting")
        level = "medium"
    if data.get('mobile'):
        reasons.append("Mobile Network")
        
    if len(reasons) > 1:
        level = "high"
        
    return level, reasons

def get_location(query_ip):
    try:
        # Using ip-api.com (Free tier)
        # Fields: status, country, countryCode, regionName, city, lat, lon, timezone, isp, org, as, reverse, mobile, proxy, hosting
        url = f"http://ip-api.com/json/{query_ip}?fields=status,message,country,countryCode,regionName,city,lat,lon,timezone,isp,org,as,reverse,mobile,proxy,hosting"
        response = requests.get(url, timeout=5)
        data = response.json()

        if data.get('status') == 'success':
            # Add subnetting logic for CNIP
            ip_obj = ipaddress.ip_address(query_ip)
            version = ip_obj.version
            ip_class = "Unknown"
            subnet_mask = "N/A"
            host_range = "N/A"
            
            if version == 4:
                first_octet = int(query_ip.split('.')[0])
                if 1 <= first_octet <= 126:
                    ip_class = "Class A"
                    subnet_mask = "255.0.0.0 (/8)"
                    host_range = "16,777,214 Hosts"
                elif 128 <= first_octet <= 191:
                    ip_class = "Class B"
                    subnet_mask = "255.255.0.0 (/16)"
                    host_range = "65,534 Hosts"
                elif 192 <= first_octet <= 223:
                    ip_class = "Class C"
                    subnet_mask = "255.255.255.0 (/24)"
                    host_range = "254 Hosts"
                elif 224 <= first_octet <= 239:
                    ip_class = "Class D (Multicast)"
                elif 240 <= first_octet <= 255:
                    ip_class = "Class E (Experimental)"
            else:
                ip_class = "IPv6 (Classless)"
                subnet_mask = "64-bit Network Prefix"

            # Risk Heuristics
            risk_level, risk_reasons = detect_risk(data)

            # Extended fields for Dashboard UI
            as_info = data.get('as', 'N/A')
            as_name = as_info.split(' ', 1)[1] if ' ' in as_info else as_info

            return {
                "status": "success",
                "ip": query_ip,
                "country": data.get('country', 'Unknown'),
                "country_code": data.get('countryCode', ''),
                "region": data.get('regionName', 'Unknown'),
                "city": data.get('city', 'Unknown'),
                "lat": data.get('lat', 0),
                "lon": data.get('lon', 0),
                "timezone": data.get('timezone', 'UTC'),
                "isp": data.get('isp', 'Unknown'),
                "org": data.get('org', 'Unknown'),
                "as_name": as_name,
                "risk_level": risk_level,
                "risk_reasons": risk_reasons,
                "protocol_details": {
                    "version": f"IPv{version}",
                    "ip_class": ip_class,
                    "subnet_mask": subnet_mask,
                    "host_range": host_range,
                    "binary": bin(int(ip_obj))[2:].zfill(32 if version == 4 else 128),
                    "hex": hex(int(ip_obj)),
                    "rir": get_rir(query_ip),
                    "reverse_dns": data.get('reverse', 'No PTR record'),
                    "is_mobile": data.get('mobile', False),
                    "is_proxy": data.get('proxy', False),
                    "is_hosting": data.get('hosting', False)
                }
            }
        else:
            return {"status": "fail", "message": data.get('message', 'Invalid IP')}
    except Exception as e:
        return {"status": "fail", "message": str(e)}