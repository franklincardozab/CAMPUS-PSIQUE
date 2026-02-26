import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Trophy, Flame, BookOpen, Brain, Clock, Target, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import XPBadge from '@/components/common/XPBadge';
import StreakBadge from '@/components/common/StreakBadge';
import BadgeDisplay from '@/components/common/BadgeDisplay';

export default function Progress() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: userProgressList } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => base44.entities.Semester.list('number'),
  });

  const progress = userProgressList?.[0] || {
    total_xp: 0,
    current_semester: 1,
    completed_lessons: [],
    completed_modules: [],
    completed_semesters: [],
    badges: [],
    streak_days: 0,
    study_time_minutes: 0,
    quiz_scores: []
  };

  const averageQuizScore = progress.quiz_scores?.length 
    ? Math.round(progress.quiz_scores.reduce((sum, q) => sum + q.score, 0) / progress.quiz_scores.length)
    : 0;

  const level = Math.floor(progress.total_xp / 1000) + 1;
  const xpForNextLevel = (level * 1000) - progress.total_xp;

  const defaultBadges = [
    { id: 'first_lesson', name: 'Primera Lección', icon: 'book', tier: 'bronze' },
    { id: 'quiz_master', name: 'Quiz Master', icon: 'brain', tier: 'silver' },
    { id: 'streak_7', name: '7 Días', icon: 'target', tier: 'gold' },
    { id: 'semester_1', name: 'Semestre 1', icon: 'trophy', tier: 'platinum' },
  ];

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
            className="flex items-center gap-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl">
              🎓
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Mi Progreso</h1>
              <p className="text-white/80 mt-1">Nivel {level} • {xpForNextLevel} XP para nivel {level + 1}</p>
              <div className="flex items-center gap-3 mt-3">
                <XPBadge xp={progress.total_xp} />
                {progress.streak_days > 0 && <StreakBadge days={progress.streak_days} />}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-violet-500" />
              <div className="text-2xl font-bold text-slate-800">
                {progress.completed_lessons?.length || 0}
              </div>
              <div className="text-sm text-slate-500">Lecciones</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold text-slate-800">
                {progress.completed_modules?.length || 0}
              </div>
              <div className="text-sm text-slate-500">Módulos</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold text-slate-800">
                {averageQuizScore}%
              </div>
              <div className="text-sm text-slate-500">Promedio Quiz</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-slate-800">
                {Math.round((progress.study_time_minutes || 0) / 60)}h
              </div>
              <div className="text-sm text-slate-500">Tiempo Estudio</div>
            </CardContent>
          </Card>
        </div>

        {/* XP Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Experiencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Nivel {level}</span>
              <span className="text-sm text-slate-500">Nivel {level + 1}</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((progress.total_xp % 1000) / 1000) * 100}%` }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              />
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">
              {progress.total_xp % 1000} / 1000 XP
            </p>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-500" />
              Insignias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {(progress.badges?.length > 0 ? progress.badges : defaultBadges).map((badge, idx) => (
                <motion.div
                  key={badge.id || idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <BadgeDisplay badge={badge} />
                </motion.div>
              ))}
            </div>
            {(!progress.badges || progress.badges.length === 0) && (
              <p className="text-center text-slate-500 text-sm mt-4">
                Completa lecciones y quizzes para desbloquear insignias
              </p>
            )}
          </CardContent>
        </Card>

        {/* Semester Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Progreso por Semestre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {semesters.map((semester) => {
                const isCompleted = progress.completed_semesters?.includes(semester.number);
                return (
                  <div key={semester.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${isCompleted ? 'bg-green-100' : 'bg-slate-100'}`}>
                      {isCompleted ? (
                        <Trophy className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="text-slate-500 font-bold">{semester.number}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">{semester.title}</span>
                        <span className={`text-sm ${isCompleted ? 'text-green-600' : 'text-slate-500'}`}>
                          {isCompleted ? 'Completado' : 'En progreso'}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isCompleted 
                            ? 'bg-green-500' 
                            : 'bg-gradient-to-r from-violet-500 to-purple-600'}`}
                          style={{ width: isCompleted ? '100%' : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}