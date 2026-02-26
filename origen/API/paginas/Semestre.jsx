import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft, BookOpen, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModuleCard from '@/components/module/ModuleCard';
import XPBadge from '@/components/common/XPBadge';

export default function Semester() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const semesterId = urlParams.get('id');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: semester } = useQuery({
    queryKey: ['semester', semesterId],
    queryFn: async () => {
      const semesters = await base44.entities.Semester.filter({ id: semesterId });
      return semesters[0];
    },
    enabled: !!semesterId,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['modules', semesterId],
    queryFn: () => base44.entities.Module.filter({ semester_id: semesterId }, 'order'),
    enabled: !!semesterId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', semesterId],
    queryFn: async () => {
      const moduleIds = modules.map(m => m.id);
      const allLessons = await base44.entities.Lesson.list();
      return allLessons.filter(l => moduleIds.includes(l.module_id));
    },
    enabled: modules.length > 0,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const progress = userProgress?.[0] || {
    completed_lessons: [],
    completed_modules: []
  };

  const getModuleLessons = (moduleId) => lessons.filter(l => l.module_id === moduleId);
  
  const getModuleProgress = (moduleId) => {
    const moduleLessons = getModuleLessons(moduleId);
    if (!moduleLessons.length) return 0;
    const completed = moduleLessons.filter(l => 
      progress.completed_lessons?.includes(l.id)
    ).length;
    return (completed / moduleLessons.length) * 100;
  };

  const isModuleUnlocked = (module, idx) => {
    if (idx === 0) return true;
    const prevModule = modules[idx - 1];
    return progress.completed_modules?.includes(prevModule?.id);
  };

  const totalXP = modules.reduce((sum, m) => sum + (m.xp_reward || 0), 0);

  if (!semester) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{semester.icon || '📚'}</div>
              <div>
                <span className="text-sm font-medium text-white/70 uppercase tracking-wide">
                  Semestre {semester.number}
                </span>
                <h1 className="text-3xl font-bold mt-1">{semester.title}</h1>
                <p className="text-white/80 mt-2 max-w-xl">{semester.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">{modules.length} módulos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{lessons.length} lecciones</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Trophy className="w-4 h-4" />
                <span className="text-sm">{totalXP} XP total</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modules */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Módulos del Semestre</h2>

        <div className="space-y-4">
          {modules.map((module, idx) => {
            const moduleLessons = getModuleLessons(module.id);
            const completedCount = moduleLessons.filter(l => 
              progress.completed_lessons?.includes(l.id)
            ).length;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ModuleCard
                  module={module}
                  progress={getModuleProgress(module.id)}
                  isUnlocked={isModuleUnlocked(module, idx)}
                  isCompleted={progress.completed_modules?.includes(module.id)}
                  lessonsCompleted={completedCount}
                  totalLessons={moduleLessons.length}
                  onClick={() => navigate(createPageUrl(`Module?id=${module.id}`))}
                />
              </motion.div>
            );
          })}
        </div>

        {modules.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay módulos disponibles aún</p>
          </div>
        )}
      </div>
    </div>
  );
}