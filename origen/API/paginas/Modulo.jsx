import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft, BookOpen, HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LessonItem from '@/components/lesson/LessonItem';
import LessonContent from '@/components/lesson/LessonContent';
import QuizCard from '@/components/quiz/QuizCard';
import AIChatbot from '@/components/chat/AIChatbot';
import XPBadge from '@/components/common/XPBadge';
import { toast } from 'sonner';

export default function Module() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const moduleId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: module } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: async () => {
      const modules = await base44.entities.Module.filter({ id: moduleId });
      return modules[0];
    },
    enabled: !!moduleId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: () => base44.entities.Lesson.filter({ module_id: moduleId }, 'order'),
    enabled: !!moduleId,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', moduleId],
    queryFn: () => base44.entities.Quiz.filter({ module_id: moduleId }),
    enabled: !!moduleId,
  });

  const { data: userProgressList } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const userProgress = userProgressList?.[0];

  const updateProgressMutation = useMutation({
    mutationFn: async (updates) => {
      if (userProgress) {
        return base44.entities.UserProgress.update(userProgress.id, updates);
      } else {
        return base44.entities.UserProgress.create({
          user_email: user.email,
          total_xp: 0,
          current_semester: 1,
          completed_lessons: [],
          completed_modules: [],
          completed_semesters: [],
          badges: [],
          streak_days: 0,
          ...updates
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    }
  });

  const isLessonCompleted = (lessonId) => 
    userProgress?.completed_lessons?.includes(lessonId);

  const isLessonUnlocked = (lesson, idx) => {
    if (idx === 0) return true;
    const prevLesson = lessons[idx - 1];
    return isLessonCompleted(prevLesson?.id);
  };

  const handleLessonComplete = async () => {
    if (!activeLesson || !user) return;

    const newCompletedLessons = [
      ...(userProgress?.completed_lessons || []),
      activeLesson.id
    ].filter((v, i, a) => a.indexOf(v) === i);

    const xpGained = activeLesson.xp_reward || 10;
    const newXP = (userProgress?.total_xp || 0) + xpGained;

    await updateProgressMutation.mutateAsync({
      completed_lessons: newCompletedLessons,
      total_xp: newXP
    });

    toast.success(`¡Lección completada! +${xpGained} XP`);

    // Check if all lessons completed
    const allCompleted = lessons.every(l => 
      newCompletedLessons.includes(l.id)
    );

    if (allCompleted && quizzes.length > 0) {
      setActiveLesson(null);
      setShowQuiz(true);
    } else {
      // Move to next lesson
      const currentIdx = lessons.findIndex(l => l.id === activeLesson.id);
      if (currentIdx < lessons.length - 1) {
        setActiveLesson(lessons[currentIdx + 1]);
      } else {
        setActiveLesson(null);
      }
    }
  };

  const handleQuizComplete = async ({ score, passed }) => {
    if (!passed) {
      toast.error('Necesitas aprobar el quiz para completar el módulo');
      return;
    }

    const newCompletedModules = [
      ...(userProgress?.completed_modules || []),
      moduleId
    ].filter((v, i, a) => a.indexOf(v) === i);

    const xpGained = module?.xp_reward || 50;
    const newXP = (userProgress?.total_xp || 0) + xpGained;

    await updateProgressMutation.mutateAsync({
      completed_modules: newCompletedModules,
      total_xp: newXP
    });

    toast.success(`¡Módulo completado! +${xpGained} XP`);
    setShowQuiz(false);
    navigate(createPageUrl(`Semester?id=${module?.semester_id}`));
  };

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length;
  const progress = lessons.length ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl(`Semester?id=${module.semester_id}`))}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-slate-800">{module.title}</h1>
                <p className="text-sm text-slate-500">{completedCount}/{lessons.length} lecciones</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <XPBadge xp={userProgress?.total_xp || 0} />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setChatOpen(!chatOpen)}
                className="relative"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {showQuiz ? (
          <QuizCard 
            quiz={quizzes[0]} 
            onComplete={handleQuizComplete}
          />
        ) : activeLesson ? (
          <LessonContent 
            lesson={activeLesson}
            onComplete={handleLessonComplete}
          />
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Lessons list */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Lecciones</h2>
              <div className="space-y-3">
                {lessons.map((lesson, idx) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isCompleted={isLessonCompleted(lesson.id)}
                    isUnlocked={isLessonUnlocked(lesson, idx)}
                    isActive={false}
                    onClick={() => setActiveLesson(lesson)}
                  />
                ))}
              </div>

              {/* Quiz button */}
              {completedCount === lessons.length && quizzes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <Button
                    onClick={() => setShowQuiz(true)}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 
                      hover:from-violet-700 hover:to-purple-700 py-6 text-lg"
                  >
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Tomar Examen del Módulo
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-28">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{module.icon || '📖'}</div>
                  <h3 className="font-bold text-slate-800">{module.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{module.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Progreso</span>
                    <span className="font-bold text-slate-800">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">XP disponible</span>
                    <span className="font-bold text-amber-600">+{module.xp_reward || 0} XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chatbot */}
      <AIChatbot 
        contextModule={module.title}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />

      {/* Chat toggle button (mobile) */}
      {!chatOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-violet-600 to-purple-600 
            rounded-full shadow-lg shadow-violet-200 flex items-center justify-center text-white z-40 md:hidden"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}