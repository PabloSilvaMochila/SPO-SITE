import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, LogOut, Upload, Link as LinkIcon, Image as ImageIcon, Calendar, User, MapPin, Clock, FileText, AlertCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Admin() {
  const [activeTab, setActiveTab] = useState("doctors"); // 'doctors' | 'events'
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  // Unified Form State
  const [formData, setFormData] = useState({});
  
  // Image Upload State
  const [imageMode, setImageMode] = useState("url"); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchItems();
  }, [token, navigate, activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "doctors" ? "/api/doctors" : "/api/events";
      const response = await axios.get(`${BACKEND_URL}${endpoint}`);
      setItems(response.data);
    } catch (error) {
      toast.error(`Falha ao buscar ${activeTab === "doctors" ? "médicos" : "eventos"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      let finalImageUrl = formData.image_url;

      // Handle Image Upload
      if (imageMode === "upload" && selectedFile) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        
        try {
          const uploadRes = await axios.post(`${BACKEND_URL}/api/upload`, uploadData, {
            headers: { ...headers, "Content-Type": "multipart/form-data" }
          });
          finalImageUrl = `${BACKEND_URL}${uploadRes.data.url}`;
        } catch (uploadError) {
          console.error("Upload failed", uploadError);
          toast.error("Falha no upload da imagem");
          setUploading(false);
          return;
        }
      }

      const payload = { ...formData, image_url: finalImageUrl };
      const endpoint = activeTab === "doctors" ? "/api/doctors" : "/api/events";
      
      if (editingItem) {
        await axios.put(`${BACKEND_URL}${endpoint}/${editingItem.id}`, payload, { headers });
        toast.success("Atualizado com sucesso");
      } else {
        await axios.post(`${BACKEND_URL}${endpoint}`, payload, { headers });
        toast.success("Adicionado com sucesso");
      }
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      setSelectedFile(null);
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("Operação falhou");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    try {
      const endpoint = activeTab === "doctors" ? "/api/doctors" : "/api/events";
      await axios.delete(`${BACKEND_URL}${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Removido com sucesso");
      fetchItems();
    } catch (error) {
      toast.error("Falha ao excluir");
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item }); // Pre-fill
    setImageMode(item.image_url && !item.image_url.includes("/uploads/") ? "url" : "upload");
    if (item.image_url && item.image_url.includes("/uploads/")) {
       setImageMode("url"); // Keep simple logic
    }
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingItem(null);
    // Reset form based on type
    if (activeTab === "doctors") {
      setFormData({ name: "", specialty: "", city: "", contact_info: "", image_url: "" });
    } else {
      setFormData({ title: "", date: "", time: "", location: "", description: "", status: "Inscrições Abertas", image_url: "", external_link: "" });
    }
    setImageMode("upload");
    setSelectedFile(null);
    setShowModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl text-primary-900">Painel Admin</h1>
          <p className="text-stone-500">Gerenciamento de conteúdo</p>
        </div>
        
        <div className="flex gap-4">
           {/* Tabs */}
           <div className="bg-stone-100 p-1 rounded-full flex">
             <button 
               onClick={() => setActiveTab("doctors")}
               className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "doctors" ? "bg-white text-primary shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
             >
               Médicos
             </button>
             <button 
               onClick={() => setActiveTab("events")}
               className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "events" ? "bg-white text-primary shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
             >
               Eventos
             </button>
           </div>

          <button 
            onClick={openAdd}
            className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
          <button 
            onClick={handleLogout}
            className="bg-stone-100 text-stone-600 px-4 py-2 rounded-full font-medium hover:bg-stone-200 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="px-6 py-4 font-serif font-semibold text-primary-900">
                   {activeTab === "doctors" ? "Médico" : "Evento"}
                </th>
                <th className="px-6 py-4 font-serif font-semibold text-primary-900">
                   {activeTab === "doctors" ? "Especialidade" : "Data / Hora"}
                </th>
                <th className="px-6 py-4 font-serif font-semibold text-primary-900">
                   {activeTab === "doctors" ? "Cidade" : "Local / Status"}
                </th>
                <th className="px-6 py-4 font-serif font-semibold text-primary-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-stone-900">
                       {activeTab === "doctors" ? item.name : item.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-600 text-sm">
                     {activeTab === "doctors" ? item.specialty : (
                       <div className="flex flex-col">
                         <span>{item.date}</span>
                         <span className="text-xs text-stone-400">{item.time}</span>
                       </div>
                     )}
                  </td>
                  <td className="px-6 py-4 text-stone-600 text-sm">
                     {activeTab === "doctors" ? item.city : (
                       <div className="flex flex-col gap-1">
                         <span className="truncate max-w-[150px]">{item.location}</span>
                         <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full w-fit">
                           {item.status}
                         </span>
                       </div>
                     )}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      onClick={() => openEdit(item)}
                      className="p-2 text-stone-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-stone-400 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-stone-400">
                    Nenhum item encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <h2 className="font-serif text-2xl font-bold text-primary-900 mb-6">
              {editingItem ? "Editar" : "Adicionar"} {activeTab === "doctors" ? "Médico" : "Evento"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Common Image Upload */}
              <div className="space-y-3 pt-2">
                <label className="block text-sm font-medium text-stone-700">Imagem de Capa/Perfil</label>
                <div className="flex bg-stone-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${imageMode === "upload" ? "bg-white text-primary shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                  >
                    <Upload className="w-4 h-4" /> Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${imageMode === "url" ? "bg-white text-primary shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                  >
                    <LinkIcon className="w-4 h-4" /> Link URL
                  </button>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  {imageMode === "upload" ? (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:bg-white transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 text-stone-500">
                           <Upload className="w-8 h-8 text-stone-400" />
                           <span className="text-sm font-medium">
                             {selectedFile ? selectedFile.name : "Clique para selecionar"}
                           </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg outline-none"
                        value={formData.image_url || ""}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Form Fields */}
              {activeTab === "doctors" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Nome Completo</label>
                    <input required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none" value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Especialidade</label>
                      <input required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none" value={formData.specialty || ""} onChange={(e) => setFormData({...formData, specialty: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Cidade</label>
                      <input required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none" value={formData.city || ""} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Contato</label>
                    <input required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none" value={formData.contact_info || ""} onChange={(e) => setFormData({...formData, contact_info: e.target.value})} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Título do Evento</label>
                    <input required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none" value={formData.title || ""} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Congresso..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Data</label>
                      <input required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none" value={formData.date || ""} onChange={(e) => setFormData({...formData, date: e.target.value})} placeholder="15 Out, 2025" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Horário</label>
                      <input required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none" value={formData.time || ""} onChange={(e) => setFormData({...formData, time: e.target.value})} placeholder="08:00 - 18:00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Localização</label>
                    <input required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none" value={formData.location || ""} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Auditório X" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Link "Saiba Mais"</label>
                    <input required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none" value={formData.external_link || ""} onChange={(e) => setFormData({...formData, external_link: e.target.value})} placeholder="https://..." />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                    <select 
                      className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none"
                      value={formData.status || "Inscrições Abertas"}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option>Inscrições Abertas</option>
                      <option>Poucas Vagas</option>
                      <option>Esgotado</option>
                      <option>Gratuito</option>
                      <option>Em Breve</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Descrição</label>
                    <textarea required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none min-h-[100px]" value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Detalhes do evento..." />
                  </div>
                </>
              )}
              
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-800 transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? "Enviando..." : (editingItem ? "Salvar" : "Adicionar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
