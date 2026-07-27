'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'

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
  created_at?: string
}

interface Oneri {
  id?: number
  baslik?: string
  icerik?: string
  kullanici_adi?: string
  created_at?: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'anasayfa' | 'tuzuk' | 'katilim' | 'katil' | 'admin'>('anasayfa')
  const [adminTab, setAdminTab] = useState<'haberler' | 'uyeler' | 'oneriler'>('haberler')

  // Veri State'leri
  const [haberler, setHaberler] = useState<Haber[]>([])
  const [basvurular, setBasvurular] = useState<Uye[]>([])
  const [oneriler, setOneriler] = useState<Oneri[]>([])

  // Haber Form State'leri
  const [baslik, setBaslik] = useState('')
  const [kategori, setKategori] = useState('')
  const [icerik, setIcerik] = useState('')
  const [duzenlenenHaberId, setDuzenlenenHaberId] = useState<number | null>(null)
  const [mesaj, setMesaj] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  // Katılım & Üyelik Form State'leri
  const [katilForm, setKatilForm] = useState({ ad_soyad: '', email: '', sehir: '', uzmanlik: '' })
  const [oneriForm, setOneriForm] = useState({ baslik: '', icerik: '', kullanici_adi: '' })
  const [formMesaj, setFormMesaj] = useState('')

  // Verileri Çek
  const verileriGetir = async () => {
    const { data: hData } = await supabase.from('haberler').select('*').order('created_at', { ascending: false })
    if (hData) setHaberler(hData)

    const { data: uData } = await supabase.from('uyeler').select('*').order('created_at', { ascending: false })
    if (uData) setBasvurular(uData)

    const { data: oData } = await supabase.from('oneriler').select('*').order('created_at', { ascending: false })
    if (oData) setOneriler(oData)
  }

  useEffect(() => {
    verileriGetir()
  }, [])

  // Haber Kaydet / Güncelle
  const handleHaberKaydet = async (e: React.FormEvent) => {
    e.preventDefault()
    setYukleniyor(true)
    setMesaj('')

    if (duzenlenenHaberId) {
      const { error } = await supabase
        .from('haberler')
        .update({ baslik, kategori, icerik })
        .eq('id', duzenlenenHaberId)
      if (error) setMesaj('Hata: ' + error.message)
      else {
        setMesaj('Haber başarıyla güncellendi!')
        formuSifirla()
        verileriGetir()
      }
    } else {
      const { error } = await supabase.from('haberler').insert([{ baslik, kategori, icerik }])
      if (error) setMesaj('Hata: ' + error.message)
      else {
        setMesaj('Haber başarıyla yayınlandı!')
        formuSifirla()
        verileriGetir()
      }
    }
    setYukleniyor(false)
  }

  const handleHaberSil = async (id: number) => {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return
    await supabase.from('haberler').delete().eq('id', id)
    verileriGetir()
  }

  const handleHaberDuzenle = (h: Haber) => {
    if (!h.id) return
    setDuzenlenenHaberId(h.id)
    setBaslik(h.baslik)
    setKategori(h.kategori)
    setIcerik(h.icerik)
  }

  const formuSifirla = () => {
    setBaslik('')
    setKategori('')
    setIcerik('')
    setDuzenlenenHaberId(null)
  }

