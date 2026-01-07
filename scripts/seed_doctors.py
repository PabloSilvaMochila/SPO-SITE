import asyncio
import sys
import os
import uuid
from datetime import datetime

# Ensure backend path is in sys.path
sys.path.append("/app/backend")

from server import DoctorModel, EventModel, AsyncSessionLocal, engine
from sqlalchemy import delete

doctors_data = [
    {
        "name": "Dr. Carlos Mendes",
        "city": "Belém",
        "specialty": "Cirurgia de Catarata",
        "contact_info": "(91) 3222-1234",
        "image_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800"
    },
    {
        "name": "Dra. Ana Paula Souza",
        "city": "Ananindeua",
        "specialty": "Oftalmopediatria",
        "contact_info": "(91) 3255-5678",
        "image_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800"
    },
    {
        "name": "Dr. Roberto Silva",
        "city": "Santarém",
        "specialty": "Retina e Vítreo",
        "contact_info": "(93) 3522-9090",
        "image_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800"
    },
    {
        "name": "Dra. Maria Fernanda",
        "city": "Belém",
        "specialty": "Glaucoma",
        "contact_info": "(91) 98888-7777",
        "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800"
    },
    {
        "name": "Dr. João Pedro Oliveira",
        "city": "Marabá",
        "specialty": "Córnea e Lentes de Contato",
        "contact_info": "(94) 3322-4455",
        "image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800"
    }
]

events_data = [
    {
        "title": "V Congresso Paraense de Oftalmologia",
        "date": "15-17 de Outubro, 2025",
        "time": "08:00 - 18:00",
        "location": "Hangar Centro de Convenções, Belém",
        "description": "O maior evento da oftalmologia no norte do país. Três dias de imersão científica, workshops práticos e networking com grandes nomes nacionais.",
        "image_url": "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=800",
        "status": "Inscrições Abertas"
    },
    {
        "title": "Curso Avançado de Retina e Vítreo",
        "date": "22 de Novembro, 2025",
        "time": "09:00 - 17:00",
        "location": "Auditório da S.P.O.",
        "description": "Curso teórico-prático focado nas novas tecnologias de diagnóstico e tratamento de doenças retinianas. Vagas limitadas.",
        "image_url": "https://images.unsplash.com/photo-1576091160550-2187d80a18f7?auto=format&fit=crop&q=80&w=800",
        "status": "Poucas Vagas"
    },
    {
        "title": "Mutirão de Prevenção ao Glaucoma",
        "date": "05 de Dezembro, 2025",
        "time": "08:00 - 14:00",
        "location": "Praça da República",
        "description": "Ação social aberta ao público para aferição de pressão intraocular e triagem de glaucoma. Participe como voluntário.",
        "image_url": "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800",
        "status": "Gratuito"
    }
]

async def seed():
    print("Starting seed...")
    
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(EventModel.metadata.create_all)
        await conn.run_sync(DoctorModel.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Clear existing
        print("Clearing existing data...")
        await session.execute(delete(DoctorModel))
        await session.execute(delete(EventModel))
        
        # Insert doctors
        print("Inserting doctors...")
        for doc in doctors_data:
            new_doc = DoctorModel(
                id=str(uuid.uuid4()),
                name=doc["name"],
                city=doc["city"],
                specialty=doc["specialty"],
                contact_info=doc["contact_info"],
                image_url=doc["image_url"],
                created_at=datetime.utcnow()
            )
            session.add(new_doc)

        # Insert events
        print("Inserting events...")
        for evt in events_data:
            new_evt = EventModel(
                id=str(uuid.uuid4()),
                title=evt["title"],
                date=evt["date"],
                time=evt["time"],
                location=evt["location"],
                description=evt["description"],
                image_url=evt["image_url"],
                status=evt["status"],
                created_at=datetime.utcnow()
            )
            session.add(new_evt)
        
        await session.commit()
    print("Seed complete!")

if __name__ == "__main__":
    asyncio.run(seed())
