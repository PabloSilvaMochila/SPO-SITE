import { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, Stethoscope, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Directory() {
  const [doctors, setDoctors] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDoctors = async (city = "") => {
    setLoading(true);
    try {
      const params = {};
      if (city) params.city = city;
      
      const response = await axios.get(`${BACKEND_URL}/api/doctors`, { params });
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Erro ao carregar diretório");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(cityFilter);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl md:text-6xl text-primary-900 mb-6">Nossos Associados</h1>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto">
          Conheça os profissionais que fazem parte da Sociedade Paraense de Oftalmologia.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar por cidade (ex: Belém)"
            className="block w-full pl-12 pr-32 py-4 bg-white border border-stone-200 rounded-full text-lg shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-stone-400"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            data-testid="city-search-input"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-full font-medium hover:bg-primary-800 transition-colors"
            data-testid="search-button"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-stone-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100">
          <p className="text-stone-500 text-lg">Nenhum médico encontrado com estes critérios.</p>
          <button 
            onClick={() => {setCityFilter(""); fetchDoctors("");}}
            className="mt-4 text-primary font-medium hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}

function DoctorCard({ doctor }) {
  // Extract only numbers from contact info for WhatsApp link
  const cleanPhone = doctor.contact_info?.replace(/\D/g, "");
  const hasValidPhone = cleanPhone && cleanPhone.length >= 10; // Basic validation

  return (
    <div className="group bg-white border border-stone-100 rounded-3xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full" data-testid={`doctor-card-${doctor.id}`}>
      {/* Large Image Section */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-stone-100">
        {doctor.image_url ? (
          <img 
            src={doctor.image_url} 
            alt={doctor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-primary/30">
            <Stethoscope className="w-20 h-20" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary border border-white/20 shadow-sm">
          S.P.O. Membro
        </div>
      </div>
      
      <div className="px-2 pb-2 flex-grow flex flex-col">
        <h3 className="font-serif text-2xl font-bold text-primary-900 mb-2 group-hover:text-primary transition-colors">
          {doctor.name}
        </h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-accent font-medium text-base">
            <Stethoscope className="w-5 h-5 shrink-0" />
            {doctor.specialty}
          </div>
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <MapPin className="w-5 h-5 shrink-0" />
            {doctor.city}
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-stone-700 font-medium bg-stone-50 px-3 py-2 rounded-xl flex-grow">
            <Phone className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{doctor.contact_info}</span>
          </div>
          
          {hasValidPhone && (
            <a 
              href={`https://wa.me/55${cleanPhone}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-50 text-green-600 p-2.5 rounded-xl hover:bg-green-100 hover:text-green-700 transition-colors"
              title="Conversar no WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
