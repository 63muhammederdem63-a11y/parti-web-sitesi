'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

interface Haber {
  id?: number
  baslik: string
  kategori: string
  icerik: string
  created_at?: string
}

interface Uye {
  id?: number
  ad_soyad?: string
  isim?: string
  email: string
  sehir?: string
  uzmanlik?: string
  mesaj?: string
  created_at?: string
}

interface Onerı {
  id?: number
  baslik?: string
  icerik?: string
  kullanici_adi?: string
  created_at?: string
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'haberler' | 'uyeler' | 'oneriler'>('haberler')
  
  // Form State'leri
  const [baslik, setBaslik] = useState('')
  const [kategori, setKategori] = useState('')
  const [icerik, setIcerik] = useState('')
  
  // Durum & Bildirim State'leri
  const [mesaj, setMesaj] = useState('')
  const [hata, setHata] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  // Veri Listeleri State'leri
  const [haberler, setHaberler] = useState<Haber[]>([])
  const [basvurular, setBasvurular] = useState<Uye[]>([])
  const [oneriler, setOneriler] = useState<Onerı[]>([])

  // Düzenleme Modu State'i
  const [duzenlenenHaberId, setDuzenlenenHaberId] = useState<number | null>(null)

  // Tüm Verileri Çek
  const verileriGetir = async () => {
    // Haberleri Getir
    const { data: haberData } = await supabase
      .from('haberler')
      .select('*')
      .order('created_at', { ascending: false })
    if (haberData) setHaberler(haberData)

    // Üyelik Başvurularını Getir
    const { data: uyeData } = await supabase
      .from('uyeler')
      .select('*')
      .order('created_at', { ascending: false })
    if (uyeData) setBasvurular(uyeData)

    // Önerileri/Fikirleri Getir
    const { data: oneriData } = await supabase
      .from('oneriler')
      .select('*')
      .order('created_at', { ascending: false })
    if (oneriData) setOneriler(oneriData)
  }

  useEffect(() => {
    verileriGetir()
  }, [])

  // Haber Ekleme veya Güncelleme İşlemi
  const handleHaberKaydet = async (e: React.FormEvent) => {
    e.preventDefault()
    setYukleniyor(true)
    setMesaj('')
    setHata('')

    if (duzenlenenHaberId) {
      // Güncelleme İşlemi
      const { error } = await supabase
        .from('haberler')
        .update({ baslik, kategori, icerik })
        .eq('id', duzenlenenHaberId)

      if (error) {
        setHata('Haber güncellenirken hata oluştu: ' + error.message)
      } else {
        setMesaj('Haber başarıyla güncellendi!')
        formuSifirla()
        verileriGetir()
      }
    } else {
      // Yeni Ekleme İşlemi
      const { error } = await supabase
        .from('haberler')
        .insert([{ baslik, kategori, icerik }])

      if (error) {
        setHata('Haber eklenirken hata oluştu: ' + error.message)
      } else {
        setMesaj('Yeni haber / duyuru başarıyla yayınlandı!')
        formuSifirla()
        verileriGetir()
      }
    }
    setYukleniyor(false)
  }

  // Haber Silme
  const handleHaberSil = async (id: number) => {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return

    const { error } = await supabase.from('haberler').delete().eq('id', id)
    if (error) {
      alert('Silme hatası: ' + error.message)
    } else {
      verileriGetir()
    }
  }

