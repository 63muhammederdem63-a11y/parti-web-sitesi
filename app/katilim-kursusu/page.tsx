'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  Search,
  Filter,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  TrendingUp,
  X,
  Award,
  ChevronRight,
  Send,
  MessageCircle,
  Bookmark
} from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  summary: string;
  author: string;
  authorTitle: string;
  category: string;
  status: 'oylamada' | 'incelemede' | 'kabul-edildi' | 'mecliste';
  votes: number;
  commentsCount: number;
  createdAt: string;
  hasVoted?: boolean;
  hasBookmarked?: boolean;
}

const INITIAL_TOPICS: Topic[] = [
  {
    id: '1',
    title: 'Mahalle Parklarına Güneş Enerjili Şarj ve Aydınlatma İstasyonları',
    summary: 'Gençlerin ve mahalle sakinlerinin akşam saatlerinde parkları güvenle kullanabilmesi için yenilenebilir enerji destekli aydınlatma ve oturma alanları kurulmasını teklif ediyorum.',
    author: 'Aysel Yılmaz',
    authorTitle: 'Mahalle Sakini / Mimar',
    category: 'Çevre & Enerji',
    status: 'oylamada',
    votes: 342,
    commentsCount: 48,
    createdAt: '2 gün önce',
    hasVoted: false
  },
  {
    id: '2',
    title: 'Hafta Sonu Bisiklet Rotalarında Güvenli Şerit Genişletmesi',
    summary: 'Ana arter üzerindeki bisiklet yollarının fiziki bariyerlerle ayrılması ve hafta sonları yoğun kullanılan hatlarda genişletme çalışması yapılması.',
    author: 'Caner Tekin',
    authorTitle: 'Bisiklet Topluluğu Sözcüsü',
    category: 'Ulaşım & Altyapı',
    status: 'mecliste',
    votes: 890,
    commentsCount: 112,
    createdAt: '5 gün önce',
    hasVoted: true
  },
  {
    id: '3',
    title: 'Eski Depo Binasının "Kültür ve Gençlik Sanat Evi" Olarak Yenilenmesi',
    summary: 'Atıl durumda bulunan tarihi semt deposunun sergi, atölye ve gençlik tiyatrosu alanı olarak kente kazandırılması hakkında.',
    author: 'Zeynep Kaya',
    authorTitle: 'Öğrenci',
    category: 'Kültür & Sanat',
    status: 'kabul-edildi',
    votes: 1250,
    commentsCount: 186,
    createdAt: '1 hafta önce',
    hasVoted: true
  },
  {
    id: '4',
    title: 'Yerel Üretici Pazarlarının Dijital Harita Üzerinde Canlı Takibi',
    summary: 'Semt pazarlarında taze ve doğrudan üretici ürünlerine ulaşımı kolaylaştırmak adına mahalle bazlı semt pazarları uygulaması geliştirilsin.',
    author: 'Murat Demir',
    authorTitle: 'Yazılım Geliştirici',
    category: 'Akıllı Şehir',
    status: 'incelemede',
    votes: 215,
    commentsCount: 29,
    createdAt: '3 gün önce',
    hasVoted: false
  }
];

const CATEGORIES = [
  'Tümü',
  'Çevre & Enerji',
  'Ulaşım & Altyapı',
  'Kültür & Sanat',
  'Akıllı Şehir',
  'Sosyal Hizmetler',
  'Eğitim & Gençlik'
];

