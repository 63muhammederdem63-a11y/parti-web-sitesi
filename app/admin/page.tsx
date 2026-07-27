"use client";

import React, { useState, useEffect } from "react";

interface Idea {
  id: string;
  author: string;
  title: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  // Sayfa yüklendiğinde mevcut fikirleri yerel hafızadan çek
  useEffect(() => {
    const savedIdeas = localStorage.getItem("iggp_ideas");
    if (savedIdeas) {
      try {
        setIdeas(JSON.parse(savedIdeas));
      } catch (e) {
        console.error("Fikirler yüklenirken hata oluştu:", e);
      }
    }
  }, []);

  // Değişiklikleri yerel hafızaya kaydet
  const saveIdeasToStorage = (updatedIdeas: Idea[]) => {
    setIdeas(updatedIdeas);
    localStorage.setItem("iggp_ideas", JSON.stringify(updatedIdeas));
  };

  // Admin Giriş Kontrolü (Şifre: iggpMT2634)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "iggpMT2634") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Hatalı şifre!");
    }
  };

  // Onay Durumunu Değiştir (Onayla / Yayından Kaldır)
  const toggleApprove = (id: string) => {
    const updated = ideas.map((idea) =>
      idea.id === id ? { ...idea, isApproved: !idea.isApproved } : idea
    );
    saveIdeasToStorage(updated);
  };

  // Fikri Sil
  const handleDelete = (id: string) => {
    if (confirm("Bu fikri silmek istediğinize emin misiniz?")) {
      const updated = ideas.filter((idea) => idea.id !== id);
      saveIdeasToStorage(updated);
    }
  };

  // Düzenlenen Fikri Kaydet
  const handleSaveEdit = () => {
    if (!editingIdea) return;
    const updated = ideas.map((idea) =>
      idea.id === editingIdea.id ? editingIdea : idea
    );
    saveIdeasToStorage(updated);
    setEditingIdea(null);
  };

  // GİRİŞ YAPILMAMIŞSA GÖSTERİLECEK EKRAN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030a08] text-white flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-zinc-900/90 border border-amber-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-center mb-2">
            <img src="/logo.png" alt="İGGP Logo" className="w-16 h-16 rounded-full border-2 border-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-center text-amber-400">
            İGGP Yönetici Paneli
          </h1>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm p-3 rounded text-center">
              {error}
            </div>
          )}
          <input
            type="password"
            placeholder="Yönetici Şifresi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-amber-400 text-sm"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold p-3 rounded-lg transition text-sm"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  // GİRİŞ YAPILMIŞSA ADMIN PANELİ EKRANI
  return (
    <div className="min-h-screen bg-[#030a08] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="İGGP" className="w-10 h-10 rounded-full border border-amber-400" />
            <h1 className="text-2xl font-bold text-amber-400">Katılım Kürsüsü Moderasyonu</h1>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 px-4 py-2 rounded-lg text-sm transition font-semibold"
          >
            Çıkış Yap
          </button>
        </div>

        <div className="space-y-4">
          {ideas.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800">
              Henüz gönderilmiş bir fikir veya öneri bulunmuyor.
            </div>
          ) : (
            ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-zinc-900/80 border border-amber-500/20 p-5 rounded-xl space-y-3 relative"
              >
                {editingIdea?.id === idea.id ? (
                  /* DÜZENLEME MODU */
                  <div className="space-y-3">
                    <label className="text-xs text-amber-400 font-semibold">Başlık Düzenle:</label>
                    <input
                      type="text"
                      value={editingIdea.title}
                      onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
                      className="w-full bg-zinc-800 border border-amber-400/50 p-2 rounded text-white font-bold text-sm"
                    />
                    <label className="text-xs text-amber-400 font-semibold">Gönderen İsmi Düzenle:</label>
                    <input
                      type="text"
                      value={editingIdea.author}
                      onChange={(e) => setEditingIdea({ ...editingIdea, author: e.target.value })}
                      className="w-full bg-zinc-800 border border-amber-400/50 p-2 rounded text-xs text-zinc-200"
                    />
                    <label className="text-xs text-amber-400 font-semibold">İçerik Düzenle:</label>
                    <textarea
                      value={editingIdea.content}
                      onChange={(e) => setEditingIdea({ ...editingIdea, content: e.target.value })}
                      className="w-full bg-zinc-800 border border-amber-400/50 p-2 rounded text-white text-sm"
                      rows={4}
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-xs font-semibold"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setEditingIdea(null)}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-1.5 rounded text-xs"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  /* NORMAL GÖRÜNTÜLEME MODU */
                  <>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-amber-300">{idea.title}</h3>
                        <p className="text-xs text-zinc-400">
                          Gönderen: <span className="text-zinc-200 font-medium">{idea.author}</span> • {idea.createdAt}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                          idea.isApproved
                            ? "bg-emerald-900/50 border-emerald-500 text-emerald-300"
                            : "bg-amber-900/50 border-amber-500 text-amber-300"
                        }`}
                      >
                        {idea.isApproved ? "Sitede Yayında" : "Onay Bekliyor"}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-3 rounded-lg border border-zinc-800">
                      {idea.content}
                    </p>

                    <div className="flex gap-2 pt-2 border-t border-zinc-800">
                      <button
                        onClick={() => toggleApprove(idea.id)}
                        className={`px-4 py-1.5 rounded text-xs font-bold transition ${
                          idea.isApproved
                            ? "bg-amber-600/80 hover:bg-amber-600 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {idea.isApproved ? "Yayından Kaldır" : "Onayla ve Yayınla"}
                      </button>
                      <button
                        onClick={() => setEditingIdea(idea)}
                        className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(idea.id)}
                        className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-1.5 rounded text-xs font-bold ml-auto"
                      >
                        Sil
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}