  // Haber Düzenleme Modunu Aç
  const handleHaberDuzenle = (haber: Haber) => {
    if (!haber.id) return
    setDuzenlenenHaberId(haber.id)
    setBaslik(haber.baslik)
    setKategori(haber.kategori)
    setIcerik(haber.icerik)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Form Sıfırlama
  const formuSifirla = () => {
    setBaslik('')
    setKategori('')
    setIcerik('')
    setDuzenlenenHaberId(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ÜST BAŞLIK VE KONTROL PANELİ */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/90 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-2xl gap-4">
          <div>
            <h1 className="text-2xl font-black text-emerald-400 tracking-wide flex items-center gap-2">
              🛡️ Yönetim Paneli
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sistem içeriklerini yönetin, başvuruları ve katılım kürsüsünü takip edin.
            </p>
          </div>
          <a
            href="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition duration-200"
          >
            ← Ana Sayfaya Dön
          </a>
        </header>

        {/* TAB MENÜSÜ */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('haberler')}
            className={`py-3 px-6 text-sm font-bold rounded-t-xl transition duration-200 border-t border-x ${
              activeTab === 'haberler'
                ? 'bg-slate-900 text-emerald-400 border-slate-800 border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            📣 Haberler & Duyurular ({haberler.length})
          </button>
          <button
            onClick={() => setActiveTab('uyeler')}
            className={`py-3 px-6 text-sm font-bold rounded-t-xl transition duration-200 border-t border-x ${
              activeTab === 'uyeler'
                ? 'bg-slate-900 text-emerald-400 border-slate-800 border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            📩 Üyelik Başvuruları ({basvurular.length})
          </button>
          <button
            onClick={() => setActiveTab('oneriler')}
            className={`py-3 px-6 text-sm font-bold rounded-t-xl transition duration-200 border-t border-x ${
              activeTab === 'oneriler'
                ? 'bg-slate-900 text-emerald-400 border-slate-800 border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            💡 Katılım / Fikirler ({oneriler.length})
          </button>
        </div>

        {/* IÇERIK ALANLARI */}
        {activeTab === 'haberler' && (
          <div className="space-y-8">
            {/* HABER EKLEME / DÜZENLEME FORMU */}
            <div className="bg-slate-900/80 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {duzenlenenHaberId ? '✏️ Haberi Düzenle' : '➕ Yeni Haber / Duyuru Yayınla'}
                </h2>
                {duzenlenenHaberId && (
                  <button
                    onClick={formuSifirla}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Vazgeç / Yeni Ekleme Moduna Geç
                  </button>
                )}
              </div>

              {mesaj && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl">
                  {mesaj}
                </div>
              )}

              {hata && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
                  {hata}
                </div>
              )}

              <form onSubmit={handleHaberKaydet} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Haber / Duyuru Başlığı</label>
                    <input
                      type="text"
                      placeholder="Başlığı giriniz..."
                      value={baslik}
                      onChange={(e) => setBaslik(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-xl text-sm text-white focus:outline-none transition"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Kategori</label>
                    <input
                      type="text"
                      placeholder="Örn: Duyuru, Vizyon, Basın"
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-xl text-sm text-white focus:outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">İçerik / Detaylar</label>
                  <textarea
                    placeholder="Haber veya duyuru metnini buraya yazın..."
                    value={icerik}
                    onChange={(e) => setIcerik(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-xl text-sm text-white focus:outline-none transition"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={yukleniyor}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-8 rounded-xl text-sm transition duration-200 disabled:opacity-50"
                  >
                    {yukleniyor
                      ? 'İşleniyor...'
                      : duzenlenenHaberId
                      ? 'Haberi Güncelle 🔄'
                      : 'Haberi Yayınla 🚀'}
                  </button>

                  {duzenlenenHaberId && (
                    <button
                      type="button"
                      onClick={formuSifirla}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl text-sm transition"
                    >
                      İptal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* YAYINLANMIŞ HABERLER LİSTESİ */}
            <div className="bg-slate-900/80 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-md font-bold text-slate-300 border-b border-slate-800 pb-3">
                📋 Mevcut Yayınlar ({haberler.length})
              </h3>

              {haberler.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Henüz eklenmiş bir haber veya duyuru yok.</p>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {haberler.map((h) => (
                    <div key={h.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {h.kategori}
                          </span>
                          <span className="text-xs text-slate-500">
                            {h.created_at ? new Date(h.created_at).toLocaleDateString('tr-TR') : ''}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-base">{h.baslik}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{h.icerik}</p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() => handleHaberDuzenle(h)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium rounded-lg border border-slate-700 transition"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => h.id && handleHaberSil(h.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg border border-red-500/30 transition"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ÜYELİK BAŞVURULARI TABI */}
        {activeTab === 'uyeler' && (
          <div className="bg-slate-900/80 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
              📩 Gelen Üyelik Başvuruları ({basvurular.length})
            </h3>

            {basvurular.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">Henüz üyelik başvurusu yapılmamış.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {basvurular.map((u) => (
                  <div key={u.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-emerald-400 text-base">{u.ad_soyad || u.isim || 'İsim Belirtilmemiş'}</h4>
                      <span className="text-[10px] text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono">{u.email}</p>
                    {u.sehir && <p className="text-xs text-slate-400"><strong>Şehir:</strong> {u.sehir}</p>}
                    {u.uzmanlik && <p className="text-xs text-slate-400"><strong>Uzmanlık / Alan:</strong> {u.uzmanlik}</p>}
                    {u.mesaj && <p className="text-xs text-slate-400 border-t border-slate-800 pt-2 mt-2 italic">"{u.mesaj}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KATILIM KÜRSÜSÜ / FİKİRLER TABI */}
        {activeTab === 'oneriler' && (
          <div className="bg-slate-900/80 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
              💡 Katılım Kürsüsü Gelen Fikirler ({oneriler.length})
            </h3>

            {oneriler.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">Henüz paylaşılan fikir veya öneri yok.</p>
            ) : (
              <div className="space-y-4">
                {oneriler.map((o) => (
                  <div key={o.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-base">{o.baslik || 'Başlıksız Öneri'}</h4>
                      <span className="text-[10px] text-slate-500">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString('tr-TR') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{o.icerik}</p>
                    {o.kullanici_adi && (
                      <p className="text-[11px] text-emerald-400/80 text-right font-medium">
                        — {o.kullanici_adi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}