import { Calendar, MapPin, Clock, ArrowRight, ExternalLink } from "lucide-react";

export default function Events() {
  const events = [
    {
      id: 1,
      title: "V Congresso Paraense de Oftalmologia",
      date: "15-17 de Outubro, 2025",
      time: "08:00 - 18:00",
      location: "Hangar Centro de Convenções, Belém",
      description: "O maior evento da oftalmologia no norte do país. Três dias de imersão científica, workshops práticos e networking com grandes nomes nacionais.",
      image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=800",
      status: "Inscrições Abertas"
    },
    {
      id: 2,
      title: "Curso Avançado de Retina e Vítreo",
      date: "22 de Novembro, 2025",
      time: "09:00 - 17:00",
      location: "Auditório da S.P.O.",
      description: "Curso teórico-prático focado nas novas tecnologias de diagnóstico e tratamento de doenças retinianas. Vagas limitadas.",
      image: "https://images.unsplash.com/photo-1576091160550-2187d80a18f7?auto=format&fit=crop&q=80&w=800",
      status: "Poucas Vagas"
    },
    {
      id: 3,
      title: "Mutirão de Prevenção ao Glaucoma",
      date: "05 de Dezembro, 2025",
      time: "08:00 - 14:00",
      location: "Praça da República",
      description: "Ação social aberta ao público para aferição de pressão intraocular e triagem de glaucoma. Participe como voluntário.",
      image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800",
      status: "Gratuito"
    }
  ];

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
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Newsletter / Stay Updated */}
      <div className="bg-primary-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
           <h2 className="font-serif text-3xl font-bold text-white">Não perca nenhuma novidade</h2>
           <p className="text-primary-100 text-lg">
             Inscreva-se em nossa newsletter para receber avisos sobre novos cursos e abertura de inscrições para congressos.
           </p>
           <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
             <input 
               type="email" 
               placeholder="Seu melhor e-mail" 
               className="flex-grow px-6 py-4 rounded-full text-stone-900 focus:outline-none focus:ring-2 focus:ring-accent"
             />
             <button className="bg-accent text-white px-8 py-4 rounded-full font-bold hover:bg-accent/90 transition-colors">
               Inscrever
             </button>
           </div>
        </div>
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
      <div className="md:w-2/5 relative overflow-hidden h-48 md:h-auto">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
        
        <p className="text-stone-600 leading-relaxed">
          {event.description}
        </p>

        <div className="pt-4 flex items-center justify-between border-t border-stone-100 mt-auto">
          <div className="flex items-center gap-2 text-stone-500 text-sm font-medium">
            <MapPin className="w-4 h-4 text-accent" />
            {event.location}
          </div>
          
          <button className="flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors group/btn">
            Saiba Mais <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
