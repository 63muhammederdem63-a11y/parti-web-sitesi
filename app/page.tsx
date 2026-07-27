'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

interface Oneri {
  id: string;
  baslik: string;
  icerik: string;
  gonderen_adi: string;
  oy_sayisi: number;
  created_at: string;
}

interface Uye {
  id: string;
  ad_soyad: string;
  eposta: string;
  sehir: string;
  uzmanlik_alani: string;
  created_at: string;
}

interface Haber {
  id: string;
  baslik: string;
  ozet?: string;
  icerik: string;
  created_at: string;
}

export default function Home() {
  const [aktifSekme, setAktifSekme] = useState<'anasayfa' | 'oneriler' | 'tuzuk' | 'basvuru' | 'admin'>('anasayfa');
  
  // Öneri Verileri
  const [oneriler, setOneriler] = useState<Oneri[]>([]);
  const [baslik, setBaslik] = useState('');
  const [icerik, setIcerik] = useState('');
  const [gonderen, setGonderen] = useState('');
  const [yukleniyorOneri, setYukleniyorOneri] = useState(false);
  const [oneriFiltre, setOneriFiltre] = useState<'populer' | 'yeni'>('populer');

  // Üyelik Formu
  const [adSoyad, setAdSoyad] = useState('');
  const [eposta, setEposta] = useState('');
  const [telefon, setTelefon] = useState('');
  const [sehir, setSehir] = useState('');
  const [uzmanlik, setUzmanlik] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [yukleniyorUye, setYukleniyorUye] = useState(false);
  const [uyeBasari, setUyeBasari] = useState(false);

  // Haberler
  const [haberler, setHaberler] = useState<Haber[]>([]);
  const [haberBaslik, setHaberBaslik] = useState('');
  const [haberOzet, setHaberOzet] = useState('');
  const [haberIcerik, setHaberIcerik] = useState('');
  const [yukleniyorHaber, setYukleniyorHaber] = useState(false);
  const [haberMesaj, setHaberMesaj] = useState('');

  // Admin Paneli
  const [adminSifre, setAdminSifre] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [uyeler, setUyeler] = useState<Uye[]>([]);

  // Haberleri Getir
  const haberleriGetir = async () => {
    try {
      const { data, error } = await supabase.from('haberler').select('*').order('created_at', { ascending: false });
      if (error) console.error("Haberler çekilemedi:", error.message);
      if (data) setHaberler(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Önerileri Getir
  const onerileriGetir = async () => {
    const query = supabase.from('oneriler').select('*');
    if (oneriFiltre === 'populer') {
      query.order('oy_sayisi', { ascending: false });
    } else {
      query.order('created_at', { ascending: false });
    }
    const { data } = await query;
    if (data) setOneriler(data);
  };

  // Üyeleri Getir
  const uyeleriGetir = async () => {
    const { data } = await supabase.from('uyeler').select('*').order('created_at', { ascending: false });
    if (data) setUyeler(data);
  };

  useEffect(() => {
    haberleriGetir();
    onerileriGetir();
  }, []);

  useEffect(() => {
    onerileriGetir();
  }, [oneriFiltre]);

  useEffect(() => {
    if (isAdmin) uyeleriGetir();
  }, [isAdmin]);

  // Yeni Haber Ekle
  const haberEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!haberBaslik || !haberIcerik) return;
    setYukleniyorHaber(true);
    setHaberMesaj('Gönderiliyor...');

    const { data, error } = await supabase.from('haberler').insert([
      { baslik: haberBaslik, ozet: haberOzet, icerik: haberIcerik }
    ]).select();

    if (error) {
      setHaberMesaj('Hata oluştu: ' + error.message);
    } else {
      setHaberBaslik('');
      setHaberOzet('');
      setHaberIcerik('');
      setHaberMesaj('Haber başarıyla yayınlandı! 🎉');
      await haberleriGetir();
    }
    setYukleniyorHaber(false);
  };

  // Yeni Öneri Kaydet
  const oneriGonder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baslik || !icerik) return;
    setYukleniyorOneri(true);
    const { error } = await supabase.from('oneriler').insert([
      { baslik, icerik, gonderen_adi: gonderen || 'Anonim Üye' }
    ]);
    if (!error) {
      setBaslik('');
      setIcerik('');
      setGonderen('');
      onerileriGetir();
    }
    setYukleniyorOneri(false);
  };

  // Öneri Oy Ver
  const oyVer = async (id: string, mevcutOy: number) => {
    const { error } = await supabase.from('oneriler').update({ oy_sayisi: mevcutOy + 1 }).eq('id', id);
    if (!error) onerileriGetir();
  };

  // Üye Başvurusu Yap
  const uyeOl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSoyad || !eposta || !sehir) return;
    setYukleniyorUye(true);
    const { error } = await supabase.from('uyeler').insert([
      { ad_soyad: adSoyad, eposta, telefon, sehir, uzmanlik_alani: uzmanlik, mesaj }
    ]);
    if (!error) {
      setUyeBasari(true);
      setAdSoyad('');
      setEposta('');
      setTelefon('');
      setSehir('');
      setUzmanlik('');
      setMesaj('');
    }
    setYukleniyorUye(false);
  };

  // Admin Girişi
  const adminGiris = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSifre === 'iggp2026') {
      setIsAdmin(true);
    } else {
      alert('Hatalı Şifre!');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Arka Plan Işıklandırması */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAktifSekme('anasayfa')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
              İG
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                İGGP
              </h1>
              <p className="text-xs text-emerald-400 font-medium">İslami Gelişme ve Girişim Partisi</p>
            </div>
          </div>

          {/* Navigasyon Sekmeleri */}
          <nav className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm font-medium">
            <button
              onClick={() => setAktifSekme('anasayfa')}
              className={`px-4 py-2 rounded-xl transition-all ${
                aktifSekme === 'anasayfa' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Anasayfa & Vizyon
            </button>
            <button
              onClick={() => setAktifSekme('oneriler')}
              className={`px-4 py-2 rounded-xl transition-all ${
                aktifSekme === 'oneriler' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Katılım Kürsüsü ({oneriler.length})
            </button>
            <button
              onClick={() => setAktifSekme('tuzuk')}
              className={`px-4 py-2 rounded-xl transition-all ${
                aktifSekme === 'tuzuk' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Parti Tüzüğü
            </button>
            <button
              onClick={() => setAktifSekme('basvuru')}
              className={`px-4 py-2 rounded-xl transition-all ${
                aktifSekme === 'basvuru' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Aramıza Katıl 🤝
            </button>
            <button
              onClick={() => setAktifSekme('admin')}
              className={`px-3 py-2 rounded-xl transition-all border ${
                aktifSekme === 'admin' ? 'border-emerald-500 text-emerald-400' : 'border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              🔒 Admin
            </button>
          </nav>
        </div>
      </header>

      {/* İÇERİK ALANI */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* 1. SEKMELİ SAYFA: ANASAYFA & VİZYON */}
        {aktifSekme === 'anasayfa' && (
          <div className="space-y-16">
            <section className="text-center py-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs md:text-sm font-semibold mb-8 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Geleceğin Dijital ve Adil Siyaset Anlayışı
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-tight mb-8 bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Ahlak, Adalet ve Teknolojik Kalkınma
              </h2>
              <p className="text-slate-400 text-base md:text-xl max-w-3xl mx-auto leading-relaxed mb-12">
                İGGP; milli değerlerimizi, yüksek teknoloji vizyonumuz ve genç girişimci gücümüzle Türkiye'yi yarınlara hazırlamak için kurulan dijital odaklı siyasi harekettir.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setAktifSekme('basvuru')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 text-sm md:text-base"
                >
                  Gönüllü / Üye Ol
                </button>
                <button
                  onClick={() => setAktifSekme('oneriler')}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold px-8 py-4 rounded-2xl transition-all text-sm md:text-base"
                >
                  Fikir Bildir
                </button>
              </div>
            </section>

            {/* İstatistikler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-center p-2">
                <div className="text-3xl font-black text-emerald-400">%100</div>
                <div className="text-xs text-slate-400 mt-1">Liyakat ve Şeffaflık</div>
              </div>
              <div className="text-center p-2 border-l border-slate-800">
                <div className="text-3xl font-black text-emerald-400">Canlı</div>
                <div className="text-xs text-slate-400 mt-1">Üye Karar Mekanizması</div>
              </div>
              <div className="text-center p-2 border-l border-slate-800">
                <div className="text-3xl font-black text-emerald-400">Ar-Ge</div>
                <div className="text-xs text-slate-400 mt-1">Yerli Teknoloji Fonu</div>
              </div>
              <div className="text-center p-2 border-l border-slate-800">
                <div className="text-3xl font-black text-emerald-400">Mikro</div>
                <div className="text-xs text-slate-400 mt-1">Gençlik Hibe Destekleri</div>
              </div>
            </div>

            {/* Haberler ve Duyurular Bölümü */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold border-l-4 border-emerald-500 pl-4">📰 Son Haberler & Duyurular</h3>
              {haberler.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 text-center text-slate-500">
                  Henüz bir haber yayınlanmadı. Admin panelinden ilk haberi ekleyebilirsiniz.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {haberler.map((h) => (
                    <div key={h.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/30 transition-all">
                      <div className="text-xs text-emerald-400">{new Date(h.created_at).toLocaleDateString('tr-TR')}</div>
                      <h4 className="text-xl font-bold text-white">{h.baslik}</h4>
                      {h.ozet && <p className="text-slate-300 text-sm font-medium">{h.ozet}</p>}
                      <p className="text-slate-400 text-sm leading-relaxed">{h.icerik}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Temel Program Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-2xl mb-6">
                  ⚖️
                </div>
                <h3 className="text-xl font-bold mb-3">Liyakatli & Adil Düzen</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Devlet kademelerinde adalet, şeffaflık ve yeteneğe dayalı liyakat sistemini şart koşuyoruz.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-2xl mb-6">
                  💻
                </div>
                <h3 className="text-xl font-bold mb-3">Teknoloji & Yazılım Devrimi</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Oyun geliştirme, yapay zeka ve yerli donanım geliştiren genç yeteneklere vergisel ve finansal tam muafiyet.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-2xl mb-6">
                  🌱
                </div>
                <h3 className="text-xl font-bold mb-3">Girişimci & Faizsiz Model</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Üretime dayalı, faiz yükünden arındırılmış, fikri olan her gencin desteklendiği kuluçka sermaye modelleri.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. SEKMELİ SAYFA: KATILIM KÜRSÜSÜ */}
        {aktifSekme === 'oneriler' && (
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-black mb-3">Demokratik Dijital Kürsü</h2>
              <p className="text-slate-400 text-sm">
                Fikirlerinizi özgürce paylaşın. Üyelerimizin oylarıyla öne çıkan teklifler parti meclisimizde doğrudan gündeme alınır.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={oneriGonder} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
              <h3 className="text-lg font-bold mb-6 text-emerald-400">✏️ Yeni Öneri veya Teklif Paylaş</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Adınız veya Rumuzunuz (Opsiyonel)"
                  value={gonderen}
                  onChange={(e) => setGonderen(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                />
                <input
                  type="text"
                  placeholder="Öneri Başlığı *"
                  required
                  value={baslik}
                  onChange={(e) => setBaslik(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                />
              </div>
              <textarea
                placeholder="Önerinizi ve beklenen faydayı detaylıca açıklayın... *"
                required
                rows={3}
                value={icerik}
                onChange={(e) => setIcerik(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600 mb-6"
              />
              <button
                type="submit"
                disabled={yukleniyorOneri}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {yukleniyorOneri ? 'Yayınlanıyor...' : 'Öneriyi Kürsüye Gönder 🚀'}
              </button>
            </form>

            {/* Liste */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="font-bold text-lg">Gelen Fikirler ({oneriler.length})</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOneriFiltre('populer')}
                    className={`text-xs px-3 py-1.5 rounded-lg border ${
                      oneriFiltre === 'populer' ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    🔥 En Çok Oy Alanlar
                  </button>
                  <button
                    onClick={() => setOneriFiltre('yeni')}
                    className={`text-xs px-3 py-1.5 rounded-lg border ${
                      oneriFiltre === 'yeni' ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    ⏱️ En Yeniler
                  </button>
                </div>
              </div>

              {oneriler.map((item) => (
                <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-medium">
                        {item.gonderen_adi}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <h4 className="font-bold text-lg text-white">{item.baslik}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.icerik}</p>
                  </div>
                  <button
                    onClick={() => oyVer(item.id, item.oy_sayisi)}
                    className="w-full md:w-auto flex md:flex-col items-center justify-center bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 rounded-xl px-5 py-3 transition-all"
                  >
                    <span className="text-xs text-emerald-400">▲ Oy Ver</span>
                    <span className="font-black text-xl text-emerald-300">{item.oy_sayisi}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SEKMELİ SAYFA: PARTİ TÜZÜĞÜ */}
        {aktifSekme === 'tuzuk' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black mb-2">Parti Tüzüğü ve Temel Doktrin</h2>
              <p className="text-slate-400 text-sm">İGGP yönetim prensipleri ve kuruluş beyannamesi</p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">Madde 1: Partinin Adı ve Amacı</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Partinin adı "İslami Gelişme ve Girişim Partisi" (Kısaltması: İGGP)'dir. Amacı; adalet, ahlak ve teknolojik gelişmeyi harmanlayarak bağımsız, milli ve üretken bir Türkiye inşa etmektir.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">Madde 2: Dijital Katılımcılık ve Şeffaflık</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Parti kararları ve politika teklifleri dijital portal üzerinden üyelerin oylamasına sunulur. Tüm parti bütçesi ve harcamaları şeffaf olarak üyelere açık paylaşılır.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">Madde 3: Gençlik ve Girişimcilik</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Gençlerin yazılım, oyun, sanayi ve teknoloji alanındaki girişimlerine doğrudan fon sağlama yetkisine sahip Kuluçka Merkezleri kurulur.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. SEKMELİ SAYFA: ARAMIZA KATIL / ÜYELİK */}
        {aktifSekme === 'basvuru' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black mb-2">Resmi Üyelik & Gönüllülük Formu</h2>
              <p className="text-slate-400 text-sm">Geleceğin Türkiye'sini birlikte inşa edelim. Formu doldurun, sizinle iletişime geçelim.</p>
            </div>

            {uyeBasari ? (
              <div className="bg-emerald-950/80 border border-emerald-700 rounded-2xl p-8 text-center space-y-4">
                <div className="text-4xl">🎉</div>
                <h3 className="text-xl font-bold text-emerald-300">Başvurunuz Başarıyla Alındı!</h3>
                <p className="text-slate-300 text-sm">Teşekkür ederiz. İGGP Teşkilat Birimimiz en kısa sürede sizinle iletişime geçecektir.</p>
                <button
                  onClick={() => setUyeBasari(false)}
                  className="bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
                >
                  Yeni Başvuru Yap
                </button>
              </div>
            ) : (
              <form onSubmit={uyeOl} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={adSoyad}
                    onChange={(e) => setAdSoyad(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">E-Posta *</label>
                    <input
                      type="email"
                      required
                      value={eposta}
                      onChange={(e) => setEposta(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={telefon}
                      onChange={(e) => setTelefon(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Şehir *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: İstanbul, Ankara..."
                      value={sehir}
                      onChange={(e) => setSehir(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Uzmanlık / Meslek</label>
                    <input
                      type="text"
                      placeholder="Örn: Yazılımcı, Mühendis, Öğrenci..."
                      value={uzmanlik}
                      onChange={(e) => setUzmanlik(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Partiye Nasıl Katkı Sağlayabilirsiniz?</label>
                  <textarea
                    rows={3}
                    value={mesaj}
                    onChange={(e) => setMesaj(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={yukleniyorUye}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {yukleniyorUye ? 'Kaydediliyor...' : 'Üyelik / Gönüllülük Başvurusunu Gönder 🤝'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 5. SEKMELİ SAYFA: ADMIN PANELI */}
        {aktifSekme === 'admin' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {!isAdmin ? (
              <form onSubmit={adminGiris} className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
                <h3 className="text-xl font-bold text-center">Yönetici Girişi</h3>
                <p className="text-xs text-slate-400 text-center">Yönetim paneline erişmek için şifrenizi girin.</p>
                <input
                  type="password"
                  placeholder="Giriş Şifresi"
                  value={adminSifre}
                  onChange={(e) => setAdminSifre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl text-sm">
                  Sisteme Giriş Yap
                </button>
                <p className="text-center text-[10px] text-slate-600">Varsayılan Şifre: iggp2026</p>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <h3 className="font-bold text-emerald-400">Yönetim Paneli</h3>
                  <button onClick={() => setIsAdmin(false)} className="text-xs text-red-400 hover:underline">Çıkış Yap</button>
                </div>

                {/* Haber / Duyuru Ekleme Formu */}
                <form onSubmit={haberEkle} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h4 className="font-bold text-lg text-emerald-400">📢 Yeni Haber / Duyuru Yayınla</h4>
                  {haberMesaj && <p className={`text-xs font-bold ${haberMesaj.includes('Hata') ? 'text-red-400' : 'text-emerald-400'}`}>{haberMesaj}</p>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Haber Başlığı *"
                      required
                      value={haberBaslik}
                      onChange={(e) => setHaberBaslik(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Kısa Özet (Opsiyonel)"
                      value={haberOzet}
                      onChange={(e) => setHaberOzet(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <textarea
                    placeholder="Haber Detayı ve Metni... *"
                    required
                    rows={4}
                    value={haberIcerik}
                    onChange={(e) => setHaberIcerik(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={yukleniyorHaber}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                  >
                    {yukleniyorHaber ? 'Yayınlanıyor...' : 'Haberi Yayınla 🚀'}
                  </button>
                </form>

                {/* Gelen Başvurular */}
                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-white">📩 Gelen Üyelik Başvuruları ({uyeler.length})</h4>
                  {uyeler.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">Henüz üyelik başvurusu yapılmamış.</p>
                  ) : (
                    uyeler.map((u) => (
                      <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-base">{u.ad_soyad}</h4>
                            <p className="text-xs text-emerald-400">{u.eposta} | {u.sehir}</p>
                          </div>
                          <span className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        {u.uzmanlik_alani && (
                          <div className="text-xs text-slate-300">
                            <strong>Uzmanlık:</strong> {u.uzmanlik_alani}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 text-center text-xs text-slate-500 bg-slate-950 relative z-10">
        <p className="mb-2">© 2026 İslami Gelişme ve Girişim Partisi (İGGP). Tüm Hakları Saklıdır.</p>
        <p className="text-slate-600">Ahlak, Adalet ve Teknolojik Kalkınma Vizyonuyla İlerleme Projesidir.</p>
      </footer>
    </main>
  );
}