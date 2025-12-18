import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { cn } from "../lib/utils";
import { UserCog, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Layout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation - Fixed Square Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm h-24 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            {/* Logo - Free shape, larger */}
            <img 
              src="https://customer-assets.emergentagent.com/job_6e125dd0-724d-42ad-90c4-2b3d56d9357e/artifacts/t3f91lft_corte-removebg-preview.png" 
              alt="Logo Sociedade Paraense de Oftalmologia" 
              className="h-16 w-auto object-contain md:h-20 transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col justify-center">
              <span className="font-serif font-bold text-lg md:text-xl text-[#637685] leading-none hidden md:block">
                Sociedade Paraense
              </span>
              <span className="font-serif font-bold text-lg md:text-xl text-[#637685] leading-none hidden md:block">
                 de Oftalmologia
              </span>
              <span className="font-serif font-bold text-lg text-[#637685] leading-tight md:hidden">
                S.P.O.
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" active={isActive("/")}>Início</NavLink>
            <NavLink to="/about" active={isActive("/about")}>Sobre a S.P.O.</NavLink>
            <NavLink to="/directory" active={isActive("/directory")}>Diretório</NavLink>
            <Link 
              to="/join"
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border",
                isActive("/join") 
                  ? "bg-primary text-white border-primary" 
                  : "bg-white text-primary border-primary hover:bg-primary/5"
              )}
            >
              Se Associe
            </Link>
            <Link 
              to="/admin" 
              className={cn(
                "ml-4 p-2.5 rounded-lg transition-colors border border-transparent",
                isActive("/admin") 
                  ? "bg-primary/10 text-primary border-primary/20" 
                  : "text-stone-500 hover:text-primary hover:bg-stone-50 hover:border-stone-200"
              )}
              title="Área Administrativa"
            >
              <UserCog className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-[#637685] hover:bg-stone-50 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
             {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
           <div className="absolute top-24 left-0 right-0 bg-white border-b border-stone-100 shadow-xl p-4 flex flex-col gap-2 md:hidden animate-in slide-in-from-top-2 duration-200">
             <Link 
               to="/" 
               className={cn("px-4 py-4 rounded-lg font-medium text-lg", isActive("/") ? "bg-primary/5 text-primary" : "text-stone-600")}
               onClick={() => setMobileMenuOpen(false)}
             >
               Início
             </Link>
             <Link 
               to="/about" 
               className={cn("px-4 py-4 rounded-lg font-medium text-lg", isActive("/about") ? "bg-primary/5 text-primary" : "text-stone-600")}
               onClick={() => setMobileMenuOpen(false)}
             >
               Sobre a S.P.O.
             </Link>
             <Link 
               to="/directory" 
               className={cn("px-4 py-4 rounded-lg font-medium text-lg", isActive("/directory") ? "bg-primary/5 text-primary" : "text-stone-600")}
               onClick={() => setMobileMenuOpen(false)}
             >
               Diretório
             </Link>
             <Link 
               to="/join" 
               className={cn("px-4 py-4 rounded-lg font-medium text-lg text-primary bg-primary/5", isActive("/join") ? "bg-primary/10" : "")}
               onClick={() => setMobileMenuOpen(false)}
             >
               Se Associe
             </Link>
             <Link 
               to="/admin" 
               className={cn("px-4 py-4 rounded-lg font-medium text-lg flex items-center gap-3", isActive("/admin") ? "bg-primary/5 text-primary" : "text-stone-600")}
               onClick={() => setMobileMenuOpen(false)}
             >
               <UserCog className="w-5 h-5" /> Acesso Admin
             </Link>
           </div>
        )}
      </nav>

      {/* Main Content - Adjusted padding for taller header */}
      <main className="flex-grow pt-32 pb-12 px-4 md:px-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-serif font-bold text-lg text-[#637685]">Sociedade Paraense de Oftalmologia</h3>
            <p className="text-stone-500 text-sm mt-2">Promovendo a saúde ocular no Pará.</p>
          </div>
          <div className="text-stone-400 text-sm flex flex-col md:items-end gap-2">
            <div>© {new Date().getFullYear()} S.P.O. Todos os direitos reservados.</div>
            <div className="text-xs flex flex-wrap justify-center md:justify-end gap-x-1.5 items-center">
              <span>Site feito por</span>
              <a href="https://github.com/marcosmakosu" target="_blank" rel="noreferrer" className="hover:text-primary font-medium transition-colors">Marcos Makosu</a>
              <span>(<a href="mailto:marcosmakosu@gmail.com" className="hover:text-primary transition-colors">Contato</a>)</span>
              <span>&</span>
              <a href="https://github.com/pablosilva" target="_blank" rel="noreferrer" className="hover:text-primary font-medium transition-colors">Pablo Silva</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={cn(
        "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        active 
          ? "text-[#637685] font-bold bg-stone-100" 
          : "text-stone-500 hover:text-[#637685] hover:bg-stone-50"
      )}
    >
      {children}
    </Link>
  );
}
