import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      toast.success("Bem-vindo de volta");
      navigate("/admin");
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20">
      <div className="bg-white border border-stone-100 rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-primary-900">Acesso Admin</h1>
          <p className="text-stone-500 text-sm mt-2">Área segura para administradores da S.P.O.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@medassoc.com"
              data-testid="login-email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Senha</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              data-testid="login-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-800 transition-colors disabled:opacity-50"
            data-testid="login-submit"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-stone-400">
          <p>Protegido por criptografia de ponta a ponta</p>
        </div>
      </div>
    </div>
  );
}
