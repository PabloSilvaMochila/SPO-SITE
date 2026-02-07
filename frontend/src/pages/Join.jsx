import { Phone, CheckCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Join() {
  const [formData, setFormData] = useState({
    name: "",
    crm: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const text = `Olá, gostaria de solicitar filiação à SPO.%0A%0A*Nome:* ${formData.name}%0A*CRM:* ${formData.crm}%0A*Email:* ${formData.email}%0A*Telefone:* ${formData.phone}%0A*Mensagem:* ${formData.message}`;
    
    const whatsappUrl = `https://wa.me/559191222234?text=${text}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("Redirecionando para o WhatsApp...");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider">
          Para Médicos
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-primary-900 font-bold">
          Associe-se à S.P.O.
        </h1>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto">
          Faça parte de uma comunidade de excelência. Fortaleça sua carreira e a oftalmologia paraense.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-12">
        {/* Left Column - Benefits */}
        <div className="md:col-span-2 space-y-8">
          <h3 className="font-serif text-2xl text-primary-900">Vantagens de ser associado</h3>
          <ul className="space-y-4">
            <BenefitItem text="Presença no Diretório Oficial de Especialistas" />
            <BenefitItem text="Descontos exclusivos em congressos e eventos" />
            <BenefitItem text="Networking com líderes da área" />
          </ul>

          <div className="bg-stone-50 p-6 rounded-2xl space-y-4 border border-stone-100 mt-8">
            <h4 className="font-bold text-primary-900 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contato Direto
            </h4>
            <p className="text-sm text-stone-600">
              Dúvidas sobre a filiação? Fale com nossa secretaria executiva.
            </p>
            <div className="space-y-2 text-sm font-medium text-stone-800">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> +55 91 9122-2234
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="md:col-span-3">
          <div className="bg-white border border-stone-100 rounded-3xl p-8 shadow-lg">
            <h3 className="font-serif text-2xl text-primary-900 mb-6">Solicitar Filiação</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Nome Completo</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                    placeholder="Dr. Nome Sobrenome" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">CRM / UF</label>
                  <input 
                    type="text" 
                    name="crm"
                    value={formData.crm}
                    onChange={handleChange}
                    required 
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                    placeholder="0000 PA" 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">E-mail</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                    placeholder="medico@email.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Telefone / WhatsApp</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required 
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                    placeholder="(91) 90000-0000" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Mensagem (Opcional)</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[120px]" 
                  placeholder="Gostaria de saber mais sobre..." 
                />
              </div>

              <button type="submit" className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 duration-300">
                Enviar via WhatsApp <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ text }) {
  return (
    <li className="flex items-start gap-3 text-stone-700">
      <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
  );
}
