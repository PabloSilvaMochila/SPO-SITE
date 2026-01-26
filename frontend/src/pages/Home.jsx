import { ArrowRight, Activity, Users, ShieldCheck, Eye, Instagram, Quote } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-primary-900 text-white py-12 px-6 md:px-16 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385180-1ea55f6196e0?crop=entropy&cs=srgb&fm=jpg&q=85')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-primary-800/80"></div>
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="font-serif text-3xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight md:leading-[1.1] text-white break-words">
            Excelência em <br className="hidden md:block"/>
            <span className="font-semibold text-white">Oftalmologia no Pará</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-100 mb-10 leading-relaxed max-w-2xl">
            A Sociedade Paraense de Oftalmologia conecta você aos especialistas mais qualificados da região, garantindo o mais alto padrão de cuidado com sua visão.
          </p>
          
          {/* CTA + Social Box */}
          <div className="flex flex-wrap items-center gap-6">
            <Link 
              to="/join" 
              className="bg-white text-primary-900 hover:bg-stone-100 rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
              data-testid="hero-cta-join"
            >
              Seja um Associado <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Social Media Highlight Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 pr-6 flex items-center gap-4 hover:bg-white/15 transition-colors group cursor-pointer">
               <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-2.5 rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                 <Instagram className="w-6 h-6 text-white" />
               </div>
               <a 
                 href="https://www.instagram.com/spo.ofc" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex flex-col"
               >
                 <span className="text-xs text-primary-200 font-medium uppercase tracking-wider">Siga-nos</span>
                 <span className="text-white font-bold text-lg">@spo.ofc</span>
               </a>
            </div>
          </div>
        </div>
      </section>

      {/* President's Message (Moved from About) */}
      <section className="bg-stone-50 rounded-3xl p-8 md:p-12 border border-stone-100">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="md:w-1/3 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full translate-x-2 translate-y-2"></div>
              <img 
                src="https://customer-assets.emergentagent.com/job_6e125dd0-724d-42ad-90c4-2b3d56d9357e/artifacts/ymnppwu0_image.png" 
                alt="Presidente da SPO" 
                className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover shadow-lg relative z-10 border-4 border-white"
              />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-primary-900">Dr. Presidente da SPO</h3>
              <span className="text-sm text-stone-500 font-medium uppercase tracking-wider">Gestão 2025-2026</span>
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Quote className="w-8 h-8 text-primary/20 rotate-180" />
              <h2 className="font-serif text-3xl text-primary-900">Palavra do Presidente</h2>
            </div>
            
            <div className="space-y-4 text-stone-600 leading-relaxed text-justify">
              <p>
                A Sociedade Paraense de Oftalmologia tem como missão promover a excelência no cuidado com a saúde ocular, fortalecendo a prática médica ética, científica e humanizada em nosso estado.
              </p>
              <p>
                Vivemos um momento de constante evolução da Oftalmologia, com avanços tecnológicos, científicos e educacionais que exigem atualização permanente e compromisso coletivo. Nesse cenário, a SPO reafirma seu papel como espaço de integração, aprendizado contínuo e valorização do oftalmologista, estimulando a troca de experiências, o aprimoramento profissional e a difusão do conhecimento de qualidade.
              </p>
              <p>
                Nossa atuação vai além da formação científica. Buscamos também contribuir ativamente com a sociedade, por meio de campanhas de prevenção, ações educativas e parcerias institucionais que ampliem o acesso à informação e ao cuidado visual, sempre com responsabilidade social e respeito às necessidades da população paraense.
              </p>
              <p>
                Acreditamos que o fortalecimento da Oftalmologia no Pará passa pela união da classe, pelo incentivo à pesquisa, pelo apoio às novas gerações de especialistas e pela construção de uma Sociedade cada vez mais participativa, moderna e comprometida com o futuro.
              </p>
              <p className="font-medium text-primary-900">
                Convido todos os colegas a participarem ativamente das iniciativas da SPO, compartilhando saberes, experiências e projetos. Juntos, seguimos trabalhando para elevar o padrão da Oftalmologia em nosso estado e contribuir para uma melhor qualidade de vida por meio da visão.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Stats Bento Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-stone-100 rounded-2xl p-8 shadow-sm flex flex-col justify-between min-h-[16rem] h-auto md:h-64 hover:shadow-md transition-all duration-300">
            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Eye className="text-primary w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-2xl text-primary-900 mb-2">Saúde Ocular</h3>
              <p className="text-stone-500">Compromisso com a prevenção e tratamento das doenças dos olhos.</p>
            </div>
          </div>
          
          <div className="bg-secondary border border-primary/10 rounded-2xl p-8 shadow-sm flex flex-col justify-between min-h-[16rem] h-auto md:h-64 hover:shadow-md transition-all duration-300 md:col-span-2">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 h-full">
                <div className="max-w-md">
                   <h3 className="font-serif text-3xl text-primary-900 mb-4">Nossa Missão</h3>
                   <p className="text-primary-800/80 text-lg">
                     Promover o aprimoramento científico e ético dos oftalmologistas paraenses, em benefício da sociedade.
                   </p>
                </div>
                <div className="bg-white/50 p-6 rounded-xl backdrop-blur-sm w-full md:w-auto">
                   <div className="text-4xl font-serif font-bold text-accent">100+</div>
                   <div className="text-sm font-medium text-primary-800 uppercase tracking-wider mt-1">Associados</div>
                </div>
             </div>
          </div>

          <div className="bg-primary text-white rounded-2xl p-8 shadow-sm flex flex-col justify-between min-h-[16rem] h-auto md:h-64 hover:shadow-md transition-all duration-300">
             <div>
               <Users className="w-8 h-8 opacity-80 mb-6" />
               <h3 className="font-serif text-2xl mb-2 text-white">Foco no Paciente</h3>
               <p className="text-primary-100/80">Humanização e tecnologia a serviço da visão.</p>
             </div>
          </div>

          <div className="bg-white border border-stone-100 rounded-2xl p-8 shadow-sm flex flex-col justify-between min-h-[16rem] h-auto md:h-64 hover:shadow-md transition-all duration-300 md:col-span-2">
             <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-accent w-8 h-8" />
                </div>
                <div>
                   <h3 className="font-serif text-2xl text-primary-900 mb-2">Credenciais Verificadas</h3>
                   <p className="text-stone-500">
                     Todos os médicos em nosso diretório passam por um rigoroso processo de verificação junto ao CRM e à Sociedade Brasileira de Oftalmologia.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
