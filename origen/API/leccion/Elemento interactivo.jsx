import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Target, FileText, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function InteractiveElement({ element, onComplete }) {
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete?.(response);
  };

  const icons = {
    poll: MessageSquare,
    reflection: Target,
    activity: FileText,
    case_analysis: Users
  };

  const Icon = icons[element.type] || FileText;

  const colors = {
    poll: 'from-blue-500 to-cyan-500',
    reflection: 'from-purple-500 to-pink-500',
    activity: 'from-emerald-500 to-teal-500',
    case_analysis: 'from-orange-500 to-red-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8"
    >
      <Card className="overflow-hidden border-2">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colors[element.type]} text-white p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-90">
                {element.type === 'poll' && 'Encuesta Rápida'}
                {element.type === 'reflection' && 'Reflexión Personal'}
                {element.type === 'activity' && 'Actividad Práctica'}
                {element.type === 'case_analysis' && 'Análisis de Caso'}
              </p>
              <h4 className="font-bold">Pausa para Reflexionar</h4>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-700 mb-4 leading-relaxed">{element.prompt}</p>

          {element.type === 'poll' && element.data?.options && (
            <div className="space-y-2 mb-4">
              {element.data.options.map((option, idx) => (
                <Button
                  key={idx}
                  variant={response === option ? "default" : "outline"}
                  onClick={() => setResponse(option)}
                  disabled={submitted}
                  className="w-full justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {(element.type === 'reflection' || element.type === 'activity' || element.type === 'case_analysis') && (
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              disabled={submitted}
              className="min-h-32 mb-4"
            />
          )}

          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!response}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 
                hover:from-violet-700 hover:to-purple-700"
            >
              Enviar Respuesta
            </Button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-medium">
                ✓ Respuesta guardada. ¡Excelente trabajo reflexionando!
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}