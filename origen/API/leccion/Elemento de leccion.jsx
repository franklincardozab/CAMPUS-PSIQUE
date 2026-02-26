import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Play, FileText, Video, Gamepad2, BookMarked } from 'lucide-react';

const typeIcons = {
  theory: FileText,
  video: Video,
  interactive: Gamepad2,
  case_study: BookMarked
};

const typeLabels = {
  theory: "Teoría",
  video: "Video",
  interactive: "Interactivo",
  case_study: "Caso de Estudio"
};

export default function LessonItem({ lesson, isCompleted, isUnlocked, isActive, onClick }) {
  const Icon = typeIcons[lesson.type] || FileText;

  return (
    <motion.div
      whileHover={isUnlocked ? { x: 4 } : {}}
      onClick={isUnlocked ? onClick : undefined}
      className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200
        ${isActive ? 'bg-violet-100 border-2 border-violet-300' : 
          isUnlocked ? 'bg-white border-2 border-slate-100 hover:border-violet-200 cursor-pointer' : 
          'bg-slate-50 border-2 border-slate-100 opacity-50 cursor-not-allowed'}`}
    >
      {/* Status indicator */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        ${isCompleted ? 'bg-green-100' : 
          isActive ? 'bg-violet-200' :
          isUnlocked ? 'bg-slate-100' : 'bg-slate-200'}`}>
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : !isUnlocked ? (
          <Lock className="w-4 h-4 text-slate-400" />
        ) : isActive ? (
          <Play className="w-5 h-5 text-violet-600 ml-0.5" />
        ) : (
          <span className="text-lg">{lesson.order}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium line-clamp-1 ${isCompleted ? 'text-slate-500' : 'text-slate-800'}`}>
          {lesson.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Icon className="w-3 h-3" />
            <span>{typeLabels[lesson.type]}</span>
          </div>
          {lesson.duration_minutes && (
            <span className="text-xs text-slate-400">• {lesson.duration_minutes} min</span>
          )}
        </div>
      </div>

      {/* XP reward */}
      {lesson.xp_reward && !isCompleted && (
        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
          +{lesson.xp_reward} XP
        </span>
      )}
    </motion.div>
  );
}