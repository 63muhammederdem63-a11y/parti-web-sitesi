'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  Search,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  X,
  Award,
  Send,
  MessageCircle
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
      return 0;
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
      <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium mb-4">
                <Award className="w-4 h-4 text-indigo-400" /> Katılımcı Demokrasi Platformu
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Katılım Kürsüsü
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                Şehriniz ve topluluğunuz için fikirlerinizi özgürce paylaşın.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" /> Kürsüde Söz Al
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tekliflerde ara..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-2 rounded-xl transition-all font-medium ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredTopics.map(topic => (
                <article
                  key={topic.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(topic.status)}
                      <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                        {topic.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBookmark(topic.id)}
                      className={`p-1.5 rounded-lg ${
                        topic.hasBookmarked ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    {topic.title}
                  </h2>

                  <p className="text-slate-600 text-sm leading-relaxed mb-5">
                    {topic.summary}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{topic.author}</span>
                    <button
                      onClick={() => handleVote(topic.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                        topic.hasVoted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{topic.votes} Destek</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Kürsüde Söz Al</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <input
                type="text"
                placeholder="Adınız Soyadınız"
                value={newAuthor}
                onChange={e => setNewAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border text-sm"
              />
              <input
                type="text"
                required
                placeholder="Teklif Başlığı *"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border text-sm"
              />
              <textarea
                required
                rows={4}
                placeholder="Detaylar *"
                value={newSummary}
                onChange={e => setNewSummary(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border text-sm resize-none"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm"
              >
                Gönder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}