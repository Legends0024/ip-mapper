import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'geotrack.db')


def get_connection():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the database and create tables if they don't exist."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            country TEXT,
            country_code TEXT,
            city TEXT,
            region TEXT,
            isp TEXT,
            org TEXT,
            as_name TEXT,
            lat REAL,
            lon REAL,
            timezone TEXT,
            risk_level TEXT DEFAULT 'low',
            risk_reasons TEXT DEFAULT '[]',
            protocol_details TEXT DEFAULT '{}',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Migration: Check if protocol_details column exists, if not, add it
    cursor.execute("PRAGMA table_info(searches)")
    columns = [row[1] for row in cursor.fetchall()]
    if 'protocol_details' not in columns:
        cursor.execute("ALTER TABLE searches ADD COLUMN protocol_details TEXT DEFAULT '{}'")
        
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_searches_ip ON searches(ip)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_searches_timestamp ON searches(timestamp DESC)
    ''')
    conn.commit()
    conn.close()


def save_search(data):
    """Save an IP search result to the database."""
    conn = get_connection()
    cursor = conn.cursor()
    
    protocol_details = data.get('protocol_details', {})
    
    cursor.execute('''
        INSERT INTO searches (ip, country, country_code, city, region, isp, org, as_name, lat, lon, timezone, risk_level, risk_reasons, protocol_details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('ip', ''),
        data.get('country', ''),
        data.get('country_code', ''),
        data.get('city', ''),
        data.get('region', ''),
        data.get('isp', ''),
        data.get('org', ''),
        data.get('as_name', ''),
        data.get('lat', 0),
        data.get('lon', 0),
        data.get('timezone', ''),
        data.get('risk_level', 'low'),
        json.dumps(data.get('risk_reasons', [])),
        json.dumps(protocol_details)
    ))
    search_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return search_id


def get_history(limit=50, offset=0):
    """Get paginated search history."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM searches ORDER BY timestamp DESC LIMIT ? OFFSET ?
    ''', (limit, offset))
    rows = cursor.fetchall()
    total = cursor.execute('SELECT COUNT(*) FROM searches').fetchone()[0]
    conn.close()
    
    searches = []
    for row in rows:
        d = dict(row)
        d['risk_reasons'] = json.loads(d.get('risk_reasons', '[]'))
        d['protocol_details'] = json.loads(d.get('protocol_details', '{}'))
        searches.append(d)
        
    return {
        'searches': searches,
        'total': total,
        'limit': limit,
        'offset': offset
    }


def delete_search(search_id):
    """Delete a search record by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM searches WHERE id = ?', (search_id,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted > 0


def clear_history():
    """Clear all search history."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM searches')
    conn.commit()
    conn.close()


def get_analytics():
    """Get aggregated analytics data."""
    conn = get_connection()
    cursor = conn.cursor()

    # Total searches
    total_searches = cursor.execute('SELECT COUNT(*) FROM searches').fetchone()[0]

    # Unique IPs
    unique_ips = cursor.execute('SELECT COUNT(DISTINCT ip) FROM searches').fetchone()[0]

    # Unique countries
    unique_countries = cursor.execute('SELECT COUNT(DISTINCT country) FROM searches WHERE country IS NOT NULL AND country != ""').fetchone()[0]

    # High risk count
    high_risk = cursor.execute("SELECT COUNT(*) FROM searches WHERE risk_level = 'high'").fetchone()[0]

    # Top 5 countries
    top_countries = cursor.execute('''
        SELECT country, country_code, COUNT(*) as count 
        FROM searches 
        WHERE country IS NOT NULL AND country != ''
        GROUP BY country, country_code 
        ORDER BY count DESC 
        LIMIT 5
    ''').fetchall()

    # Risk distribution
    risk_dist = cursor.execute('''
        SELECT risk_level, COUNT(*) as count 
        FROM searches 
        GROUP BY risk_level
    ''').fetchall()

    # Recent 10 searches
    recent = cursor.execute('''
        SELECT id, ip, country, country_code, city, risk_level, timestamp 
        FROM searches 
        ORDER BY timestamp DESC 
        LIMIT 10
    ''').fetchall()

    conn.close()

    return {
        'total_searches': total_searches,
        'unique_ips': unique_ips,
        'unique_countries': unique_countries,
        'high_risk_count': high_risk,
        'top_countries': [dict(row) for row in top_countries],
        'risk_distribution': [dict(row) for row in risk_dist],
        'recent_activity': [dict(row) for row in recent]
    }
