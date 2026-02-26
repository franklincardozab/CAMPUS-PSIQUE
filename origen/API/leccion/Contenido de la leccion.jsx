import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlossaryTooltip from './GlossaryTooltip';
import AttentionCheck from './AttentionCheck';
import InteractiveElement from './InteractiveElement';

export default function LessonContent({ lesson, onComplete }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentAttentionCheck, setCurrentAttentionCheck] = useState(null);
  const [completedChecks, setCompletedChecks] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = Math.min((scrolled / documentHeight) * 100, 100);
      setScrollProgress(progress);

      // Check for attention checks at scroll positions
      if (lesson.attention_checks?.length) {
        lesson.attention_checks.forEach((check, idx) => {
          if (
            progress >= check.position &&
            !completedChecks.includes(idx) &&
            !currentAttentionCheck
          ) {
            setCurrentAttentionCheck({ ...check, idx });
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lesson, completedChecks, currentAttentionCheck]);

  const handleAttentionCheckComplete = (isCorrect) => {
    if (currentAttentionCheck) {
      setCompletedChecks([...completedChecks, currentAttentionCheck.idx]);
      setCurrentAttentionCheck(null);
    }
  };

  // Process content to wrap glossary terms
  const processContentWithGlossary = (content) => {
    if (!lesson.glossary?.length || !content) return content;

    const parts = [];
    let currentPos = 0;

    lesson.glossary.forEach(({ term, definition, example }) => {
      const regex = new RegExp(`\\b(${term})\\b`, 'gi');
      let match;
      const tempContent = content.slice(currentPos);

      while ((match = regex.exec(tempContent)) !== null) {
        const absolutePos = currentPos + match.index;
        
        if (match.index > 0) {
          parts.push({
            type: 'text',
            content: tempContent.slice(0, match.index)
          });
        }

        parts.push({
          type: 'glossary',
          term,
          definition,
          example,
          matched: match[0]
        });

        currentPos = absolutePos + match[0].length;
        break;
      }
    });

    if (currentPos < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(currentPos)
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto pb-20"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {lesson.difficulty_level && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              lesson.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
              lesson.difficulty_level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
              lesson.difficulty_level === 'advanced' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {lesson.difficulty_level}
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{lesson.title}</h1>
        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
          {lesson.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{lesson.duration_minutes} minutos</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>
              {lesson.type === 'video' ? 'Video' : 
               lesson.type === 'theory' ? 'Teoría' : 
               lesson.type === 'case_study' ? 'Caso de Estudio' :
               lesson.type === 'simulation' ? 'Simulación' :
               lesson.type === 'debate' ? 'Debate' : 'Interactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Video */}
      {lesson.video_url && (
        <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-8 shadow-xl">
          <iframe
            src={lesson.video_url}
            className="w-full h-full"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      )}

      {/* Content with Glossary */}
      {lesson.content && (
        <div className="prose prose-slate max-w-none prose-headings:text-slate-800 
          prose-p:text-slate-600 prose-a:text-violet-600 prose-strong:text-slate-700
          prose-img:rounded-xl prose-img:shadow-lg mb-8">
          <ReactMarkdown
            components={{
              p: ({ children }) => {
                // Check if this paragraph contains glossary terms
                if (typeof children === 'string' && lesson.glossary?.length) {
                  const elements = [];
                  let remainingText = children;

                  lesson.glossary.forEach(({ term, definition, example }) => {
                    const regex = new RegExp(`(.*?)(\\b${term}\\b)(.*)`, 'i');
                    const match = remainingText.match(regex);
                    
                    if (match) {
                      elements.push(match[1]);
                      elements.push(
                        <GlossaryTooltip
                          key={term}
                          term={term}
                          definition={definition}
                          example={example}
                        >
                          {match[2]}
                        </GlossaryTooltip>
                      );
                      remainingText = match[3];
                    }
                  });

                  if (elements.length > 0) {
                    elements.push(remainingText);
                    return <p>{elements}</p>;
                  }
                }
                return <p>{children}</p>;
              },
            }}
          >
            {lesson.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Interactive Elements */}
      {lesson.interactive_elements?.map((element, idx) => (
        <InteractiveElement
          key={idx}
          element={element}
          onComplete={() => {}}
        />
      ))}

      {/* Key concepts */}
      {lesson.key_concepts?.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-violet-600" />
            <h3 className="font-bold text-slate-800">Conceptos Clave</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lesson.key_concepts.map((concept, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-white rounded-full text-sm font-medium 
                text-violet-700 border border-violet-200">
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Glossary Summary */}
      {lesson.glossary?.length > 0 && (
        <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-violet-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h3 className="font-bold text-slate-800">Glosario de Términos</h3>
          </div>
          <div className="space-y-3">
            {lesson.glossary.map(({ term, definition }, idx) => (
              <div key={idx} className="pb-3 border-b border-slate-100 last:border-0">
                <h4 className="font-semibold text-violet-700 mb-1">{term}</h4>
                <p className="text-sm text-slate-600">{definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* References */}
      {lesson.references?.length > 0 && (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Referencias Académicas
          </h4>
          <ul className="text-sm text-slate-600 space-y-1">
            {lesson.references.map((ref, idx) => (
              <li key={idx} className="italic">• {ref}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Complete button */}
      <div className="mt-10 flex justify-center">
        <Button 
          onClick={onComplete}
          size="lg"
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 
            hover:to-purple-700 text-white px-8 py-6 rounded-xl text-lg font-semibold shadow-lg
            shadow-violet-200 transition-all duration-300 hover:shadow-xl hover:shadow-violet-300"
        >
          Completar Lección
        </Button>
      </div>

      {/* Attention Check Modal */}
      {currentAttentionCheck && (
        <AttentionCheck
          check={currentAttentionCheck}
          onComplete={handleAttentionCheckComplete}
        />
      )}

      {/* Progress Indicator */}
      {scrollProgress > 0 && (
        <div className="fixed bottom-24 right-6 bg-white rounded-full shadow-lg p-2 border-2 border-violet-200 z-40">
          <div className="relative w-12 h-12">
            <svg className="transform -rotate-90 w-12 h-12">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="#E5E7EB"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="#8B5CF6"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - scrollProgress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-violet-600">
                {Math.round(scrollProgress)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}