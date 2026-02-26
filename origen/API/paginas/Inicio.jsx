import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { BookOpen, Brain, Trophy, Flame, ChevronRight, Sparkles, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SemesterCard from '@/components/semester/SemesterCard';
import XPBadge from '@/components/common/XPBadge';
import StreakBadge from '@/components/common/StreakBadge';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => base44.entities.Semester.list('number'),
  });

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const progress = userProgress?.[0] || {
    total_xp: 0,
    current_semester: 1,
    completed_semesters: [],
    completed_modules: [],
    streak_days: 0
  };

  const getSemesterProgress = (semester) => {
    if (!semester.modules?.length) return 0;
    const completedModules = progress.completed_modules?.filter(id => 
      semester.modules.includes(id)
    ).length || 0;
    return (completedModules / semester.modules.length) * 100;
  };

  const isSemesterUnlocked = (semester) => {
    if (semester.number === 1) return true;
    return progress.completed_semesters?.includes(semester.number - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920')] 
          opacity-10 bg-cover bg-center" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full 
              px-4 py-2 mb-6">
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm font-medium">Tu carrera de psicología</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Aprende Psicología<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                Como un Profesional
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              8 semestres de contenido universitario. Aprende con IA, juegos interactivos 
              y casos de estudio reales.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <XPBadge xp={progress.total_xp} size="lg" />
              {progress.streak_days > 0 && <StreakBadge days={progress.streak_days} />}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-amber-300" />
                <div className="text-2xl font-bold">{progress.completed_modules?.length || 0}</div>
                <div className="text-xs text-white/70">Módulos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <Brain className="w-6 h-6 mx-auto mb-2 text-emerald-300" />
                <div className="text-2xl font-bold">{progress.completed_semesters?.length || 0}/8</div>
                <div className="text-xs text-white/70">Semestres</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-violet-300" />
                <div className="text-2xl font-bold">{progress.badges?.length || 0}</div>
                <div className="text-xs text-white/70">Badges</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Semesters Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Tu Carrera</h2>
            <p className="text-slate-500 mt-1">Completa los 8 semestres para graduarte</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl('Progress'))}
            className="hidden md:flex gap-2"
          >
            Ver Progreso
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {semesters.map((semester, idx) => (
            <motion.div
              key={semester.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <SemesterCard
                semester={semester}
                progress={getSemesterProgress(semester)}
                isUnlocked={isSemesterUnlocked(semester)}
                isCompleted={progress.completed_semesters?.includes(semester.number)}
                onClick={() => navigate(createPageUrl(`Semester?id=${semester.id}`))}
              />
            </motion.div>
          ))}
        </div>

        {semesters.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Cargando tu carrera...</h3>
            <p className="text-slate-500">Preparando los semestres y contenido</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Aprende de manera inteligente</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Nuestra plataforma combina lo mejor de la educación tradicional con tecnología moderna
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tutor IA</h3>
              <p className="text-slate-400">
                Un asistente inteligente disponible 24/7 para resolver tus dudas y personalizar tu aprendizaje
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Casos Reales</h3>
              <p className="text-slate-400">
                Practica con simulaciones de sesiones terapéuticas y casos clínicos basados en la realidad
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gamificación</h3>
              <p className="text-slate-400">
                Gana XP, desbloquea badges y compite mientras aprendes de manera divertida
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}