import { Shield, Eye, Users, CheckCircle, Target } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto space-y-20">
      {/* Header */}
      <div className="text-center space-y-6">
        <h1 className="font-serif text-4xl md:text-5xl text-primary-900 font-bold">
          Sobre a Sociedade
        </h1>
        <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
          Fundada com o compromisso de elevar os padrões da oftalmologia no Pará, a S.P.O. é a referência máxima em saúde ocular na região.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-serif text-3xl text-primary-900">Nossa História e Propósito</h2>
          <p className="text-stone-600 leading-relaxed">
            A Sociedade Paraense de Oftalmologia reúne os mais qualificados profissionais da área, atuando como um pilar de excelência médica e ética. Nosso objetivo é garantir que a população paraense tenha acesso a tratamentos modernos, seguros e humanizados.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Além de certificar especialistas, promovemos congressos, atualizações científicas e campanhas de prevenção, mantendo nossos associados na vanguarda da medicina ocular mundial.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <img 
             src="https://images.unsplash.com/photo-1583912267655-731b54a2a4b0?auto=format&fit=crop&q=80&w=600" 
             className="rounded-2xl shadow-lg w-full h-64 object-cover -translate-y-4" 
             alt="Equipamento oftalmológico moderno"
           />
           <img 
             src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600" 
             className="rounded-2xl shadow-lg w-full h-64 object-cover translate-y-4" 
             alt="Atendimento humanizado"
           />
        </div>
      </div>

      {/* Values */}
      <div className="bg-white rounded-3xl p-12 border border-stone-100 shadow-sm">
        <h2 className="font-serif text-3xl text-primary-900 text-center mb-12">Nossos Pilares</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <ValueCard 
            icon={<Shield className="w-8 h-8 text-primary" />}
            title="Ética Médica"
            description="Compromisso inegociável com a integridade e transparência na relação médico-paciente."
          />
          <ValueCard 
            icon={<Target className="w-8 h-8 text-primary" />}
            title="Excelência Científica"
            description="Incentivo constante à pesquisa e educação continuada de nossos membros."
          />
          <ValueCard 
            icon={<Users className="w-8 h-8 text-primary" />}
            title="Responsabilidade Social"
            description="Ações comunitárias para democratizar o acesso à saúde visual de qualidade."
          />
        </div>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, description }) {
  return (
    <div className="text-center space-y-4 p-4 hover:bg-stone-50 rounded-xl transition-colors">
      <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
        {icon}
      </div>
      <h3 className="font-serif text-xl font-bold text-primary-900">{title}</h3>
      <p className="text-stone-500">{description}</p>
    </div>
  );
}
