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
  const [activeTab, setActiveTab] = useState<'anasayfa' | 'vizyon' | 'tuzuk' | 'katilim' | 'katil' | 'admin'>('anasayfa')
  const [adminTab, setAdminTab] = useState<'haberler' | 'uyeler' | 'oneriler'>('haberler')

  // Admin Şifre Kontrolü State'leri
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [sifreInput, setSifreInput] = useState('')
  const [sifreHata, setSifreHata] = useState(false)

  // Veri State'leri
  const [haberler, setHaberler] = useState<Haber[]>([])
  const [basvurular, setBasvurular] = useState<Uye[]>([])
  const [oneriler, setOneriler] = useState<Oneri[]>([])

  // Form State'leri
  const [baslik, setBaslik] = useState('')
  const [kategori, setKategori] = useState('')
  const [icerik, setIcerik] = useState('')
  const [duzenlenenHaberId, setDuzenlenenHaberId] = useState<number | null>(null)
  const [mesaj, setMesaj] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  // Katılım Form State'leri
  const [katilForm, setKatilForm] = useState({ ad_soyad: '', email: '', sehir: '', uzmanlik: '' })
  const [oneriForm, setOneriForm] = useState({ baslik: '', icerik: '', kullanici_adi: '' })
  const [formMesaj, setFormMesaj] = useState('')

  // Supabase'den Verileri Çek
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

  // Admin Giriş İşlemi (Şifre: iggp2026)
  const handleAdminGiris = (e: React.FormEvent) => {
    e.preventDefault()
    if (sifreInput === 'iggp2026') {
      setIsAdminLoggedIn(true)
      setSifreHata(false)
      setSifreInput('')
    } else {
      setSifreHata(true)
    }
  }

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

  // Üyelik / Öneri Gönderme
  const handleUyeOl = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMesaj('Gönderiliyor...')
    const { error } = await supabase.from('uyeler').insert([katilForm])
    if (error) setFormMesaj('Hata oluştu: ' + error.message)
    else {
      setFormMesaj('Başvurunuz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.')
      setKatilForm({ ad_soyad: '', email: '', sehir: '', uzmanlik: '' })
      verileriGetir()
    }
  }

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
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 🟢 ÜST DUYURU & SOSYAL MEDYA BAR */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-xs py-2 px-4 border-b border-emerald-500/20 text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <strong>İGGP Dijital Vizyonu:</strong> Ahlak, Adalet ve Teknolojik Kalkınma İle Yarınlara.
          </span>
          <div className="flex items-center gap-4 font-medium text-[11px]">
            <a href="https://www.tiktok.com/@iggpresmi" target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition flex items-center gap-1">
              🎵 TikTok
            </a>
            <a href="https://x.com/iggp272663" target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition flex items-center gap-1">
              𝕏 Twitter
            </a>
            <a href="https://www.instagram.com/iggp_tr" target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition flex items-center gap-1">
              📸 Instagram
            </a>
          </div>
        </div>
      </div>

      {/* 🏛️ ÜST MENÜ & LOGO */}
      <header className="sticky top-0 z-50 bg-[#0a101d]/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* LOGO AMBLEMİ */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('anasayfa')}>
            <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-950 rounded-2xl flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg shadow-emerald-500/20 border border-emerald-300/30 group-hover:scale-105 transition duration-300">
              İG
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-[#0a101d]"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl tracking-wide text-white group-hover:text-emerald-400 transition">İGGP</h1>
                <span className="text-[9px] bg-amber-400/10 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Resmi Portal</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium tracking-wide">İslami Gelişme ve Girişim Partisi</p>
            </div>
          </div>

          {/* MENÜ LİNKLERİ */}
          <nav className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-semibold flex-wrap justify-center">
            <button
              onClick={() => setActiveTab('anasayfa')}
              className={`px-3 py-2 rounded-xl transition ${activeTab === 'anasayfa' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Anasayfa & Haberler
            </button>
            <button
              onClick={() => setActiveTab('vizyon')}
              className={`px-3 py-2 rounded-xl transition ${activeTab === 'vizyon' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Vizyon & Misyon
            </button>
            <button
              onClick={() => setActiveTab('katilim')}
              className={`px-3 py-2 rounded-xl transition ${activeTab === 'katilim' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Katılım Kürsüsü ({oneriler.length})
            </button>
            <button
              onClick={() => setActiveTab('tuzuk')}
              className={`px-3 py-2 rounded-xl transition ${activeTab === 'tuzuk' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Parti Tüzüğü
            </button>
            <button
              onClick={() => setActiveTab('katil')}
              className="px-4 py-2 rounded-xl transition bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
            >
              Aramıza Katıl 🤝
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-xl border transition ${
                activeTab === 'admin'
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              🔒 Admin
            </button>
          </nav>
        </div>
      </header>

      {/* 📄 ANA İÇERİK ALANI */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        
        {/* 1. ANASAYFA */}
        {activeTab === 'anasayfa' && (
          <div className="space-y-12">
            {/* HERO BANNER */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-[#0d1627] to-[#070b14] border border-slate-800 p-8 md:p-14 text-center space-y-6 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                ✨ Geleceğin Siyareti Başlıyor
              </div>
              <h1 className="text-3xl md:text-6xl font-black tracking-tight text-white leading-tight">
                Ahlak, Adalet ve <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                  Teknolojik Kalkınma Vizyonu
                </span>
              </h1>
              <p className="text-slate-300 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
                İGGP; adalet ve ahlakı merkeze alan, yerli ve milli teknolojik hamleleri destekleyen, genç fikirlerle Türkiye'nin yarınlarını inşa etmeyi hedefleyen yeni nesil bir siyasi harekettir.
              </p>
              
              {/* SOSYAL MEDYA DIŞ BAĞLANTILARI */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <a href="https://www.tiktok.com/@iggpresmi" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition flex items-center gap-2">
                  🎵 TikTok (@iggpresmi)
                </a>
                <a href="https://x.com/iggp272663" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition flex items-center gap-2">
                  𝕏 Twitter (@iggp272663)
                </a>
                <a href="https://www.instagram.com/iggp_tr" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition flex items-center gap-2">
                  📸 Instagram (@iggp_tr)
                </a>
              </div>
            </section>

            {/* HABERLER VE DUYURULAR */}
            <section className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  📣 Duyurular & Haberler
                </h2>
                <span className="text-xs text-slate-400">Toplam {haberler.length} haber</span>
              </div>

              {haberler.length === 0 ? (
                <div className="bg-slate-900/40 p-12 text-center rounded-2xl border border-slate-800/80 text-slate-500">
                  Henüz duyuru veya haber eklenmedi. Admin panelinden ilk haberi yayınlayabilirsiniz.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {haberler.map((h) => (
                    <div key={h.id} className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition duration-300 shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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

        {/* 2. VİZYON & MİSYON */}
        {activeTab === 'vizyon' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl space-y-6">
              <h2 className="text-3xl font-black text-emerald-400">🎯 Vizyonumuz ve Temel İlkelerimiz</h2>
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <h3 className="font-bold text-white text-base mb-1">1. İslami Ahlak ve Adalet</h3>
                  <p>Kamuda ve toplumsal yaşamda liyakati, şeffaflığı ve hakkaniyeti her şeyin üstünde tutmak.</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <h3 className="font-bold text-white text-base mb-1">2. Teknolojik Kalkınma ve Yapay Zeka</h3>
                  <p>Yazılım, yapay zeka, savunma sanayii ve dijital üretimde tam bağımsız Türkiye hedefine liderlik etmek.</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <h3 className="font-bold text-white text-base mb-1">3. Genç Girişimcilik</h3>
                  <p>Gençlerin projelerini ve fikirlerini hayata geçirebilecekleri kuluçka merkezleri ve sermaye imkanları sağlamak.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. KATILIM KÜRSÜSÜ */}
        {activeTab === 'katilim' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-4 shadow-xl">
              <h2 className="text-2xl font-black text-emerald-400">💡 Fikrini ve Önerini Paylaş</h2>
              <p className="text-xs text-slate-400">Parti yönetimimize iletmek istediğiniz fikir, proje ve önerileri doğrudan buradan gönderebilirsiniz.</p>

              {formMesaj && <p className="text-xs font-semibold text-emerald-300 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">{formMesaj}</p>}

              <form onSubmit={handleOneriGonder} className="space-y-3">
                <input
                  type="text"
                  placeholder="Fikir Başlığı"
                  value={oneriForm.baslik}
                  onChange={(e) => setOneriForm({ ...oneriForm, baslik: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <textarea
                  placeholder="Fikrinizi veya projenizi açıklayın..."
                  value={oneriForm.icerik}
                  onChange={(e) => setOneriForm({ ...oneriForm, icerik: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Adınız / Rumuzunuz (Opsiyonel)"
                  value={oneriForm.kullanici_adi}
                  onChange={(e) => setOneriForm({ ...oneriForm, kullanici_adi: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs hover:bg-emerald-400 transition">
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

        {/* 4. ARAMIZA KATIL */}
        {activeTab === 'katil' && (
          <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-4 shadow-xl">
            <h2 className="text-2xl font-black text-emerald-400 text-center">🤝 Üyelik & Gönüllü Formu</h2>
            {formMesaj && <p className="text-xs font-semibold text-center text-emerald-300 p-3 bg-emerald-500/10 rounded-xl">{formMesaj}</p>}
            <form onSubmit={handleUyeOl} className="space-y-3">
              <input
                type="text"
                placeholder="Ad Soyad"
                value={katilForm.ad_soyad}
                onChange={(e) => setKatilForm({ ...katilForm, ad_soyad: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white"
                required
              />
              <input
                type="email"
                placeholder="E-Posta Adresi"
                value={katilForm.email}
                onChange={(e) => setKatilForm({ ...katilForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white"
                required
              />
              <input
                type="text"
                placeholder="Şehir"
                value={katilForm.sehir}
                onChange={(e) => setKatilForm({ ...katilForm, sehir: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white"
              />
              <input
                type="text"
                placeholder="Uzmanlık Alanı / Meslek"
                value={katilForm.uzmanlik}
                onChange={(e) => setKatilForm({ ...katilForm, uzmanlik: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white"
              />
              <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl text-xs hover:bg-emerald-400 transition">
                Başvuruyu Gönder 🚀
              </button>
            </form>
          </div>
        )}

        {/* 5. TÜZÜK */}
        {activeTab === 'tuzuk' && (
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-emerald-400">📜 Parti Tüzüğü</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              İGGP; adalet, ahlak, ilim ve teknolojik gelişim esaslarına dayanır. Tüm kademelerde liyakat esas alınır, gençlik ve girişimcilik teşvik edilir.
            </p>
          </div>
        )}

        {/* 6. ADMIN PANELİ (KORUMALI & ŞİFRELİ) */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {!isAdminLoggedIn ? (
              /* ADMIN ŞİFRE GİRİŞ EKRANI */
              <div className="max-w-sm mx-auto bg-slate-900/90 border border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
                <div className="w-12 h-12 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                  🔒
                </div>
                <h2 className="text-xl font-bold text-white">Yönetici Girişi</h2>
                <p className="text-xs text-slate-400">Devam etmek için yönetici şifresini giriniz.</p>

                {sifreHata && (
                  <p className="text-xs text-red-400 font-semibold bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                    Hatalı Şifre! Lütfen tekrar deneyin.
                  </p>
                )}

                <form onSubmit={handleAdminGiris} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Admin Şifresi"
                    value={sifreInput}
                    onChange={(e) => setSifreInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white text-center tracking-widest focus:outline-none focus:border-amber-400"
                    required
                  />
                  <button type="submit" className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl text-xs transition">
                    Giriş Yap
                  </button>
                </form>
              </div>
            ) : (
              /* ADMIN PANELİ İÇERİĞİ */
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-emerald-400 font-bold">✅ Admin Oturumu Açık</span>
                  <button onClick={() => setIsAdminLoggedIn(false)} className="text-xs text-red-400 hover:underline">
                    Çıkış Yap
                  </button>
                </div>

                <div className="flex border-b border-slate-800 gap-2">
                  <button
                    onClick={() => setAdminTab('haberler')}
                    className={`py-2 px-4 text-xs font-bold rounded-t-xl transition ${adminTab === 'haberler' ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-800' : 'text-slate-400'}`}
                  >
                    📣 Haber Yönetimi ({haberler.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('uyeler')}
                    className={`py-2 px-4 text-xs font-bold rounded-t-xl transition ${adminTab === 'uyeler' ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-800' : 'text-slate-400'}`}
                  >
                    📩 Başvurular ({basvurular.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('oneriler')}
                    className={`py-2 px-4 text-xs font-bold rounded-t-xl transition ${adminTab === 'oneriler' ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-800' : 'text-slate-400'}`}
                  >
                    💡 Fikirler ({oneriler.length})
                  </button>
                </div>

                {adminTab === 'haberler' && (
                  <div className="space-y-6">
                    {/* HABER FORM */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h3 className="font-bold text-emerald-400">
                          {duzenlenenHaberId ? '✏️ Haberi Düzenle' : '📣 Yeni Haber / Duyuru Yayınla'}
                        </h3>
                        {duzenlenenHaberId && (
                          <button onClick={formuSifirla} className="text-xs text-amber-400 hover:underline">
                            Vazgeç
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
                          placeholder="Haber İçeriği..."
                          value={icerik}
                          onChange={(e) => setIcerik(e.target.value)}
                          rows={4}
                          className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white"
                          required
                        />
                        <button
                          type="submit"
                          disabled={yukleniyor}
                          className="bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-emerald-400 transition"
                        >
                          {yukleniyor ? 'İşleniyor...' : duzenlenenHaberId ? 'Güncelle 🔄' : 'Yayınla 🚀'}
                        </button>
                      </form>
                    </div>

                    {/* HABER LİSTESİ */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
                      <h3 className="font-bold text-white text-sm">Mevcut Haberler</h3>
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
                    <h3 className="font-bold text-white text-sm">Gelen Başvurular</h3>
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
          </div>
        )}
      </main>

      {/* 🔻 ALT BİLGİ (FOOTER) */}
      <footer className="border-t border-slate-800/80 bg-[#0a101d] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-bold text-white">İGGP - İslami Gelişme ve Girişim Partisi</p>
            <p className="text-[11px] text-slate-500 mt-1">© 2026 Tüm Hakları Saklıdır. Ahlak, Adalet ve Teknoloji Hareketi.</p>
          </div>
          <div className="flex gap-4 font-semibold text-[11px]">
            <a href="https://www.tiktok.com/@iggpresmi" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">TikTok</a>
            <a href="https://x.com/iggp272663" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">Twitter / X</a>
            <a href="https://www.instagram.com/iggp_tr" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">Instagram</a>
          </div>
        </div>
      </footer>

    </div>
  )
}