import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, Share2, Plus, Calendar, Trophy, Send, Users, Activity, Check, X, AlertCircle } from 'lucide-react';
import { sanitizeText, checkRateLimit } from '../lib/sanitize';
import type { CommunityPost, LeaderboardUser } from '../types';

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Sarah Green',
    avatar: 'SG',
    role: 'Eco Champion 🏆',
    timeAgo: '2h ago',
    content: 'Just completed my 30-day zero-waste challenge! Reduced household waste by 78% using composting, reusable bags, and bulk buying. The hardest part was giving up single-use coffee cups — but the reusable insulated mug has been amazing! 🌱',
    likes: 127,
    commentsCount: 23,
    comments: ['Incredible! What composting system do you use?', 'This inspires me to try the same. Any tips for beginners?'],
    hasLiked: false,
  },
  {
    id: 'post-2',
    author: 'Marcus Thompson',
    avatar: 'MT',
    role: 'Sustainability Activist',
    timeAgo: '5h ago',
    content: 'Switched to an electric bike last month for my 12km daily commute. The numbers: save ~1.4 kg CO₂ per day, £180 saved on fuel last month, and I\'m arriving at work more energized. If you\'re on the fence about e-bikes — do it! 🚴‍♂️⚡',
    likes: 89,
    commentsCount: 14,
    comments: ['Which brand did you go with?', 'Game changer! I made the switch 6 months ago and will never go back.'],
    hasLiked: false,
  },
];

const LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Sarah Green', score: '2,350 pts', avatar: 'SG', change: 'up' },
  { rank: 2, name: 'Alex Turner', score: '1,980 pts', avatar: 'AT', change: 'same' },
  { rank: 3, name: 'EcoLife Team', score: '1,720 pts', avatar: 'EL', change: 'up' },
  { rank: 4, name: 'NatureLover', score: '1,450 pts', avatar: 'NL', change: 'down' },
];

const EVENTS = [
  { id: 1, title: 'Global Tree Reforestation Day', date: 'June 18, 2026', emoji: '🌳' },
  { id: 2, title: 'Home Energy Summit 2026', date: 'June 21, 2026', emoji: '⚡' },
  { id: 3, title: 'Plastic-Free July Kickoff', date: 'July 1, 2026', emoji: '♻️' },
];

const MAX_POST_LENGTH = 280;
const MAX_COMMENT_LENGTH = 200;

