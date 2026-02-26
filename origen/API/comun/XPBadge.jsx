import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function XPBadge({ xp, size = "md", showAnimation = false }) {
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <motion.div
      initial={showAnimation ? { scale: 0.8, opacity: 0 } : {}}
      animate={showAnimation ? { scale: 1, opacity: 1 } : {}}
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 
        text-white rounded-full font-bold shadow-lg ${sizes[size]}`}
    >
      <Zap className={`${iconSizes[size]} fill-current`} />
      <span>{xp.toLocaleString()}</span>
    </motion.div>
  );
}