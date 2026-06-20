import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Compass, BookOpen, Film, HelpCircle, ArrowRight, User, Calendar, X } from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  category: 'Climate Change' | 'Sustainable Living' | 'Renewable Energy' | 'Green Technology';
  type: 'Article' | 'Guide' | 'Video' | 'Quiz';
  desc: string;
  author: string;
  date: string;
  readTime: string;
  body: string;
  imageUrl: string;
}

export default function LearnSection() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  const categories = ['All', 'Climate Change', 'Sustainable Living', 'Renewable Energy', 'Green Technology'];

  const articles: ArticleItem[] = [
    {
      id: 'reduce-offset-intro',
      title: '10 Easy Ways to Reduce Carbon Footprint',
      category: 'Sustainable Living',
      type: 'Guide',
      desc: 'Simple and practical micro-adjustments you can implement at home today to slash carbon output.',
      author: 'Marcus Green',
      date: 'May 18, 2026',
      readTime: '4 min read',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=300',
      body: 'Lowering your personal greenhouse impact doesnt require complete transformation. Focus on heating setbacks, localized grocery sourcing, LED light swaps, and active recycling. Swapping standard bulbs with Energy Star equivalents blocks over 100 kg of gas grid emissions yearly.',
    },
    {
      id: 'renewables-future',
      title: 'The Future of Renewable Energy',
      category: 'Renewable Energy',
      type: 'Article',
      desc: 'Exploring solar advancements, wind farms, and utility batteries scaling up worldwide.',
      author: 'Dr. Clara Vance',
      date: 'May 16, 2026',
      readTime: '6 min read',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=300',
      body: 'Decentralized electric grids are expanding at historic clip-rates. Solar panel efficiencies have exceeded 22% alongside next-gen sodium batteries, replacing outdated diesel stations and generating clean, localized municipal backup powers safely.',
    },
    {
      id: 'beginners-sustainable',
      title: 'Sustainable Living Guide for Beginners',
      category: 'Sustainable Living',
      type: 'Guide',
      desc: 'A comprehensive crash-course introducing green consumption, zero-waste, and vegan dining.',
      author: 'Elena Rostova',
      date: 'May 14, 2026',
      readTime: '8 min read',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300',
      body: 'Diving into zero-waste can feel overwhelming. Start humble by carrying canvas tote bags, refusing single-use bottled beverages, and choosing circular bamboo accessories. Small habitual shifts spark structural green industry demand.',
    },
    {
      id: 'trees-carbon-sequestration',
      title: 'Why Trees Are Our Best Friends',
      category: 'Climate Change',
      type: 'Article',
      desc: 'Understanding the biology of carbon sink sequestration and worldwide reforestation.',
      author: 'Alistair Wood',
      date: 'May 12, 2026',
      readTime: '5 min read',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=300',
      body: 'A single mature oak tree absorbs up to 22 kg of carbon dioxide from the atmosphere annually, storing it in roots and healthy garden soils. Intact forest ecosystems guard watersheds and preserve millions of endangered bird species.',
    },
    {
      id: 'ev-charging-revolution',
      title: 'Electric Vehicles vs. Public Trains',
      category: 'Green Technology',
      type: 'Video',
      desc: 'An analytic comparison of localized transit grids and zero GHG vehicle grids.',
      author: 'Tech-Audit Team',
      date: 'May 10, 2026',
      readTime: '4 min video',
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=300',
      body: 'Electric vehicle arrays are incredibly clean but still draw from generic coal electricity grids in some states. High-capacity suburban rail lines remain the absolute pinnacle of collective mass transit efficiency. Ideally, combine electric buses with bike lanes.',
    },
    {
      id: 'ecofriendly-home-design',
      title: 'Active Solar Home Insulations',
      category: 'Green Technology',
      type: 'Guide',
      desc: 'How building envelopes, triple-pane windows, and passive heat systems curb heating bills.',
      author: 'Sarah Chen',
      date: 'May 06, 2026',
      readTime: '7 min read',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300',
      body: 'Building energy loss represents roughly 40% of standard metropolitan emissions. Deploying active triple-glazing and high-performance cellulose insulation keeps thermal drafts out, eliminating boiler cycling rates during colder winter periods.',
    }
  ];

  // Filtering Logic
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getArticleTypeBadge = (type: string) => {
    switch (type) {
      case 'Guide':
        return <span className="bg-emerald-500/15 text-primary-green border border-primary-green/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono">Guide</span>;
      case 'Video':
        return <span className="bg-rose-500/15 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono">Video</span>;
      case 'Quiz':
        return <span className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono">Quiz</span>;
      default:
        return <span className="bg-white/5 text-emerald-200 border border-white/5 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono">Article</span>;
    }
  };

  return (
    <section id="learn-section" className="relative py-24 bg-gradient-to-b from-white via-[#f3f7f5] to-white text-[#0f291e] select-none text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-primary-green tracking-widest uppercase mb-3 block font-bold">RESOURCES & KNOWLEDGE</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#0f291e] tracking-tight leading-tight">
            Learn. <span className="text-primary-green">Inspire</span>. Act.
          </h2>
          <p className="mt-4 text-gray-500 font-semibold text-base">
            Explore guides, expert articles, and sustainability videos designed to arm you with green climate facts.
          </p>
        </div>

        {/* Search controls and Category Selector */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-[#e8efeb] p-4 rounded-[28px] border border-gray-100">
          {/* Quick Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-[#0f291e] placeholder-gray-400 focus:outline-none focus:border-primary-green transition-all shadow-xs"
            />
          </div>

          {/* Scrolling Categories on Mobile */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none snap-x select-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`snap-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-primary-green text-white font-extrabold shadow-sm'
                    : 'text-gray-500 hover:text-[#0f291e] hover:bg-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modern grid cards layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-2xl bg-white border border-gray-150 overflow-hidden flex flex-col justify-between hover:border-primary-green/25 transition-all hover:shadow-lg group text-left"
              >
                {/* Thumb Image placeholder with clean text overlay */}
                <div className="h-48 relative overflow-hidden select-none pointer-events-none">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    {getArticleTypeBadge(article.type)}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] font-mono text-primary-green font-bold tracking-wider bg-emerald-50/95 border border-green-150 px-2.5 py-0.5 rounded backdrop-blur">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold mb-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {article.author}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.date}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-[#0f291e] mb-2 leading-snug group-hover:text-primary-green transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-6">
                      {article.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-primary-green hover:text-emerald-700 transition-colors duration-200 cursor-pointer text-left mt-auto self-start"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredArticles.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-gray-400 font-semibold text-base">No matching articles found. Adjust your seek filters.</p>
            </div>
          )}
        </div>

        {/* Dynamic Modal Article Reader */}
        <AnimatePresence>
          {selectedArticle && (
            <div className="fixed inset-0 bg-black/55 backdrop-blur-md z-100 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl rounded-3xl bg-white border border-gray-250 my-8 overflow-hidden relative shadow-2xl text-left flex flex-col"
              >
                {/* Image header */}
                <div className="h-60 relative w-full select-none pointer-events-none">
                  <img
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                  
                  {/* Close button inside image header */}
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="absolute top-5 right-5 p-2 rounded-full bg-white/95 text-[#0f291e] hover:bg-white shadow-sm transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-6">
                    <span className="bg-primary-green text-white font-mono text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md">
                      {selectedArticle.category}
                    </span>
                  </div>
                </div>

                {/* Article body */}
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-bold mb-4">
                    <span className="font-semibold">{selectedArticle.author}</span>
                    <span>•</span>
                    <span>{selectedArticle.date}</span>
                    <span>•</span>
                    <span>{selectedArticle.readTime}</span>
                  </div>

                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#0f291e] mb-4 leading-tight">
                    {selectedArticle.title}
                  </h3>

                  <p className="text-base text-gray-650 leading-relaxed font-sans font-semibold mb-6 bg-gray-50 border border-gray-150 p-5 rounded-2xl">
                    {selectedArticle.body}
                  </p>

                  <p className="text-xs text-gray-450 font-bold leading-relaxed italic border-l-2 border-primary-green pl-4">
                    Educate your colleagues. The fastest way to spark global systemic reduction is by cascading practical, positive local habits into communal spaces.
                  </p>

                  <div className="h-px bg-gray-200 my-6" />

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary-green">EcoTrack Hub</span>
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="px-5 py-2.5 rounded-xl bg-primary-green text-white font-bold text-xs hover:bg-[#15803d] cursor-pointer"
                    >
                      Close Reader
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