export default function CommunitySection() {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState<string>('');
  const [postError, setPostError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'Feed' | 'Challenges' | 'Leaderboard'>('Feed');
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const handleCreatePost = () => {
    const sanitized = sanitizeText(newPostText.trim(), MAX_POST_LENGTH);
    if (!sanitized || sanitized.length < 5) {
      setPostError('Please write at least 5 characters.');
      return;
    }

    // Rate limit: max 3 posts per minute
    if (!checkRateLimit('community-post', 3, 60000)) {
      setPostError('You\'re posting too quickly. Please wait a moment.');
      return;
    }

    setPostError('');
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: 'You',
      avatar: 'ME',
      role: 'CarbonWise Member',
      timeAgo: 'Just now',
      content: sanitized,
      likes: 0,
      commentsCount: 0,
      comments: [],
      hasLiked: false,
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostText('');
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: p.hasLiked ? p.likes - 1 : p.likes + 1, hasLiked: !p.hasLiked }
          : p,
      ),
    );
  };

  const handleAddComment = (postId: string) => {
    const sanitized = sanitizeText(newCommentText.trim(), MAX_COMMENT_LENGTH);
    if (!sanitized || sanitized.length < 2) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, sanitized], commentsCount: p.commentsCount + 1 }
          : p,
      ),
    );
    setNewCommentText('');
    setCommentingPostId(null);
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}?post=${postId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard unavailable — silently ignore
    }
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const TABS: Array<{ id: typeof activeTab; icon: React.ElementType }> = [
    { id: 'Feed', icon: Activity },
    { id: 'Challenges', icon: Trophy },
    { id: 'Leaderboard', icon: Trophy },
  ];

  return (
    <section
      id="community-section"
      className="relative py-24 bg-gradient-to-b from-[#f3f7f5] via-white to-[#f4f8f6] text-[#0f291e]"
      aria-label="Community Hub"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-mono text-primary-green tracking-widest uppercase mb-3 block font-bold">COMMUNITY HUB</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0f291e] tracking-tight leading-tight">
            Together We Grow <span className="text-primary-green">Stronger</span>
          </h1>
          <p className="mt-3 text-gray-500 font-semibold text-sm">
            Share actions, celebrate wins, and inspire others. A greener world is a collective achievement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Main column */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Tab bar */}
            <div className="flex gap-2 border-b border-gray-100" role="tablist" aria-label="Community sections">
              {['Feed', 'Challenges', 'Leaderboard'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-primary-green text-primary-green'
                        : 'border-transparent text-gray-400 hover:text-[#0f291e]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* ── FEED ──────────────────────────────────────────────────── */}
            {activeTab === 'Feed' && (
              <div className="flex flex-col gap-5">
                {/* Create post */}
                <div className="p-5 rounded-2xl bg-white border border-gray-150 shadow-sm">
                  <label htmlFor="new-post-input" className="sr-only">
                    Write a community post (max {MAX_POST_LENGTH} characters)
                  </label>
                  <textarea
                    id="new-post-input"
                    value={newPostText}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_POST_LENGTH) {
                        setNewPostText(e.target.value);
                        setPostError('');
                      }
                    }}
                    placeholder="Share a green action, tip, or milestone…"
                    rows={3}
                    maxLength={MAX_POST_LENGTH}
                    aria-describedby="post-char-count post-error"
                    aria-invalid={!!postError}
                    className="w-full bg-[#f8fbf9] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0f291e] placeholder-gray-400 focus:outline-none focus:border-primary-green resize-none font-semibold transition-colors"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      {postError && (
                        <p id="post-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          {postError}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      <span
                        id="post-char-count"
                        className={`text-[10px] font-mono font-bold ${newPostText.length > MAX_POST_LENGTH * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}
                        aria-live="polite"
                      >
                        {newPostText.length}/{MAX_POST_LENGTH}
                      </span>
                      <button
                        type="button"
                        onClick={handleCreatePost}
                        disabled={!newPostText.trim()}
                        aria-disabled={!newPostText.trim()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-green hover:bg-secondary-green text-white font-bold text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        Post
                      </button>
                    </div>
                  </div>
                </div>

                {/* Posts feed */}
                {posts.map((post) => (
                  <motion.article
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-white border border-gray-150 shadow-sm text-left"
                    aria-label={`Post by ${post.author}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-green to-accent-green text-white text-sm font-black flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        {post.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-[#0f291e]">{post.author}</div>
                        <div className="text-[10px] text-gray-400 font-semibold">{post.role} · {post.timeAgo}</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">{post.content}</p>

                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                      <button
                        type="button"
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer ${post.hasLiked ? 'text-red-500' : ''}`}
                        aria-label={`${post.hasLiked ? 'Unlike' : 'Like'} this post — ${post.likes} likes`}
                        aria-pressed={post.hasLiked}
                      >
                        <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-red-500 text-red-500' : ''}`} aria-hidden="true" />
                        <span>{post.likes}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                        className="flex items-center gap-1.5 hover:text-primary-green transition-colors cursor-pointer"
                        aria-label={`Comment on this post — ${post.commentsCount} comments`}
                        aria-expanded={commentingPostId === post.id}
                      >
                        <MessageSquare className="w-4 h-4" aria-hidden="true" />
                        <span>{post.commentsCount}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(post.id)}
                        className="flex items-center gap-1.5 hover:text-primary-green transition-colors cursor-pointer"
                        aria-label={copiedPostId === post.id ? 'Link copied!' : 'Share this post'}
                      >
                        {copiedPostId === post.id ? (
                          <><Check className="w-4 h-4 text-primary-green" aria-hidden="true" /><span className="text-primary-green">Copied!</span></>
                        ) : (
                          <><Share2 className="w-4 h-4" aria-hidden="true" /><span>Share</span></>
                        )}
                      </button>
                    </div>

                    {/* Comments */}
                    {post.comments.length > 0 && (
                      <div className="mt-4 flex flex-col gap-2 pl-4 border-l-2 border-gray-100" role="list" aria-label={`Comments on ${post.author}'s post`}>
                        {post.comments.map((comment, i) => (
                          <div key={i} role="listitem" className="text-xs text-gray-500 font-medium bg-[#f8fbf9] rounded-lg px-3 py-2 border border-gray-100">
                            {comment}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment input */}
                    <AnimatePresence>
                      {commentingPostId === post.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-2 mt-4">
                            <label htmlFor={`comment-${post.id}`} className="sr-only">
                              Add a comment (max {MAX_COMMENT_LENGTH} characters)
                            </label>
                            <input
                              id={`comment-${post.id}`}
                              type="text"
                              value={newCommentText}
                              onChange={(e) => {
                                if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                                  setNewCommentText(e.target.value);
                                }
                              }}
                              placeholder="Add a comment…"
                              maxLength={MAX_COMMENT_LENGTH}
                              className="flex-1 bg-[#f8fbf9] border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary-green transition-colors"
                            />
                            <span className="text-[10px] font-mono text-gray-400 font-bold self-center">
                              {newCommentText.length}/{MAX_COMMENT_LENGTH}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddComment(post.id)}
                              disabled={!newCommentText.trim()}
                              aria-label="Submit comment"
                              className="p-2.5 rounded-xl bg-primary-green text-white hover:bg-secondary-green transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setCommentingPostId(null); setNewCommentText(''); }}
                              aria-label="Cancel comment"
                              className="p-2.5 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                ))}
              </div>
            )}

            {/* ── CHALLENGES ────────────────────────────────────────────── */}
            {activeTab === 'Challenges' && (
              <div className="flex flex-col gap-4" role="tabpanel" aria-label="Community Challenges">
                {[
                  { title: 'Zero-Waste Week', desc: 'Produce zero landfill waste for 7 consecutive days. Share your daily progress!', xp: 300, category: 'Lifestyle', participants: 1247 },
                  { title: 'Plant-Based Pledge', desc: 'Eat entirely plant-based for 5 days in a row and document your meals.', xp: 200, category: 'Food', participants: 892 },
                  { title: 'Car-Free Commuting', desc: 'Use only public transport or active travel for your daily commute for one week.', xp: 250, category: 'Transport', participants: 567 },
                ].map((ch, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white border border-gray-150 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-primary-green bg-green-50 border border-green-150 px-2 py-0.5 rounded">
                          {ch.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-gray-400 flex items-center gap-1">
                          <Users className="w-3 h-3" aria-hidden="true" />
                          {ch.participants.toLocaleString()} joined
                        </span>
                      </div>
                      <h2 className="font-display font-bold text-base text-[#0f291e]">{ch.title}</h2>
                      <p className="text-xs text-gray-400 font-semibold mt-1 leading-relaxed">{ch.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs font-mono font-black text-primary-green">+{ch.xp} XP</span>
                      <button
                        type="button"
                        className="px-5 py-2.5 rounded-xl bg-primary-green hover:bg-secondary-green text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
                        aria-label={`Join ${ch.title} challenge`}
                      >
                        Join Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── LEADERBOARD ───────────────────────────────────────────── */}
            {activeTab === 'Leaderboard' && (
              <div className="flex flex-col gap-3" role="tabpanel" aria-label="Community Leaderboard">
                <p className="text-xs text-gray-400 font-semibold">Top contributors by eco-actions this month.</p>
                <ol className="flex flex-col gap-3">
                  {LEADERBOARD.map((user) => (
                    <li key={user.rank} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-150 shadow-sm">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' : user.rank === 2 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}>
                        {user.rank}
                      </span>
                      <div
                        className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-green to-accent-green text-white text-xs font-black flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-[#0f291e]">{user.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono font-bold">{user.score}</div>
                      </div>
                      {user.change === 'up' && <span className="text-[10px] font-bold text-green-500" aria-label="rank improved">▲</span>}
                      {user.change === 'down' && <span className="text-[10px] font-bold text-red-400" aria-label="rank dropped">▼</span>}
                      {user.change === 'same' && <span className="text-[10px] font-bold text-gray-400" aria-label="rank unchanged">—</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-6" aria-label="Community highlights">

            {/* Top contributors */}
            <div className="p-5 rounded-2xl bg-white border border-gray-150 shadow-sm">
              <h2 className="font-display font-extrabold text-sm text-[#0f291e] mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Trophy className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                Top Contributors
              </h2>
              <ul className="flex flex-col gap-3">
                {LEADERBOARD.map((user) => (
                  <li key={user.rank} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-green to-accent-green text-white text-[10px] font-black flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#0f291e]">{user.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono font-bold">{user.score}</div>
                    </div>
                    <span className="text-[10px] font-bold text-primary-green font-mono">#{user.rank}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Upcoming events */}
            <div className="p-5 rounded-2xl bg-white border border-gray-150 shadow-sm">
              <h2 className="font-display font-extrabold text-sm text-[#0f291e] mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-primary-green" aria-hidden="true" />
                Upcoming Events
              </h2>
              <ul className="flex flex-col gap-3">
                {EVENTS.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{ev.emoji}</span>
                    <div>
                      <div className="text-xs font-bold text-[#0f291e]">{ev.title}</div>
                      <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        <time>{ev.date}</time>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
