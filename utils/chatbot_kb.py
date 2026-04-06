"""
Knowledge Base and Matcher for the "NetGuide" CNIP Chatbot.
Provides educational context for computer networking concepts.
"""

KNOWLEDGE_BASE = {
    "welcome": "Hello! I am **NetGuide**, your interactive CNIP Tutor. I can explain networking concepts like IP Classes, BGP, OSI Layers, or help you use this tracker. What would you like to learn today?",
    
    "ip_address": "An **IP Address (Internet Protocol Address)** is a unique numerical label assigned to each device connected to a computer network. In this project, we show you the source location and protocol details of these addresses.",
    
    "ip_version": "There are two versions of IP:\n- **IPv4:** 32-bit addresses (e.g. 8.8.8.8). There is a limited supply of 4.3 billion.\n- **IPv6:** 128-bit addresses (e.g. 2001:4860:4860::8888). It has a nearly infinite supply of addresses for the future!",
    
    "subnet": "A **Subnet Mask** (e.g. 255.255.255.0) tells a computer which part of the IP address is the **Network** and which part is the **Host**.\n- For Class A: First octet is Network (255.0.0.0)\n- For Class B: First two octets are Network (255.255.0.0)\n- For Class C: First three octets are Network (255.255.255.0)",
    
    "ip_classes": "IPv4 addresses are academically divided into 5 classes:\n- **Class A:** 1-126 (Huge networks)\n- **Class B:** 128-191 (Medium networks)\n- **Class C:** 192-223 (Small networks/Home)\n- **Class D:** 224-239 (Multicast)\n- **Class E:** 240-255 (Experimental)\n*Check the 'Protocol Analysis' section in your search results to see the class of your tracked IP!*",
    
    "as_number": "An **Autonomous System (AS)** is a collection of connected IP routing prefixes under the control of one or more network operators. For example, Google is AS15169. It is the building block of global internet routing via **BGP**.",
    
    "bgp": "**BGP (Border Gateway Protocol)** is the postal service of the Internet. It is the protocol used to exchange routing information between Autonomous Systems (AS). Without BGP, the internet wouldn't know how to send data from one country to another.",
    
    "osi_model": "The **OSI Model** has 7 layers. Your IP tracking happens at **Layer 3 (Network Layer)**, while the data we show you on this dashboard is fetched using **Layer 7 (Application Layer)** protocols like HTTP.",
    
    "rir": "**RIRs (Regional Internet Registries)** are global organizations that manage the allocation and registration of IP addresses. There are five: **ARIN** (North America), **RIPE** (Europe), **APNIC** (Asia Pacific), **LACNIC** (Latin America), and **AFRINIC** (Africa).",
    
    "reverse_dns": "**Reverse DNS (PTR Lookup)** is the process of finding the domain name associated with an IP address. It is the opposite of forward DNS (which finds IP from a name).",
    
    "binary": "Computers don't see IP addresses like '8.8.8.8'. They see them as 32-bit strings of 1s and 0s. For example, `00001000.00001000.00001000.00001000` is the binary version of 8.8.8.8.",
    
    "email_ip": "To find a sender's IP:\n1. Open the email and select **'Show original'** or **'View source'**.\n2. Look for the **'Received: from'** header.\n3. The IP inside the brackets `[]` is usually the sender's server IP.\n*Copy that IP and paste it into our search bar to see if it's a scam!*",
    
    "mismatch": "Sometimes an IP shows a different country than the person you're talking to. This happens because:\n1. **Server Location:** The website or email service might be hosted in the USA even if the company is in India.\n2. **VPN/Proxy:** The user might be hiding their real location.\n3. **CDNs:** Services like Cloudflare use servers all over the world to speed up traffic.",
    
    "privacy": "Most modern services (Gmail, Outlook) hide the sender's real home IP to protect their privacy. This is called **IP Stripping**. They replace the home IP with their own server IP (like a SparkPost or AWS server) so you don't get hacked!",
    
    "risk": "The **Risk Assessment** in this project uses heuristic pattern matching to find if an IP is a **proxy, VPN, or hosting server**. High-risk IPs are often used by bots or hackers to hide their true identity.",
    
    "thanks": "You're welcome! Feel free to ask more questions about Computer Networks any time. Happy learning!",
    
    "fallback": "I'm not sure about that specific term yet, but I'm currently trained on: **IP Classes, BGP, AS Numbers, RIRs, Reverse DNS, and the OSI Model**. Try asking about one of those!"
}

KEYWORD_MAP = {
    "hi": "welcome", "hello": "welcome", "hey": "welcome", "help": "welcome",
    "ip": "ip_address", "address": "ip_address", "what is ip": "ip_address",
    "version": "ip_version", "ipv4": "ip_version", "ipv6": "ip_version", "v4": "ip_version", "v6": "ip_version",
    "subnet": "subnet", "mask": "subnet", "host": "subnet", "network": "subnet",
    "class": "ip_classes", "classes": "ip_classes", "a b c": "ip_classes",
    "as": "as_number", "autonomous": "as_number", "asn": "as_number",
    "bgp": "bgp", "routing": "bgp", "border": "bgp",
    "osi": "osi_model", "layer": "osi_model", "layers": "osi_model",
    "rir": "rir", "registry": "rir", "assignment": "rir", "apnic": "rir", "arin": "rir",
    "ptr": "reverse_dns", "reverse": "reverse_dns", "dns": "reverse_dns", "hostname": "reverse_dns",
    "binary": "binary", "bits": "binary", "hex": "binary", "format": "binary",
    "email": "email_ip", "header": "email_ip", "scam": "email_ip", "mail": "email_ip",
    "mismatch": "mismatch", "wrong": "mismatch", "location": "mismatch", "usa": "mismatch", "different": "mismatch",
    "privacy": "privacy", "hidden": "privacy", "strip": "privacy", "hide": "privacy", "real": "privacy", "tracking": "privacy",
    "risk": "risk", "security": "risk", "vpn": "risk", "proxy": "risk",
    "thanks": "thanks", "thank": "thanks", "bye": "thanks"
}

def get_bot_response(query):
    query = query.lower().strip()
    
    # Check for direct keyword matches
    for keyword, response_key in KEYWORD_MAP.items():
        if keyword in query:
            return KNOWLEDGE_BASE[response_key]
            
    return KNOWLEDGE_BASE["fallback"]
