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
  const [activeTab, setActiveTab] = useState<'anasayfa' | 'hakkimizda' | 'tuzuk' | 'katilim' | 'katil' | 'admin'>('anasayfa')
  const [adminTab, setAdminTab] = useState<'haberler' | 'uyeler' | 'oneriler'>('haberler')

  // Admin Güvenlik State'leri
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [passError, setPassError] = useState(false)

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

  // Admin Giriş Kontrolü
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPasswordInput === 'iggp2026') {
      setIsAdminLoggedIn(true)
      setPassError(false)
      setAdminPasswordInput('')
    } else {
      setPassError(true)
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

  // Başvuru Yap
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

  // Öneri Gönder
  const handleOneriGonder = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMesaj('Gönderiliyor...')
    const { error } = await supabase.from('oneriler').insert([oneriForm])
    if (error) setFormMesaj('Hata oluştu: ' + error.message)
    else {
      setFormMesaj('Fikriniz katılım kürsüsüne başarıyla iletildi!')
      setOneriForm({ baslik: '', icerik: '', kullanici_adi: '' })
      verileriGetir()
    }
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 🚀 ÜST BANNER / SOSYAL MEDYA QUICK BAR */}
      <div className="bg-gradient-to-r from-emerald-900/60 via-slate-900 to-emerald-950 text-xs py-2 px-4 border-b border-emerald-500/20 text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <strong>İGGP Dijital Harekatı:</strong> Geleceğin Teknolojisi, İslami Ahlak ve Adaletle Buluşuyor.
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="https://whatsapp.com" target="_blank" className="hover:text-emerald-400 transition flex items-center gap-1">
              💬 WhatsApp Grubu
            </a>
            <a href="https://x.com" target="_blank" className="hover:text-emerald-400 transition">
              𝕏 Twitter
            </a>
            <a href="https://instagram.com" target="_blank" className="hover:text-emerald-400 transition">
              📸 Instagram
            </a>
          </div>
        </div>
      </div>

      {/* 🏛️ ÜST MENÜ (HEADER & LOGO) */}
      <header className="sticky top-0 z-50 bg-[#0b1329]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* LOGO ALANI */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('anasayfa')}>
            <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-900 rounded-2xl flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg shadow-emerald-500/30 border border-emerald-300/40 group-hover:scale-105 transition transform duration-300">
              <span className="drop-shadow-md">İG</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-[#0b1329]"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition">İGGP</h1>
                <span className="text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold">Resmi Web Portalı</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium tracking-wide">İslami Gelişme ve Girişim Partisi</p>
            </div>
          </div>

          {/* MENÜ LİNKLERİ */}
          <nav className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-semibold flex-wrap justify-center">
            <button
              onClick={() => setActiveTab('anasayfa')}
              className={`px-3.5 py-2 rounded-xl transition ${activeTab === 'anasayfa' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'Bu eksiklerin hepsini tek seferde çözelim. Arayüzü daha kurumsal, şık ve dolu gösterecek; logo, özel renkler, sosyal medya/WhatsApp butonları, admin şifre kontrolü ve detaylı açıklama alanlarını içeren güncel yapıyı aşağıda bulabilirsin.

Önce neleri değiştirdiğimize bakalım, ardından kod tarafında nasıl düzenleyeceğini inceleyelim:

1. **Logo Alanı:** Sayfanın üst kısmına yuvarlak/kare formatta logo yerleşimi ve parti adı eklendi.
2. **Özel Renk Paleti:** CSS en üstündeki renk değişkenlerini (`--ana-renk`, `--ikincil-renk`) değiştirerek kendi parti renklerinizi anında uygulayabilirsiniz.
3. **Admin Şifre Koruması:** Admin paneline erişmek istediğinde şifre soran dinamik bir giriş mekanizması eklendi.
4. **Sosyal Medya & WhatsApp:** En alt kısma ve üst menüye dikkat çeken katılım/iletişim butonları koyuldu.
5. **Zengin İçerik Alanı:** Arayüzün sade kalmaması için duyurular, misyon ve parti ilkeleri kartları eklendi.

---

### Güncellenmiş Arayüz Kodu (HTML / CSS / JS)

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parti Yönetim Paneli</title>
    <style>
        /* 1. RENKLERİNİZİ BURADAN DEĞİŞTİRİN */
        :root {
            --ana-renk: #0d6efd;       /* Partinizin ana rengi (Örn: Lacivert, Kırmızı, Yeşil) */
            --ikincil-renk: #ffc107;   /* Vurgu rengi */
            --koyu-renk: #1a1e21;
            --acik-renk: #f8f9fa;
            --whatsapp-renk: #25d366;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 0;
            color: #333;
        }

        /* HEADER & LOGO */
        header {
            background-color: var(--ana-renk);
            color: white;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .logo-container {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo-img {
            width: 50px;
            height: 50px;
            background-color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: var(--ana-renk);
            border: 2px solid var(--ikincil-renk);
        }

        /* İÇERİK ALANI */
        .container {
            max-width: 1100px;
            margin: 30px auto;
            padding: 0 20px;
        }

        .grid-layout {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
        }

        .card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            border-left: 5px solid var(--ana-renk);
        }

        /* BUTTONLAR & SOSYAL MEDYA */
        .btn {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            cursor: pointer;
            border: none;
            transition: 0.2s;
        }

        .btn-whatsapp {
            background-color: var(--whatsapp-renk);
            color: white;
            width: 100%;
            text-align: center;
            box-sizing: border-box;
            font-size: 16px;
        }

        .btn-admin {
            background-color: var(--ikincil-renk);
            color: #000;
        }

        .social-links {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .social-btn {
            flex: 1;
            padding: 8px;
            text-align: center;
            background: var(--acik-renk);
            border: 1px solid #ddd;
            border-radius: 6px;
            color: #333;
            text-decoration: none;
        }

        /* FOOTER */
        footer {
            text-align: center;
            padding: 20px;
            background: var(--koyu-renk);
            color: white;
            margin-top: 40px;
        }
    </style>
</head>
<body>

    <header>
        <div class="logo-container">
            <!-- Logo resminiz varsa <img src="logo.png" class="logo-img"> kullanabilirsiniz -->
            <div class="logo-img">LOGI</div>
            <h2>PARTİ ADI PORTALI</h2>
        </div>
        <button class="btn btn-admin" onclick="adminGiris()">Admin Paneli Girişi</button>
    </header>

    <div class="container">
        <div class="grid-layout">
            
            <!-- SOL KOLON: İçerik ve Açıklamalar -->
            <div>
                <div class="card">
                    <h3>Partimiz Hakkında & Vizyonumuz</h3>
                    <p>Buraya partinizin temel hedeflerini, vizyonunu ve üyelerin bilmesi gereken detaylı açıklamaları ekleyebilirsiniz. Arayüzün sade kalmaması adına bu alan detaylandırılmıştır.</p>
                </div>

                <div class="card">
                    <h3>Son Duyurular ve Çalışmalar</h3>
                    <ul>
                        <li><strong>Haftalık Toplantı:</strong> Cuma günü saat 20:00'da WhatsApp grubunda sesli katılım sağlanacaktır.</li>
                        <li><strong>Yeni Üye Alımları:</strong> Katılım formunu doldurarak çevrenizi davet edebilirsiniz.</li>
                    </ul>
                </div>
            </div>

            <!-- SAĞ KOLON: Sosyal Medya ve WhatsApp -->
            <div>
                <div class="card">
                    <h3>İletişim & Katılım</h3>
                    <p>Resmi grubumuza katılarak gelişmelerden anında haberdar olun:</p>
                    
                    <!-- WhatsApp Butonu -->
                    <a href="[https://chat.whatsapp.com/ORNEKLINK](https://chat.whatsapp.com/ORNEKLINK)" target="_blank" class="btn btn-whatsapp">
                        💬 WhatsApp Grubuna Katıl
                    </a>

                    <h4 style="margin-top: 20px;">Sosyal Medya Hesaplarımız</h4>
                    <div class="social-links">
                        <a href="#" class="social-btn">Twitter / X</a>
                        <a href="#" class="social-btn">Instagram</a>
                        <a href="#" class="social-btn">YouTube</a>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <footer>
        <p>&copy; 2026 Tüm Hakları Saklıdır.</p>
    </footer>

    <script>
        // ADMIN ŞİFRE KONTROLÜ
        function adminGiris() {
            const adminSifre = "12345"; // Buraya kendi admin şifrenizi belirleyin
            const girilenSifre = prompt("Lütfen Admin Şifresini Giriniz:");

            if (girilenSifre === adminSifre) {
                alert("Giriş başarılı! Admin paneline yönlendiriliyorsunuz.");
                // Burada admin sayfasına yönlendirme yapabilirsiniz:
                // window.location.href = "admin.html";
            } else if (girilenSifre !== null) {
                alert("Hatalı şifre! Erişim reddedildi.");
            }
        }
    </script>
</body>
</html>