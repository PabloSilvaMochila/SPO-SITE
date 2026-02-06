import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/events`);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events", error);
        toast.error("Erro ao carregar eventos");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-6">
        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider">
          Agenda S.P.O.
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-primary-900 font-bold">
          Eventos e Congressos
        </h1>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Fique por dentro das principais atualizações científicas, cursos e ações sociais promovidas pela nossa sociedade.
        </p>
      </div>

      {/* Events List */}
      <div className="grid gap-8">
        {loading ? (
           [1, 2, 3].map((i) => (
             <div key={i} className="h-64 bg-stone-100 rounded-3xl animate-pulse"></div>
           ))
        ) : events.length === 0 ? (
           <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100">
             <p className="text-stone-500 text-lg">Nenhum evento agendado no momento.</p>
           </div>
        ) : (
          events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

function EventCard({ event }) {
  return (
    <div className="group bg-white border border-stone-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row">
      {/* Date Badge (Mobile) */}
      <div className="md:hidden bg-primary text-white p-4 flex items-center justify-between">
         <span className="font-bold flex items-center gap-2">
           <Calendar className="w-5 h-5" /> {event.date}
         </span>
         <span className="text-xs bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
           {event.status}
         </span>
      </div>

      {/* Image */}
      <div className="md:w-2/5 relative overflow-hidden h-48 md:h-auto bg-stone-200">
        <img 
          src={event.image_url} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => e.target.style.display = 'none'} 
        />
        <div className="absolute inset-0 bg-primary-900/10 group-hover:bg-transparent transition-colors"></div>
        
        {/* Date Badge (Desktop) */}
        <div className="absolute top-4 left-4 hidden md:flex flex-col gap-2 items-start">
           <span className="bg-white/95 backdrop-blur-sm text-primary-900 px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2">
             <Calendar className="w-4 h-4 text-accent" /> {event.date}
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col justify-center flex-grow space-y-4">
        <div className="flex items-center justify-between">
           <div className="hidden md:inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
             {event.status}
           </div>
           <span className="flex items-center gap-1.5 text-sm text-stone-500 font-medium">
             <Clock className="w-4 h-4" /> {event.time}
           </span>
        </div>

        <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-900 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        
        <p className="text-stone-600 leading-relaxed line-clamp-3">
          {event.description}
        </p>

        <div className="pt-4 flex items-center justify-between border-t border-stone-100 mt-auto">
          <div className="flex items-center gap-2 text-stone-500 text-sm font-medium">
            <MapPin className="w-4 h-4 text-accent" />
            {event.location}
          </div>
          
          {event.external_link ? (
            <a 
              href={event.external_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors group/btn"
            >
              Saiba Mais <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          ) : (
            <span className="text-stone-400 text-sm font-medium">Mais detalhes em breve</span>
          )}
        </div>
      </div>
    </div>
  );
}
