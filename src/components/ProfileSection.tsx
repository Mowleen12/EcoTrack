import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, ShieldCheck, Footprints, Flame, TreePine, X, Check, CheckCircle2, Target, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import SustainabilityScoreCard from './SustainabilityScoreCard';
import { sanitizeText, validateDisplayName } from '../lib/sanitize';
import type { BadgeItem } from '../types';

export default function ProfileSection() {
  const { userName, userAvatar, userCreatedAt, calculatorResult, sustainabilityScore, userGoals, updateUserName } = useAppContext();

  const [profileName, setProfileName] = useState<string>(userName);

  // Keep profileName in sync when Google/OAuth name arrives asynchronously
  useEffect(() => {
    setProfileName(userName);
  }, [userName]);
  const [profileBio, setProfileBio] = useState<string>('Eco Enthusiast & Climate Change Activist');
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(profileName);
  const [tempBio, setTempBio] = useState<string>(profileBio);
  const [nameError, setNameError] = useState<string>('');
  const [bioError, setBioError] = useState<string>('');

  const totalTonnes = calculatorResult?.totalTonnes ?? null;

  // CO₂ Saved: reduction vs global average (4.5 t/yr) when footprint exists, else 0
  const GLOBAL_AVG_TONNES = 4.5;
  const co2SavedKg = totalTonnes !== null
    ? Math.max(0, Math.round((GLOBAL_AVG_TONNES - totalTonnes) * 1000))
    : 0;

  // Format the real account join date
  const memberSince = userCreatedAt
    ? new Date(userCreatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  // Dynamic badge unlocking based on real data
  const badgesList: BadgeItem[] = [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Completed your first carbon footprint calculation audit.',
      unlocked: calculatorResult !== null,
      iconName: 'footprint',
      unlockedAt: calculatorResult?.calculatedAt,
    },
    {
      id: 'tree-planter',
      title: 'Tree Planter',
      description: 'Planted over 15 certified virtual reforestation sprouts.',
      unlocked: true,
      iconName: 'tree',
    },
    {
      id: 'transit-hero',
      title: 'Public Transport Hero',
      description: 'Used city transport or bicycle to commute for 10 consecutive days.',
      unlocked: true,
      iconName: 'transit',
    },
    {
      id: 'eco-champion',
      title: 'Eco Champion',
      description: 'Achieved a Sustainability Score of 75+ (Sustainable tier).',
      unlocked: (sustainabilityScore?.score ?? 0) >= 75,
      iconName: 'shield',
    },
    {
      id: 'goal-setter',
      title: 'Goal Setter',
      description: 'Created your first sustainability goal during onboarding.',
      unlocked: userGoals.length > 0,
      iconName: 'target',
    },
    {
      id: 'net-zero-seeker',
      title: 'Net Zero Seeker',
      description: 'Kept your annual footprint below 2.0 t CO₂ — the 1.5°C pathway target.',
      unlocked: totalTonnes !== null && totalTonnes < 2.0,
      iconName: 'leaf',
    },
  ];

  const unlockedCount = badgesList.filter((b) => b.unlocked).length;

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();

    const nameValidation = validateDisplayName(tempName);
    if (!nameValidation.valid) {
      setNameError(nameValidation.message);
      return;
    }

    if (tempBio.trim().length > 120) {
      setBioError('Bio must be under 120 characters.');
      return;
    }

    const safeName = sanitizeText(tempName, 60);
    const safeBio = sanitizeText(tempBio, 120);

    setProfileName(safeName);
    setProfileBio(safeBio);
    updateUserName(safeName); // also updates context userName
    setIsEditOpen(false);
    setNameError('');
    setBioError('');
  };

  const getBadgeIcon = (iconName: string, unlocked: boolean) => {
    const cls = `w-7 h-7 ${unlocked ? 'opacity-100 text-primary-green' : 'opacity-35 text-gray-400'}`;
    switch (iconName) {
      case 'footprint': return <Footprints className={cls} />;
      case 'tree': return <TreePine className={cls} />;
      case 'transit': return <Flame className={cls} />;
      case 'target': return <Target className={cls} />;
      case 'leaf': return <TrendingUp className={cls} />;
      default: return <ShieldCheck className={cls} />;
    }
  };

  return (
    <section
      id="profile-section"
      className="relative py-24 bg-gradient-to-b from-[#f3f7f5] via-white to-[#f4f8f6] text-[#0f291e] text-left"
      aria-label="User Profile"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Profile Card */}
          <div className="lg:col-span-4 rounded-3xl bg-white border border-gray-150 p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/5 rounded-full filter blur-3xl pointer-events-none" />

            <img
              src={
                userAvatar
                  ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=d1fae5&color=166534&size=140&bold=true`
              }
              alt={`${profileName} profile avatar`}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover border-4 border-green-50 shadow-md mb-4"
            />

            <h1 className="font-display font-extrabold text-xl text-[#0f291e] flex items-center gap-1.5 justify-center leading-none">
              {profileName}
              <CheckCircle2 className="w-5 h-5 text-primary-green fill-green-50" aria-label="Verified member" />
            </h1>

            <p className="text-xs text-gray-500 font-bold mt-1.5 italic">{profileBio}</p>

            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#15803d] bg-green-50 border border-green-100 px-2.5 py-1 rounded-md mt-4">
              {memberSince ? `Member Since ${memberSince}` : 'New Member'}
            </span>

            {/* Eco Score badge */}
            {sustainabilityScore && (
              <div className={`mt-3 px-3 py-1.5 rounded-full text-xs font-bold border ${
                sustainabilityScore.score >= 75
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : sustainabilityScore.score >= 50
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : sustainabilityScore.score >= 25
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                🌿 {sustainabilityScore.label} — {sustainabilityScore.score}/100
              </div>
            )}

            <button
              onClick={() => {
                setTempName(profileName);
                setTempBio(profileBio);
                setNameError('');
                setBioError('');
                setIsEditOpen(true);
              }}
              className="w-full mt-6 py-2.5 rounded-xl border border-gray-200 hover:border-primary-green hover:bg-green-50/50 text-xs font-bold text-gray-600 hover:text-primary-green transition-all cursor-pointer"
              aria-label="Edit your profile"
            >
              Edit Profile
            </button>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-8 flex flex-col gap-8 text-left">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Footprint',
                  value: totalTonnes !== null ? `${totalTonnes}` : '—',
                  unit: totalTonnes !== null ? 't/yr' : 'Calculate',
                  color: 'text-[#0f291e]',
                },
                {
                  label: 'CO₂ Saved',
                  value: co2SavedKg > 0 ? String(co2SavedKg) : '0',
                  unit: co2SavedKg > 0 ? 'kg' : 'kg',
                  color: co2SavedKg > 0 ? 'text-primary-green' : 'text-gray-300',
                },
                {
                  label: 'Trees Planted',
                  value: '0',
                  unit: 'sprouts',
                  color: 'text-gray-300',
                },
                { label: 'Badges', value: String(unlockedCount), unit: `/ ${badgesList.length}`, color: 'text-emerald-600' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl bg-white border border-gray-100 text-left shadow-sm">
                  <div className="text-[10px] uppercase font-mono text-gray-400 font-extrabold">{stat.label}</div>
                  <div className={`text-2xl font-black font-display ${stat.color} mt-1`}>
                    {stat.value} <span className="text-xs font-bold text-gray-400 uppercase font-sans">{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sustainability score card */}
            {sustainabilityScore && <SustainabilityScoreCard score={sustainabilityScore} />}

            {/* Goal progress */}
            {userGoals.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <h2 className="font-display font-extrabold text-sm uppercase tracking-wide text-[#0f291e] mb-4 flex items-center gap-2">
                  <Target className="w-4.5 h-4.5 text-primary-green" aria-hidden="true" />
                  Your Sustainability Goals
                </h2>
                {userGoals.map((goal) => {
                  const pct = Math.min(100, Math.max(0,
                    goal.targetTonnes === 0
                      ? Math.round((1 - goal.currentTonnes / 4.5) * 100)
                      : Math.round((1 - (goal.currentTonnes - goal.targetTonnes) / 4.5) * 100),
                  ));
                  return (
                    <div key={goal.id} className="mb-4 last:mb-0">
                      <div className="flex justify-between text-xs font-bold text-[#0f291e] mb-1.5">
                        <span>{goal.label}</span>
                        <span className="text-primary-green">{pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary-green rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Goal progress: ${pct}%`}
                        />
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono font-bold mt-1">Focus: {goal.primaryFocus}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Badges */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <h2 className="font-display font-extrabold text-sm uppercase tracking-wide text-[#0f291e] mb-6 flex items-center gap-2">
                <Award className="w-5.5 h-5.5 text-yellow-500" aria-hidden="true" />
                Achievements
                <span className="text-[10px] font-mono text-gray-400 ml-1">({unlockedCount}/{badgesList.length} unlocked)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
                {badgesList.map((badge) => (
                  <div
                    key={badge.id}
                    role="listitem"
                    aria-label={`${badge.title}: ${badge.unlocked ? 'Unlocked' : 'Locked'}`}
                    className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                      badge.unlocked
                        ? 'bg-[#f8fbf9] border-emerald-100 hover:border-emerald-200'
                        : 'bg-gray-50/50 border-gray-100 opacity-50'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 border border-gray-100 shadow-sm">
                      {getBadgeIcon(badge.iconName, badge.unlocked)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-extrabold text-sm text-[#0f291e] flex items-center gap-1.5 leading-none">
                        {badge.title}
                        {badge.unlocked && <Check className="w-4 h-4 text-primary-green shrink-0" aria-hidden="true" />}
                      </h3>
                      <p className="text-[11px] font-semibold text-gray-400 mt-1.5 leading-relaxed">{badge.description}</p>
                      {badge.unlocked && badge.unlockedAt && (
                        <p className="text-[10px] text-primary-green font-mono font-bold mt-1">
                          Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditOpen && (
            <div
              className="fixed inset-0 bg-[#0f291e]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-profile-title"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl bg-white border border-gray-150 p-6 relative shadow-xl text-left text-[#0f291e]"
              >
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#0f291e] transition-colors cursor-pointer"
                  aria-label="Close edit profile dialog"
                >
                  <X className="w-4.5 h-4.5" aria-hidden="true" />
                </button>

                <h2 id="edit-profile-title" className="font-display font-extrabold text-lg text-[#0f291e] mb-6">
                  Edit Profile
                </h2>

                <form onSubmit={handleEditSave} className="flex flex-col gap-4" noValidate>
                  <div>
                    <label
                      htmlFor="edit-name"
                      className="text-[10px] uppercase font-mono text-gray-400 font-extrabold tracking-widest block mb-1.5"
                    >
                      Full Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="edit-name"
                      type="text"
                      value={tempName}
                      onChange={(e) => {
                        setTempName(e.target.value);
                        setNameError('');
                      }}
                      maxLength={60}
                      required
                      aria-required="true"
                      aria-invalid={!!nameError}
                      aria-describedby={nameError ? 'name-error-msg' : undefined}
                      className={`w-full bg-[#f8fbf9] border rounded-xl px-4 py-3 text-sm text-[#0f291e] focus:outline-none font-semibold transition-colors ${
                        nameError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-green'
                      }`}
                    />
                    {nameError && (
                      <p id="name-error-msg" role="alert" className="text-xs text-red-500 font-semibold mt-1.5">
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="edit-bio"
                      className="text-[10px] uppercase font-mono text-gray-400 font-extrabold tracking-widest block mb-1.5"
                    >
                      Biography / Motto
                    </label>
                    <input
                      id="edit-bio"
                      type="text"
                      value={tempBio}
                      onChange={(e) => {
                        setTempBio(e.target.value);
                        setBioError('');
                      }}
                      maxLength={120}
                      aria-invalid={!!bioError}
                      aria-describedby={bioError ? 'bio-error-msg' : 'bio-char-count'}
                      className={`w-full bg-[#f8fbf9] border rounded-xl px-4 py-3 text-sm text-[#0f291e] focus:outline-none font-semibold transition-colors ${
                        bioError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-green'
                      }`}
                    />
                    <p id="bio-char-count" className="text-[10px] text-gray-400 font-mono mt-1 text-right">
                      {tempBio.length}/120
                    </p>
                    {bioError && (
                      <p id="bio-error-msg" role="alert" className="text-xs text-red-500 font-semibold mt-0.5">
                        {bioError}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(false)}
                      className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-primary-green text-white font-bold text-sm rounded-xl hover:bg-secondary-green transition-colors cursor-pointer shadow-sm"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