  // Katıl / Başvuru Yap
  const handleUyeOl = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMesaj('Gönderiliyor...')
    const { error } = await supabase.from('uyeler').insert([katilForm])
    if (error) setFormMesaj('Hata oluştu: ' + error.message)
    else {
      setFormMesaj('Başvurunuz başarıyla alındı!')
      setKatilForm({ ad_soyad: '', email: '', sehir: '', uzmanlik: '' })
      verileriGetir()
    }
  }

  // Öneri Gönder
  const handleOneriGonder = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMesaj('Gönderiliyor...')
    const { error } = await supabase.from('oneriler').insert([oneriForm])
    if (error) setFormMesaj('Hata oluştu: ' + error.message)
    else {
      setFormMesaj('Fikriniz katılım kürsüsüne iletildi!')
      setOneriForm({ baslik: '', icerik: '', kullanici_adi: '' })
      verileriGetir()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      {/* ÜST MENÜ (HEADER) */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('anasayfa')}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
              İG
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white">İGGP</h1>
              <p className="text-[10px] text-emerald-400 font-medium tracking-wider">İslami Gelişme ve Girişim Partisi</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-3 text-xs md:text-sm font-semibold flex-wrap justify-center">
            <button
              onClick={() => setActiveTab('anasayfa')}
              className={`px-3 py-2 rounded-lg transition ${activeTab === 'anasayfa' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              Anasayfa & Vizyon
            </button>
            <button
              onClick={() => setActiveTab('katilim')}
              className={`px-3 py-2 rounded-lg transition ${activeTab === 'katilim' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              Katılım Kürsüsü ({oneriler.length})
            </button>
            <button
              onClick={() => setActiveTab('tuzuk')}
              className={`px-3 py-2 rounded-lg transition ${activeTab === 'tuzuk' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              Parti Tüzüğü
            </button>
            <button
              onClick={() => setActiveTab('katil')}
              className={`px-4 py-2 rounded-xl transition bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/10`}
            >
              Aramıza Katıl 🤝
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-xl border transition ${
                activeTab === 'admin'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              🔒 Admin
            </button>
          </nav>
        </div>
      </header>

      {/* İÇERİK ALANI */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        {/* 1. ANASAYFA */}
        {activeTab === 'anasayfa' && (
          <div className="space-y-12">
            <section className="text-center py-12 space-y-4">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Ahlak, Adalet ve Teknolojik Kalkınma
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
                İGGP; milli değerlerimiz, yüksek teknoloji vizyonumuz ve genç girişimci gücümüzle Türkiye'yi yarınlara hazırlamak için kurulan dijital odaklı siyasettir.
              </p>
            </section>

            {/* HABERLER LİSTESİ */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-emerald-400 border-b border-slate-800 pb-3">
                📣 Parti Duyuruları & Haberler
              </h2>
              {haberler.length === 0 ? (
                <div className="bg-slate-900/50 p-8 text-center rounded-2xl border border-slate-800 text-slate-500">
                  Henüz bir duyuru veya haber yayınlanmadı.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {haberler.map((h) => (
                    <div key={h.id} className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {h.kategori}
                        </span>
                        <span className="text-xs text-slate-500">
                          {h.created_at ? new Date(h.created_at).toLocaleDateString('tr-TR') : ''}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{h.baslik}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{h.icerik}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* 2. KATILIM KÜRSÜSÜ */}
        {activeTab === 'katilim' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-xl font-bold text-emerald-400">💡 Fikrini ve Önerini Paylaş</h2>
              {formMesaj && <p className="text-xs font-semibold text-emerald-300">{formMesaj}</p>}
              <form onSubmit={handleOneriGonder} className="space-y-3">
                <input
                  type="text"
                  placeholder="Başlık veya Konu"
                  value={oneriForm.baslik}
                  onChange={(e) => setOneriForm({ ...oneriForm, baslik: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white"
                  required
                />
                <textarea
                  placeholder="Fikrinizi veya projenizi detaylandırın..."
                  value={oneriForm.icerik}
                  onChange={(e) => setOneriForm({ ...oneriForm, icerik: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Adınız / Rumuzunuz (Opsiyonel)"
                  value={oneriForm.kullanici_adi}
                  onChange={(e) => setOneriForm({ ...oneriForm, kullanici_adi: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white"
                />
                <button type="submit" className="bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-emerald-600 transition">
                  Fikri Gönder 🚀
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Paylaşılan Fikirler</h3>
              {oneriler.map((o) => (
                <div key={o.id} className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl space-y-1">
                  <h4 className="font-bold text-white text-sm">{o.baslik}</h4>
                  <p className="text-xs text-slate-300">{o.icerik}</p>
                  {o.kullanici_adi && <p className="text-[10px] text-emerald-400 font-medium">— {o.kullanici_adi}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. ARAMIZA KATIL */}
        {activeTab === 'katil' && (
          <div className="max-w-md mx-auto bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 text-center">🤝 Üyelik / Gönüllü Başvurusu</h2>
            {formMesaj && <p className="text-xs font-semibold text-center text-emerald-300">{formMesaj}</p>}
            <form onSubmit={handleUyeOl} className="space-y-3">
              <input
                type="text"
                placeholder="Ad Soyad"
                value={katilForm.ad_soyad}
                onChange={(e) => setKatilForm({ ...katilForm, ad_soyad: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white"
                required
              />
              <input
                type="email"
                placeholder="E-Posta Adresi"
                value={katilForm.email}
                onChange={(e) => setKatilForm({ ...katilForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white"
                required
              />
              <input
                type="text"
                placeholder="Şehir"
                value={katilForm.sehir}
                onChange={(e) => setKatilForm({ ...katilForm, sehir: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white"
              />
              <input
                type="text"
                placeholder="Uzmanlık Alanı / Meslek"
                value={katilForm.uzmanlik}
                onChange={(e) => setKatilForm({ ...katilForm, uzmanlik: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white"
              />
              <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl text-sm hover:bg-emerald-600 transition">
                Başvuruyu Tamamla 🚀
              </button>
            </form>
          </div>
        )}

        {/* 4. TÜZÜK */}
        {activeTab === 'tuzuk' && (
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-emerald-400">📜 Parti Tüzüğü ve İlkelere</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              İGGP, ahlakı temel alan, adaleti merkezine koyan ve bilim ile teknolojiyi geleceğin anahtarı gören bir siyasi harekettir.
            </p>
          </div>
        )}

        {/* 5. ADMIN PANELİ (EKSİKSİZ HALE GETİRİLDİ) */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="flex border-b border-slate-800 gap-2">
              <button
                onClick={() => setAdminTab('haberler')}
                className={`py-2 px-4 text-xs font-bold rounded-t-xl transition ${adminTab === 'haberler' ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-800' : 'text-slate-400'}`}
              >
                📣 Haber & Duyuru Yönetimi ({haberler.length})
              </button>
              <button
                onClick={() => setAdminTab('uyeler')}
                className={`py-2 px-4 text-xs font-bold rounded-t-xl transition ${adminTab === 'uyeler' ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-800' : 'text-slate-400'}`}
              >
                📩 Gelen Başvurular ({basvurular.length})
              </button>
              <button
                onClick={() => setAdminTab('oneriler')}
                className={`py-2 px-4 text-xs font-bold rounded-t-xl transition ${adminTab === 'oneriler' ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-800' : 'text-slate-400'}`}
              >
                💡 Fikirler / Öneriler ({oneriler.length})
              </button>
            </div>

            {adminTab === 'haberler' && (
              <div className="space-y-6">
                {/* HABER EKLEME FORMU */}
                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-emerald-400">
                      {duzenlenenHaberId ? '✏️ Haberi Düzenle' : '📣 Yeni Haber / Duyuru Yayınla'}
                    </h3>
                    {duzenlenenHaberId && (
                      <button onClick={formuSifirla} className="text-xs text-amber-400 hover:underline">
                        İptal Et
                      </button>
                    )}
                  </div>

                  {mesaj && <p className="text-xs font-semibold text-emerald-300">{mesaj}</p>}

                  <form onSubmit={handleHaberKaydet} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Haber Başlığı"
                        value={baslik}
                        onChange={(e) => setBaslik(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Kategori (Örn: Duyuru, Vizyon)"
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Haber Detayları..."
                      value={icerik}
                      onChange={(e) => setIcerik(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white"
                      required
                    />
                    <button
                      type="submit"
                      disabled={yukleniyor}
                      className="bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-emerald-600 transition"
                    >
                      {yukleniyor ? 'İşleniyor...' : duzenlenenHaberId ? 'Güncelle 🔄' : 'Yayınla 🚀'}
                    </button>
                  </form>
                </div>

                {/* YAYINLANAN HABER LİSTESİ VE SİL/DÜZENLE */}
                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
                  <h3 className="font-bold text-white text-sm">Yayınlanmış Haberler</h3>
                  {haberler.map((h) => (
                    <div key={h.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                          {h.kategori}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1">{h.baslik}</h4>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleHaberDuzenle(h)} className="px-2.5 py-1 text-xs bg-slate-800 text-amber-400 rounded-lg">
                          Düzenle
                        </button>
                        <button onClick={() => h.id && handleHaberSil(h.id)} className="px-2.5 py-1 text-xs bg-red-500/10 text-red-400 rounded-lg">
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === 'uyeler' && (
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
                <h3 className="font-bold text-white text-sm">Gelen Üyelik Başvuruları</h3>
                {basvurular.map((u) => (
                  <div key={u.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <p className="font-bold text-emerald-400">{u.ad_soyad || u.isim}</p>
                    <p className="text-slate-300">{u.email} {u.sehir ? `| ${u.sehir}` : ''}</p>
                    {u.uzmanlik && <p className="text-slate-400">Uzmanlık: {u.uzmanlik}</p>}
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'oneriler' && (
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
                <h3 className="font-bold text-white text-sm">Gelen Fikirler</h3>
                {oneriler.map((o) => (
                  <div key={o.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <p className="font-bold text-white">{o.baslik}</p>
                    <p className="text-slate-300">{o.icerik}</p>
                    {o.kullanici_adi && <p className="text-emerald-400">— {o.kullanici_adi}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ALT BİLGİ (FOOTER) */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © 2026 İslami Gelişme ve Girişim Partisi (İGGP). Tüm Hakları Saklıdır.
      </footer>
    </div>
  )
}