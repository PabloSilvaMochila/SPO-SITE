import sqlite3
import uuid
import datetime

DB_PATH = "/app/backend/medassoc.db"

# Single real doctor
doctors_data = [
    {
        "name": "Robson Seiji T. Koyama",
        "city": "Belém",
        "specialty": "Presidente",
        "contact_info": "",
        "image_url": "https://customer-assets.emergentagent.com/job_spo-medical/artifacts/vp67eno7_WhatsApp%20Image%202026-01-22%20at%2009.35.13.jpeg"
    },
    {
        "name": "Filipe Moreira de Araújo",
        "city": "Belém",
        "specialty": "Conselheiro Fiscal Suplente",
        "contact_info": "", # Not provided, leaving blank or can use default contact
        "image_url": "https://customer-assets.emergentagent.com/job_spo-medical/artifacts/ywr9fmpn_WhatsApp%20Image%202025-12-23%20at%2013.23.32.jpeg"
    },
    {
        "name": "Thaís Sousa Mendes",
        "city": "Belém",
        "specialty": "Diretoria da SPO",
        "contact_info": "",
        "image_url": "https://customer-assets.emergentagent.com/job_spo-medical/artifacts/gsh1x86w_image.png"
    },
    {
        "name": "Alexandre Antônio Marques Rosa",
        "city": "Belém",
        "specialty": "Vice -presidente",
        "contact_info": "",
        "image_url": "https://customer-assets.emergentagent.com/job_spo-medical/artifacts/zqgc9gb2_WhatsApp%20Image%202025-12-23%20at%2013.23.32%20%281%29.jpeg"
    },
    {
        "name": "José Ricardo Mouta Araújo",
        "city": "Belém",
        "specialty": "Membro",
        "contact_info": "",
        "image_url": "https://customer-assets.emergentagent.com/job_spo-medical/artifacts/86mvenb5_WhatsApp%20Image%202025-12-23%20at%2013.23.32%20%282%29.jpeg"
    },
    {
        "name": "Thiago Sopper Boti",
        "city": "Belém",
        "specialty": "Diretor Financeiro",
        "contact_info": "",
        "image_url": "https://customer-assets.emergentagent.com/job_spo-medical/artifacts/46bj9e0p_WhatsApp%20Image%202025-12-23%20at%2013.23.32%20%283%29.jpeg"
    },
    {
        "name": "Augusto César Costa de Almeida",
        "city": "Belém",
        "specialty": "Conselho Fiscal",
        "contact_info": "",
        "image_url": "https://customer-assets.emergentagent.com/job_spo-medical/artifacts/g99n4wa1_WhatsApp%20Image%202025-12-23%20at%2013.24.00.jpeg"
    },
    {
        "name": "Márcia Silva Ferreira",
        "city": "Belém",
        "specialty": "Diretoria SPO",
        "contact_info": "",
        "image_url": "https://customer-assets.emergentagent.com/job_spo-medical/artifacts/zs19ws0p_WhatsApp%20Image%202025-12-23%20at%2013.47.04.jpeg"
    },
    {
        "name": "Etiene França",
        "city": "Belém",
        "specialty": "Diretora de Marketing SPO",
        "contact_info": "",
        "image_url": "https://customer-assets.emergentagent.com/job_spo-medical/artifacts/k09l61li_teste1.jpeg"
    }
]

# Keep events as they are examples/placeholders unless asked to remove, but user only said "doctors of example"
# Safest to keep events for layout structure, or remove if "simplifique" implies it. 
# User specific instructions were: "Tira todos os médicos de exemplo do diretório"
# So I will keep events.
events_data = [
    {
        "title": "V Congresso Paraense de Oftalmologia",
        "date": "15-17 de Outubro, 2025",
        "time": "08:00 - 18:00",
        "location": "Hangar Centro de Convenções, Belém",
        "description": "O maior evento da oftalmologia no norte do país. Três dias de imersão científica, workshops práticos e networking com grandes nomes nacionais.",
        "image_url": "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=800",
        "status": "Inscrições Abertas",
        "external_link": "https://example.com/congresso"
    },
    {
        "title": "Curso Avançado de Retina e Vítreo",
        "date": "22 de Novembro, 2025",
        "time": "09:00 - 17:00",
        "location": "Auditório da S.P.O.",
        "description": "Curso teórico-prático focado nas novas tecnologias de diagnóstico e tratamento de doenças retinianas. Vagas limitadas.",
        "image_url": "https://images.unsplash.com/photo-1576091160550-2187d80a18f7?auto=format&fit=crop&q=80&w=800",
        "status": "Poucas Vagas",
        "external_link": "https://example.com/curso-retina"
    },
    {
        "title": "Mutirão de Prevenção ao Glaucoma",
        "date": "05 de Dezembro, 2025",
        "time": "08:00 - 14:00",
        "location": "Praça da República",
        "description": "Ação social aberta ao público para aferição de pressão intraocular e triagem de glaucoma. Participe como voluntário.",
        "image_url": "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800",
        "status": "Gratuito",
        "external_link": ""
    }
]

def seed():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create Tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE,
            full_name TEXT,
            hashed_password TEXT,
            disabled BOOLEAN
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
            id TEXT PRIMARY KEY,
            name TEXT,
            city TEXT,
            specialty TEXT,
            contact_info TEXT,
            image_url TEXT,
            created_at TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            title TEXT,
            date TEXT,
            time TEXT,
            location TEXT,
            description TEXT,
            image_url TEXT,
            status TEXT,
            external_link TEXT,
            created_at TIMESTAMP
        )
    ''')

    # Admin User
    admin_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
    try:
        cursor.execute("INSERT OR IGNORE INTO users (id, username, full_name, hashed_password, disabled) VALUES (?, ?, ?, ?, ?)",
                       (str(uuid.uuid4()), "admin@medassoc.com", "Admin", admin_hash, False))
    except Exception as e:
        print(f"Error inserting admin: {e}")

    # Clear existing doctors
    cursor.execute("DELETE FROM doctors")
    print("Cleared existing doctors.")

    # Seed Doctors
    for doc in doctors_data:
        cursor.execute("INSERT INTO doctors (id, name, city, specialty, contact_info, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (str(uuid.uuid4()), doc["name"], doc["city"], doc["specialty"], doc["contact_info"], doc["image_url"], datetime.datetime.utcnow()))

    # Sync Events (Optional: Clear and re-seed or just leave)
    # I'll clear and re-seed to ensure clean state matching the script
    cursor.execute("DELETE FROM events")
    for evt in events_data:
        cursor.execute("INSERT INTO events (id, title, date, time, location, description, image_url, status, external_link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                       (str(uuid.uuid4()), evt["title"], evt["date"], evt["time"], evt["location"], evt["description"], evt["image_url"], evt["status"], evt["external_link"], datetime.datetime.utcnow()))

    conn.commit()
    conn.close()
    print("Sync seed complete.")

if __name__ == "__main__":
    seed()
