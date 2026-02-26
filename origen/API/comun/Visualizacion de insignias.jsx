import React from 'react';
import { motion } from 'framer-motion';
import { Award, Brain, BookOpen, Lightbulb, Star, Trophy, Target, Sparkles } from 'lucide-react';

const badgeIcons = {
  brain: Brain,
  book: BookOpen,
  lightbulb: Lightbulb,
  star: Star,
  trophy: Trophy,
  target: Target,
  sparkles: Sparkles,
  award: Award
};

const badgeColors = {
  bronze: "from-amber-600 to-amber-700",
  silver: "from-slate-400 to-slate-500",
  gold: "from-yellow-400 to-amber-500",
  platinum: "from-violet-400 to-purple-500",
  diamond: "from-cyan-400 to-blue-500"
};

export default function BadgeDisplay({ badge, size = "md", showName = true }) {
  const Icon = badgeIcons[badge.icon] || Award;
  const color = badgeColors[badge.tier] || badgeColors.bronze;
  
  const sizes = {
    sm: { container: "w-10 h-10", icon: "w-5 h-5" },
    md: { container: "w-14 h-14", icon: "w-7 h-7" },
    lg: { container: "w-20 h-20", icon: "w-10 h-10" }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="flex flex-col items-center gap-1"
    >
      <div className={`${sizes[size].container} rounded-full bg-gradient-to-br ${color} 
        flex items-center justify-center shadow-lg`}>
        <Icon className={`${sizes[size].icon} text-white`} />
      </div>
      {showName && (
        <span className="text-xs font-medium text-slate-600 text-center max-w-16 truncate">
          {badge.name}
        </span>
      )}
    </motion.div>
  );
}