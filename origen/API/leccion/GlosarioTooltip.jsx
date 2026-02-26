import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Lightbulb } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export default function GlossaryTooltip({ term, definition, example, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        <span className="glossary-term relative cursor-help border-b-2 border-dotted 
          border-violet-400 text-violet-700 font-medium hover:border-violet-600 
          transition-colors">
          {children || term}
        </span>
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-0 overflow-hidden border-2 border-violet-200"
        sideOffset={5}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-br from-violet-50 to-purple-50"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <h4 className="font-bold text-sm">Término Clave</h4>
            </div>
            <p className="text-lg font-bold mt-1">{term}</p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {definition}
              </p>
            </div>

            {example && (
              <div className="bg-white rounded-lg p-3 border border-violet-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Ejemplo:</p>
                    <p className="text-xs text-slate-600 italic">{example}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </HoverCardContent>
    </HoverCard>
  );
}

// Hook para detectar y envolver términos del glosario en el contenido
export function useGlossary(content, glossary) {
  if (!glossary || !glossary.length || !content) return content;

  let processedContent = content;

  glossary.forEach(({ term, definition, example }) => {
    // Buscar el término en el contenido (case insensitive, pero preservar el caso original)
    const regex = new RegExp(`\\b(${term})\\b`, 'gi');
    processedContent = processedContent.replace(regex, (match) => {
      return `<span class="glossary-marker" data-term="${term}" data-definition="${definition}" data-example="${example || ''}">${match}</span>`;
    });
  });

  return processedContent;
}