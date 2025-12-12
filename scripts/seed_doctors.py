import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid

# Configuration
MONGO_URL = os.environ.get('MONGO_URL', "mongodb://localhost:27017")
DB_NAME = os.environ.get('DB_NAME', "test_database")

doctors_data = [
    {
        "name": "Dr. Carlos Mendes",
        "city": "Belém",
        "specialty": "Cirurgia de Catarata",
        "contact_info": "(91) 3222-1234"
    },
    {
        "name": "Dra. Ana Paula Souza",
        "city": "Ananindeua",
        "specialty": "Oftalmopediatria",
        "contact_info": "(91) 3255-5678"
    },
    {
        "name": "Dr. Roberto Silva",
        "city": "Santarém",
        "specialty": "Retina e Vítreo",
        "contact_info": "(93) 3522-9090"
    },
    {
        "name": "Dra. Maria Fernanda",
        "city": "Belém",
        "specialty": "Glaucoma",
        "contact_info": "(91) 98888-7777"
    },
    {
        "name": "Dr. João Pedro Oliveira",
        "city": "Marabá",
        "specialty": "Córnea e Lentes de Contato",
        "contact_info": "(94) 3322-4455"
    }
]

async def seed():
    print(f"Connecting to {MONGO_URL}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing doctors
    print("Clearing existing doctors...")
    await db.doctors.delete_many({})
    
    # Insert new doctors
    print("Inserting new doctors...")
    for doc in doctors_data:
        doc_db = doc.copy()
        doc_db["id"] = str(uuid.uuid4())
        doc_db["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.doctors.insert_one(doc_db)
        print(f"Added: {doc['name']}")
        
    print("Seed complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
