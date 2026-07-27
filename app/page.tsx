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
  onayli?: boolean
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

  // Admin Giriş İşlemi (GÜNCELLENEN ŞİFRE: iggpMT2634)
  const handleAdminGiris = (e: React.FormEvent) => {
    e.preventDefault()
    if (sifreInput === 'iggpMT2634') {
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
    const { error } = await supabase.from('oneriler').insert([{ ...oneriForm, onayli: false }])
    if (error) setFormMesaj('Hata oluştu: ' + error.message)
    else {
      setFormMesaj('Fikriniz yönetime iletildi! Onaylandıktan sonra kürsüde görünecektir.')
      setOneriForm({ baslik: '', icerik: '', kullanici_adi: '' })
      verileriGetir()
    }
  }

  // Admin Onay / Sil İşlemleri
  const handleOneriOnayla = async (id: number) => {
    await supabase.from('oneriler').update({ onayli: true }).eq('id', id)
    verileriGetir()
  }

  const handleOneriSil = async (id: number) => {
    if (!confirm('Bu fikri silmek istediğinize emin misiniz?')) return
    await supabase.from('oneriler').delete().eq('id', id)
    verileriGetir()
  }

  const onayliOneriler = oneriler.filter((o) => o.onayli)

  return (
    <div className="min-h-screen bg-[#05110d] text-slate-100 font-sans flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      
      {/* 🟢 ÜST DUYURU & SOSYAL MEDYA BAR */}
      <div className="bg-gradient-to-r from-[#030a08] via-[#091a13] to-[#030a08] text-xs py-2 px-4 border-b border-amber-500/30 text-amber-100/90">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <strong className="text-amber-400">İGGP Dijital Portalı:</strong> Adalet, Ahlak ve Teknolojik Kalkınma Hareketi.
          </span>
          <div className="flex items-center gap-4 font-medium text-[11px]">
            <a href="https://www.tiktok.com/@iggpresmi" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition flex items-center gap-1">
              🎵 TikTok
            </a>
            <a href="https://x.com/iggp272663" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition flex items-center gap-1">
              𝕏 Twitter
            </a>
            <a href="https://www.instagram.com/iggp_tr" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition flex items-center gap-1">
              📸 Instagram
            </a>
          </div>
        </div>
      </div>

      {/* 🏛️ ÜST MENÜ & LOGO */}
      <header className="sticky top-0 z-50 bg-[#061611]/95 backdrop-blur-md border-b border-amber-500/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setActiveTab('anasayfa')}>
            <div className="relative w-12 h-12 rounded-full border-2 border-amber-400/80 p-0.5 shadow-lg shadow-amber-500/10 group-hover:scale-105 group-hover:border-amber-300 transition duration-300 overflow-hidden bg-[#030a08]">
              <img 
                src="/logo.png" 
                alt="İGGP Amblem" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl tracking-wider text-amber-400 group-hover:text-amber-300 transition">İGGP</h1>
                <span className="text-[9px] bg-amber-400/10 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Resmi Portal</span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium tracking-wide">İslami Gelişme ve Girişim Partisi</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-semibold flex-wrap justify-center">
            <button
              onClick={() => setActiveTab('anasayfa')}
              className={`px-3 py-2 rounded-xl transition ${activeTab === 'anasayfa' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/40' : 'text-slate-300 hover:text-amber-300'}`}
            >
              Anasayfa & Haberler
            </button>
            <button
              onClick={() => setActiveTab('vizyon')}
              className={`px-3 py-2 rounded-xl transition ${activeTab === 'vizyon' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/40' : 'text-slate-300 hover:text-amber-300'}`}
            >
              Vizyon & Misyon
            </button>
            <button
              onClick={() => setActiveTab('katilim')}
              className={`px-3 py-2 rounded-xl transition ${activeTab === 'katilim' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/40' : 'text-slate-300 hover:text-amber-300'}`}
            >
              Katılım Kürsüsü ({onayliOneriler.length})
            </button>
            <button
              onClick={() => setActiveTab('tuzuk')}
              className={`px-3 py-2 rounded-xl transition ${activeTab === 'tuzuk' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/40' : 'text-slate-300 hover:text-amber-300'}`}
            >
              Parti Tüzüğü
            </button>
            <button
              onClick={() => setActiveTab('katil')}
              className="px-4 py-2 rounded-xl transition bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
            >
              Aramıza Katıl 🤝
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-xl border transition ${
                activeTab === 'admin'
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                  : 'bg-[#030a08] border-emerald-900 text-slate-300 hover:border-amber-400/40'
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
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#081e18] via-[#051410] to-[#030a08] border border-amber-500/30 p-8 md:p-12 text-center space-y-6 shadow-2xl">
              <div className="mx-auto w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-amber-400/80 p-1 bg-[#030a08] shadow-2xl shadow-amber-500/20 flex items-center justify-center relative group">
                <img 
                  src="/logo.png" 
                  alt="İGGP Amblem" 
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
                ✨ Geleceğin Siyaseti Başlıyor
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Ahlak, Adalet ve <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400">
                  Teknolojik Kalkınma Vizyonu
                </span>
              </h1>
              <p className="text-slate-300 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
                İGGP; adalet ve ahlakı merkeze alan, yerli ve milli teknolojik hamleleri destekleyen, genç fikirlerle Türkiye'nin yarınlarını inşa etmeyi hedefleyen yeni nesil bir siyasi harekettir.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <a href="https://www.tiktok.com/@iggpresmi" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-[#091a13] hover:bg-[#0e271d] text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-2">
                  🎵 TikTok (@iggpresmi)
                </a>
                <a href="https://x.com/iggp272663" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-[#091a13] hover:bg-[#0e271d] text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-2">
                  𝕏 Twitter (@iggp272663)
                </a>
                <a href="https://www.instagram.com/iggp_tr" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-[#091a13] hover:bg-[#0e271d] text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-2">
                  📸 Instagram (@iggp_tr)
                </a>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex justify-between items-center border-b border-emerald-900/80 pb-4">
                <h2 className="text-2xl font-black text-amber-400 flex items-center gap-2">
                  📣 Duyurular & Haberler
                </h2>
                <span className="text-xs text-slate-400">Toplam {haberler.length} haber</span>
              </div>

              {haberler.length === 0 ? (
                <div className="bg-[#081813]/60 p-12 text-center rounded-2xl border border-emerald-900/50 text-slate-400">
                  Henüz duyuru veya haber eklenmedi. Admin panelinden ilk haberi yayınlayabilirsiniz.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {haberler.map((h) => (
                    <div key={h.id} className="bg-[#081813]/80 border border-amber-500/20 p-6 rounded-2xl space-y-3 hover:border-amber-400/50 transition duration-300 shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/30">
                          {h.kategori}
                        </span>
                        <span className="text-xs text-slate-400">
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
            <div className="bg-[#081813]/90 border border-amber-500/30 p-8 rounded-3xl space-y-6 shadow-xl">
              <h2 className="text-3xl font-black text-amber-400">🎯 Vizyonumuz ve Temel İlkelerimiz</h2>
              <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
                <div className="p-4 bg-[#030a08] rounded-xl border border-emerald-900">
                  <h3 className="font-bold text-amber-300 text-base mb-1">1. İslami Ahlak ve Adalet</h3>
                  <p>Kamuda ve toplumsal yaşamda liyakati, şeffaflığı ve hakkaniyeti her şeyin üstünde tutmak.</p>
                </div>
                <div className="p-4 bg-[#030a08] rounded-xl border border-emerald-900">
                  <h3 className="font-bold text-amber-300 text-base mb-1">2. Teknolojik Kalkınma ve Yapay Zeka</h3>
                  <p>Yazılım, yapay zeka, savunma sanayii ve dijital üretimde tam bağımsız Türkiye hedefine liderlik etmek.</p>
                </div>
                <div className="p-4 bg-[#030a08] rounded-xl border border-emerald-900">
                  <h3 className="font-bold text-amber-300 text-base mb-1">3. Genç Girişimcilik</h3>
                  <p>Gençlerin projelerini ve fikirlerini hayata geçirebilecekleri kuluçka merkezleri ve sermaye imkanları sağlamak.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. KATILIM KÜRSÜSÜ */}
        {activeTab === 'katilim' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="bg-[#081813]/90 border border-amber-500/30 p-6 md:p-8 rounded-3xl space-y-4 shadow-xl">
              <h2 className="text-2xl font-black text-amber-400">💡 Fikrini ve Önerini Paylaş</h2>
              <p className="text-xs text-slate-300">Parti yönetimimize iletmek istediğiniz fikir, proje ve önerileri doğrudan buradan gönderin.</p>

              {formMesaj && <p className="text-xs font-semibold text-amber-300 p-3 bg-amber-400/10 rounded-xl border border-amber-400/30">{formMesaj}</p>}

              <form onSubmit={handleOneriGonder} className="space-y-3">
                <input
                  type="text"
                  placeholder="Fikir Başlığı"
                  value={oneriForm.baslik}
                  onChange={(e) => setOneriForm({ ...oneriForm, baslik: e.target.value })}
                  className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
                <textarea
                  placeholder="Fikrinizi veya projenizi açıklayın..."
                  value={oneriForm.icerik}
                  onChange={(e) => setOneriForm({ ...oneriForm, icerik: e.target.value })}
                  rows={4}
                  className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Adınız / Rumuzunuz (Opsiyonel)"
                  value={oneriForm.kullanici_adi}
                  onChange={(e) => setOneriForm({ ...oneriForm, kullanici_adi: e.target.value })}
                  className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button type="submit" className="bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs hover:bg-amber-300 transition">
                  Fikri Gönder 🚀
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Yayınlanan Fikirler ({onayliOneriler.length})</h3>
              {onayliOneriler.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Henüz yayınlanmış bir fikir bulunmuyor.</p>
              ) : (
                onayliOneriler.map((o) => (
                  <div key={o.id} className="bg-[#081813]/50 border border-emerald-900/60 p-4 rounded-xl space-y-1">
                    <h4 className="font-bold text-amber-300 text-sm">{o.baslik}</h4>
                    <p className="text-xs text-slate-300">{o.icerik}</p>
                    {o.kullanici_adi && <p className="text-[10px] text-amber-400 font-medium">— {o.kullanici_adi}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. ARAMIZA KATIL */}
        {activeTab === 'katil' && (
          <div className="max-w-md mx-auto bg-[#081813]/90 border border-amber-500/30 p-6 md:p-8 rounded-3xl space-y-4 shadow-xl">
            <h2 className="text-2xl font-black text-amber-400 text-center">🤝 Üyelik & Gönüllü Formu</h2>
            {formMesaj && <p className="text-xs font-semibold text-center text-amber-300 p-3 bg-amber-400/10 rounded-xl">{formMesaj}</p>}
            <form onSubmit={handleUyeOl} className="space-y-3">
              <input
                type="text"
                placeholder="Ad Soyad"
                value={katilForm.ad_soyad}
                onChange={(e) => setKatilForm({ ...katilForm, ad_soyad: e.target.value })}
                className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
              <input
                type="email"
                placeholder="E-Posta Adresi"
                value={katilForm.email}
                onChange={(e) => setKatilForm({ ...katilForm, email: e.target.value })}
                className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Şehir"
                value={katilForm.sehir}
                onChange={(e) => setKatilForm({ ...katilForm, sehir: e.target.value })}
                className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Uzmanlık Alanı / Meslek"
                value={katilForm.uzmanlik}
                onChange={(e) => setKatilForm({ ...katilForm, uzmanlik: e.target.value })}
                className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
              />
              <button type="submit" className="w-full bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs hover:bg-amber-300 transition">
                Başvuruyu Gönder 🚀
              </button>
            </form>
          </div>
        )}

        {/* 5. TÜZÜK */}
        {activeTab === 'tuzuk' && (
          <div className="bg-[#081813]/90 border border-amber-500/30 p-8 rounded-3xl space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-amber-400">📜 Parti Tüzüğü</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              İGGP; adalet, ahlak, ilim ve teknolojik gelişim esaslarına dayanır. Tüm kademelerde liyakat esas alınır, gençlik ve girişimcilik teşvik edilir.
            </p>
          </div>
        )}

        {/* 6. ADMIN PANELİ */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {!isAdminLoggedIn ? (
              <div className="max-w-sm mx-auto bg-[#081813]/90 border border-amber-500/30 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
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
                    className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white text-center tracking-widest focus:outline-none focus:border-amber-400"
                    required
                  />
                  <button type="submit" className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl text-xs transition">
                    Giriş Yap
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-[#081813] p-4 rounded-2xl border border-emerald-900">
                  <span className="text-xs text-amber-400 font-bold">✅ Admin Oturumu Açık</span>
                  <button onClick={() => setIsAdminLoggedIn(false)} className="text-xs text-red-400 hover:underline">
                    Çıkış Yap
                  </button>
                </div>

                <div className="flex border-b border-emerald-900 gap-2">
                  <button
                    onClick={() => setAdminTab('haberler')}
                    className={`py-2 px-4 text-xs font-bold rounded-t-xl transition ${adminTab === 'haberler' ? 'bg-[#081813] text-amber-400 border-t border-x border-emerald-900' : 'text-slate-400'}`}
                  >
                    📣 Haber Yönetimi ({haberler.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('uyeler')}
                    className={`py-2 px-4 text-xs font-bold rounded-t-xl transition ${adminTab === 'uyeler' ? 'bg-[#081813] text-amber-400 border-t border-x border-emerald-900' : 'text-slate-400'}`}
                  >
                    📩 Başvurular ({basvurular.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('oneriler')}
                    className={`py-2 px-4 text-xs font-bold rounded-t-xl transition ${adminTab === 'oneriler' ? 'bg-[#081813] text-amber-400 border-t border-x border-emerald-900' : 'text-slate-400'}`}
                  >
                    💡 Fikirler Yönetimi ({oneriler.length})
                  </button>
                </div>

                {adminTab === 'haberler' && (
                  <div className="space-y-6">
                    <div className="bg-[#081813]/90 border border-emerald-900 p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-emerald-900 pb-3">
                        <h3 className="font-bold text-amber-400">
                          {duzenlenenHaberId ? '✏️ Haberi Düzenle' : '📣 Yeni Haber / Duyuru Yayınla'}
                        </h3>
                        {duzenlenenHaberId && (
                          <button onClick={formuSifirla} className="text-xs text-amber-400 hover:underline">
                            Vazgeç
                          </button>
                        )}
                      </div>

                      {mesaj && <p className="text-xs font-semibold text-amber-300">{mesaj}</p>}

                      <form onSubmit={handleHaberKaydet} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Haber Başlığı"
                            value={baslik}
                            onChange={(e) => setBaslik(e.target.value)}
                            className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Kategori (Örn: Duyuru, Vizyon)"
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white"
                            required
                          />
                        </div>
                        <textarea
                          placeholder="Haber İçeriği..."
                          value={icerik}
                          onChange={(e) => setIcerik(e.target.value)}
                          rows={4}
                          className="w-full bg-[#030a08] border border-emerald-900 p-3 rounded-xl text-xs text-white"
                          required
                        />
                        <button
                          type="submit"
                          disabled={yukleniyor}
                          className="bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-amber-300 transition"
                        >
                          {yukleniyor ? 'İşleniyor...' : duzenlenenHaberId ? 'Güncelle 🔄' : 'Yayınla 🚀'}
                        </button>
                      </form>
                    </div>

                    <div className="bg-[#081813]/90 border border-emerald-900 p-6 rounded-2xl space-y-3">
                      <h3 className="font-bold text-white text-sm">Mevcut Haberler</h3>
                      {haberler.map((h) => (
                        <div key={h.id} className="p-3 bg-[#030a08] rounded-xl border border-emerald-900 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-bold">
                              {h.kategori}
                            </span>
                            <h4 className="font-bold text-white text-sm mt-1">{h.baslik}</h4>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleHaberDuzenle(h)} className="px-2.5 py-1 text-xs bg-emerald-900/60 text-amber-300 rounded-lg">
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
                  <div className="bg-[#081813]/90 border border-emerald-900 p-6 rounded-2xl space-y-3">
                    <h3 className="font-bold text-white text-sm">Gelen Başvurular</h3>
                    {basvurular.map((u) => (
                      <div key={u.id} className="p-3 bg-[#030a08] rounded-xl border border-emerald-900 text-xs space-y-1">
                        <p className="font-bold text-amber-400">{u.ad_soyad || u.isim}</p>
                        <p className="text-slate-300">{u.email} {u.sehir ? `| ${u.sehir}` : ''}</p>
                        {u.uzmanlik && <p className="text-slate-400">Uzmanlık: {u.uzmanlik}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {adminTab === 'oneriler' && (
                  <div className="bg-[#081813]/90 border border-emerald-900 p-6 rounded-2xl space-y-3">
                    <h3 className="font-bold text-white text-sm">Gelen Fikirler & Onay Mantığı</h3>
                    {oneriler.map((o) => (
                      <div key={o.id} className="p-3 bg-[#030a08] rounded-xl border border-emerald-900 text-xs flex justify-between items-center">
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-amber-300">{o.baslik}</p>
                            {o.onayli ? (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">Yayınlandı</span>
                            ) : (
                              <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">Onay Bekliyor</span>
                            )}
                          </div>
                          <p className="text-slate-300">{o.icerik}</p>
                          {o.kullanici_adi && <p className="text-amber-400">— {o.kullanici_adi}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!o.onayli && o.id && (
                            <button onClick={() => handleOneriOnayla(o.id!)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold">
                              Onayla ✅
                            </button>
                          )}
                          {o.id && (
                            <button onClick={() => handleOneriSil(o.id!)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg">
                              Sil 🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 🔻 FOOTER */}
      <footer className="border-t border-amber-500/20 bg-[#030a08] py-6 text-center text-xs text-slate-400">
        <p>© 2026 İGGP - İslami Gelişme ve Girişim Partisi. Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  )
}