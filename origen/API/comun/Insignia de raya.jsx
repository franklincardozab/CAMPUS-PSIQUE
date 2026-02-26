import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StreakBadge({ days }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 
        text-white rounded-full px-3 py-1 font-bold text-sm shadow-lg"
    >
      <Flame className="w-4 h-4 fill-current animate-pulse" />
      <span>{days} días</span>
    </motion.div>
  );
}