export default function KatilimKursusuPage() {
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[1]);
  const [newSummary, setNewSummary] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  const handleVote = (id: string) => {
    setTopics(prev =>
      prev.map(item => {
        if (item.id === id) {
          const hasVoted = item.hasVoted;
          return {
            ...item,
            votes: hasVoted ? item.votes - 1 : item.votes + 1,
            hasVoted: !hasVoted
          };
        }
        return item;
      })
    );
  };

  const handleBookmark = (id: string) => {
    setTopics(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, hasBookmarked: !item.hasBookmarked };
        }
        return item;
      })
    );
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSummary) return;

    const created: Topic = {
      id: Date.now().toString(),
      title: newTitle,
      summary: newSummary,
      author: newAuthor || 'Anonim Yurttaş',
      authorTitle: 'Kürsüm Sakini',
      category: newCategory,
      status: 'incelemede',
      votes: 1,
      commentsCount: 0,
      createdAt: 'Şimdi',
      hasVoted: true
    };

    setTopics([created, ...topics]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewSummary('');
    setNewAuthor('');
  };

  const filteredTopics = topics
    .filter(topic => {
      const matchesCat = selectedCategory === 'Tümü' || topic.category === selectedCategory;
      const matchesSearch =
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.votes - a.votes;
      return 0; // Default order
    });

  const getStatusBadge = (status: Topic['status']) => {
    switch (status) {
      case 'oylamada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Oylamada
          </span>
        );
      case 'incelemede':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" /> İncelemede
          </span>
        );
      case 'mecliste':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <TrendingUp className="w-3.5 h-3.5" /> Meclis Gündeminde
          </span>
        );
      case 'kabul-edildi':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Kabul Edildi
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium mb-4 backdrop-blur-md">
                <Award className="w-4 h-4 text-indigo-400" /> Katılımcı Demokrasi Platformu
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Katılım Kürsüsü
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                Şehriniz, mahalleniz ve topluluğunuz için fikirlerinizi özgürce paylaşın.
                Topluluk desteği alan teklifler meclis gündemine taşınsın, kararları birlikte alalım.
              </p>
              
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" /> Kürsüde Söz Al
                </button>
                <a
                  href="#nasil-calisir"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 backdrop-blur-md transition-all"
                >
                  Süreç Nasıl İşler?
                </a>
              </div>
            </div>

            {/* Platform Quick Stats */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md text-center">
                <span className="block text-2xl font-bold text-indigo-400">2,840+</span>
                <span className="text-xs text-slate-300">Aktif Katılımcı</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md text-center">
                <span className="block text-2xl font-bold text-emerald-400">142</span>
                <span className="text-xs text-slate-300">Kabul Edilen Teklif</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md text-center">
                <span className="block text-2xl font-bold text-amber-400">18,5k</span>
                <span className="text-xs text-slate-300">Kullanılan Oy</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md text-center">
                <span className="block text-2xl font-bold text-purple-400">24</span>
                <span className="text-xs text-slate-300">Meclis Gündeminde</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Kürsüdeki teklifler ve fikirlerde ara..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                    <button
                      onClick={() => setSortBy('popular')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        sortBy === 'popular'
                          ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Popüler
                    </button>
                    <button
                      onClick={() => setSortBy('recent')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        sortBy === 'recent'
                          ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      En Yeni
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all font-medium ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Cards List */}
            <div className="space-y-4">
              {filteredTopics.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">
                    Sonuç Bulunamadı
                  </h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                    Arama kriterlerinize veya seçtiğiniz kategoriye uygun kürsü konuşması bulunamadı.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('Tümü');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-xl hover:bg-indigo-100"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              ) : (
                filteredTopics.map(topic => (
                  <article
                    key={topic.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(topic.status)}
                        <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                          {topic.category}
                        </span>
                      </div>

                      <button
                        onClick={() => handleBookmark(topic.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          topic.hasBookmarked
                            ? 'text-indigo-600 bg-indigo-50'
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                        aria-label="Kaydet"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
                      {topic.title}
                    </h2>

                    <p className="text-slate-600 text-sm leading-relaxed mb-5">
                      {topic.summary}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                          {topic.author.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {topic.author}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {topic.authorTitle} • {topic.createdAt}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                          <MessageCircle className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{topic.commentsCount} Yorum</span>
                        </div>

                        <button
                          onClick={() => handleVote(topic.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            topic.hasVoted
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                              : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${topic.hasVoted ? 'fill-current' : ''}`} />
                          <span>{topic.votes} Destek</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <aside className="space-y-6">
            
            {/* How it Works Widget */}
            <div id="nasil-calisir" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Süreç Nasıl İşler?
              </h3>
              
              <ol className="relative border-l border-slate-200 ml-3 space-y-6 text-xs">
                <li className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-indigo-600 border border-white" />
                  <h4 className="font-bold text-slate-800 text-sm">1. Fikrini Kürsüye Taşı</h4>
                  <p className="text-slate-500 mt-1">
                    Şehrin veya topluluğun için iyileştirme önerini net bir dille ifade et.
                  </p>
                </li>
                
                <li className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-indigo-400 border border-white" />
                  <h4 className="font-bold text-slate-800 text-sm">2. Destek Topla</h4>
                  <p className="text-slate-500 mt-1">
                    Oylamaya sunulan fikrini sosyal mecrada paylaş, yurttaşların desteğini al.
                  </p>
                </li>

                <li className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-amber-400 border border-white" />
                  <h4 className="font-bold text-slate-800 text-sm">3. Meclis Değerlendirmesi</h4>
                  <p className="text-slate-500 mt-1">
                    Belirlenen oy eşiğini aşan teklifler komisyon ve meclis gündemine alınır.
                  </p>
                </li>

                <li className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                  <h4 className="font-bold text-slate-800 text-sm">4. Çözüm ve Uygulama</h4>
                  <p className="text-slate-500 mt-1">
                    Kabul edilen projelerin bütçelenmesi ve hayata geçirilmesi şeffafça izlenir.
                  </p>
                </li>
              </ol>
            </div>

            {/* Featured Speaker / Idea of the Week */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-300 block mb-2">
                Haftanın Öne Çıkan Fikri
              </span>
              <h4 className="font-bold text-base mb-2 text-white leading-snug">
                "Mahalle Parklarına Güneş Enerjili Şarj İstasyonları"
              </h4>
              <p className="text-xs text-slate-300 mb-4 line-clamp-3">
                Topluluk desteğiyle 340+ oya ulaşan bu teklif bu hafta belediye komisyon incelemesine iletildi.
              </p>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10">
                <span className="text-indigo-200">Aysel Yılmaz</span>
                <span className="text-emerald-400 font-semibold">%88 Olumlu Oy</span>
              </div>
            </div>

            {/* Platform Principles Rules */}
            <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm mb-1">
                Kürsü İlkeleri
              </h4>
              <p>• Saygılı, yapıcı ve kamu yararını gözeten bir dil kullanılmalıdır.</p>
              <p>• Yanıltıcı bilgi ve kişisel verileri ihlal eden paylaşımlar onaylanmaz.</p>
              <p>• Her yurttaş bir konuya yalnızca tek bir destek oyu verebilir.</p>
            </div>

          </aside>
        </div>
      </main>

      {/* New Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Kürsüde Söz Al
                  </h3>
                  <p className="text-xs text-slate-500">
                    Teklifini topluluğun ve yönetimin dikkatine sun
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adınız ve Unvanınız
                </label>
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz - Mahalle Sakini"
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.filter(c => c !== 'Tümü').map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teklif / Konu Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Park Alanına Çocuk Oyun Parkuru Eklenmesi"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Açıklama ve Detaylar *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Fikrinizi, kamuya faydasını ve çözüm önerinizi detaylandırın..."
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Konuyu Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```eof

`app/katilim-kursusu/page.tsx` sayfanız oluşturuldu!

**Bu Sayfada Neler Var?**
* **Hero ve İstatistikler:** Kullanıcıyı karşılayan katılımcı demokrasi mottosu ve genel platform metrikleri.
* **Filtreleme & Arama:** Kategori bazlı sekme filtreleri, arama çubuğu ve popüler/en yeni sıralama seçeneği.
* **Oy Verme & Etkileşim:** Konu kartları üzerinde anlık oy verme, destek sayacını güncelleme ve kaydetme (bookmark) özellikleri.
* **Durum Rozetleri:** Konunun hangi aşamada olduğunu belirten etiketler (*Oylamada, İncelemede, Meclis Gündeminde, Kabul Edildi*).
* **Yeni Konu Ekleme Modalı:** Kullanıcıların kürsüye yeni bir öneri sunabilmesi için form modalı.
* **Yan Panel (Sidebar):** Katılım süreci adımları, haftanın öne çıkan fikri ve platform kuralları.