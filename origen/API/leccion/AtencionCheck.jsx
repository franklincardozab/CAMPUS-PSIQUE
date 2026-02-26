import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AttentionCheck({ check, onComplete }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    const isCorrect = selectedAnswer === check.correct_answer;
    onComplete(isCorrect);
  };

  const isCorrect = selectedAnswer === check.correct_answer;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <Card className="max-w-2xl w-full bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">Check de Atención</p>
                <h3 className="text-xl font-bold">¿Estás prestando atención?</h3>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="p-6">
            <p className="text-lg font-medium text-slate-800 mb-6">
              {check.question}
            </p>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {check.options?.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const showCorrect = showFeedback && option === check.correct_answer;
                const showWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                    whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                    onClick={() => !isAnswered && setSelectedAnswer(option)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected && !showFeedback ? 'border-violet-500 bg-violet-50' : 'border-slate-200'}
                      ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                      ${showWrong ? 'border-red-500 bg-red-50' : ''}
                      ${!isAnswered ? 'hover:border-violet-300 hover:bg-violet-50/50' : ''}
                      disabled:cursor-not-allowed
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">{option}</span>
                      {showCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg mb-6 ${
                    isCorrect 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-amber-50 border border-amber-200'
                  }`}
                >
                  <div className="flex gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold mb-1 ${
                        isCorrect ? 'text-green-800' : 'text-amber-800'
                      }`}>
                        {isCorrect ? '¡Excelente! 🎉' : 'No es correcto'}
                      </p>
                      <p className="text-sm text-slate-700">{check.feedback}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {!isAnswered ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 
                    hover:from-violet-700 hover:to-purple-700"
                >
                  Verificar Respuesta
                </Button>
              ) : (
                <Button
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 
                    hover:from-violet-700 hover:to-purple-700"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}