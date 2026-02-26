import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Brain, Trophy, Target, Clock } from 'lucide-react';

export default function QuizCard({ quiz, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState(null);
  const [selectedAnswers, setSelectedAnswers] = React.useState([]);
  const [textAnswer, setTextAnswer] = React.useState('');
  const [answers, setAnswers] = React.useState([]);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [quizComplete, setQuizComplete] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(
    quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null
  );

  // Timer
  React.useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !quizComplete) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !quizComplete) {
      setQuizComplete(true);
    }
  }, [timeRemaining, quizComplete]);

  const question = quiz.questions[currentQuestion];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canProceed = () => {
    if (question.type === 'multiple_select') return selectedAnswers.length > 0;
    if (question.type === 'fill_blank' || question.type === 'essay') return textAnswer.trim().length > 0;
    return selectedAnswer !== null;
  };

  const handleNext = () => {
    let isCorrect = false;
    let userAnswer = null;

    if (question.type === 'multiple_select') {
      isCorrect = JSON.stringify([...selectedAnswers].sort()) === 
                  JSON.stringify([...(question.correct_answers || [])].sort());
      userAnswer = selectedAnswers;
    } else if (question.type === 'fill_blank') {
      isCorrect = textAnswer.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim();
      userAnswer = textAnswer;
    } else if (question.type === 'essay') {
      isCorrect = true; // Essays are subjective
      userAnswer = textAnswer;
    } else {
      isCorrect = selectedAnswer === question.correct_answer;
      userAnswer = selectedAnswer;
    }

    setAnswers([...answers, { 
      question: currentQuestion, 
      answer: userAnswer, 
      correct: isCorrect,
      points: isCorrect ? (question.points || 1) : 0
    }]);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setTextAnswer('');
      setShowFeedback(false);
    } else {
      setQuizComplete(true);
    }
  };

  const calculateScore = () => {
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const earnedPoints = answers.reduce((sum, a) => sum + a.points, 0);
    return Math.round((earnedPoints / totalPoints) * 100);
  };

  // Results screen
  if (quizComplete) {
    const score = calculateScore();
    const passed = score >= (quiz.passing_score || 70);
    const correctCount = answers.filter(a => a.correct).length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-2 overflow-hidden">
          <div className={`p-8 text-center ${
            passed 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
              : 'bg-gradient-to-br from-red-50 to-orange-50'
          }`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
                passed ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {passed ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : (
                <Target className="w-12 h-12 text-white" />
              )}
            </motion.div>
            <h2 className={`text-3xl font-bold mb-2 ${
              passed ? 'text-green-800' : 'text-red-800'
            }`}>
              {passed ? '¡Excelente Trabajo!' : 'Sigue Practicando'}
            </h2>
            <p className="text-lg text-slate-600">
              Tu puntuación: <span className="font-bold">{score}%</span>
            </p>
            <p className="text-sm text-slate-500">
              {passed 
                ? `Superaste el ${quiz.passing_score || 70}% requerido` 
                : `Necesitas al menos ${quiz.passing_score || 70}% para aprobar`}
            </p>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{correctCount}</div>
                <div className="text-xs text-slate-600">Correctas</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700">
                  {quiz.questions.length - correctCount}
                </div>
                <div className="text-xs text-slate-600">Incorrectas</div>
              </div>
              <div className="text-center p-4 bg-violet-50 rounded-lg">
                <Brain className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-violet-700">{quiz.questions.length}</div>
                <div className="text-xs text-slate-600">Total</div>
              </div>
            </div>

            <div className="flex gap-3">
              {!passed && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswers([]);
                    setQuizComplete(false);
                    setSelectedAnswer(null);
                    setSelectedAnswers([]);
                    setTextAnswer('');
                    setTimeRemaining(quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null);
                  }}
                  className="flex-1"
                >
                  Reintentar
                </Button>
              )}
              <Button
                onClick={() => onComplete({ score, passed })}
                className={`flex-1 ${
                  passed 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                    : 'bg-slate-600 hover:bg-slate-700'
                }`}
              >
                {passed ? 'Continuar' : 'Salir'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Quiz interface
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-sm">
            Pregunta {currentQuestion + 1} de {quiz.questions.length}
          </Badge>
          {timeRemaining !== null && (
            <Badge variant={timeRemaining < 60 ? "destructive" : "outline"} className="text-sm flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl">{quiz.title}</CardTitle>
        <Progress value={((currentQuestion + 1) / quiz.questions.length) * 100} className="mt-3" />
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Case Scenario */}
        {question.case_scenario && (
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Escenario Clínico:</h4>
            <p className="text-sm text-blue-800 leading-relaxed">{question.case_scenario}</p>
          </div>
        )}

        <div>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex-1">
              {question.question}
            </h3>
            {question.difficulty && (
              <Badge variant="outline" className={
                question.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-200' :
                question.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-red-50 text-red-700 border-red-200'
              }>
                {question.difficulty}
              </Badge>
            )}
          </div>

          {/* Multiple Choice / True False */}
          {(question.type === 'multiple_choice' || question.type === 'true_false') && (
            <div className="space-y-3">
              {question.options?.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === question.correct_answer;
                const showCorrect = showFeedback && isCorrect;
                const showWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                    whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                    onClick={() => !showFeedback && setSelectedAnswer(option)}
                    disabled={showFeedback}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected && !showFeedback ? 'border-violet-500 bg-violet-50' : 'border-slate-200'}
                      ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                      ${showWrong ? 'border-red-500 bg-red-50' : ''}
                      ${!showFeedback ? 'hover:border-violet-300 hover:bg-slate-50' : ''}
                      disabled:cursor-not-allowed
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {showCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Multiple Select */}
          {question.type === 'multiple_select' && (
            <div className="space-y-3">
              <p className="text-sm text-amber-600 font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Selecciona todas las opciones correctas
              </p>
              {question.options?.map((option, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${selectedAnswers.includes(option) ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-violet-300'}
                  `}
                  onClick={() => {
                    if (showFeedback) return;
                    setSelectedAnswers(prev =>
                      prev.includes(option)
                        ? prev.filter(a => a !== option)
                        : [...prev, option]
                    );
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedAnswers.includes(option)}
                      disabled={showFeedback}
                    />
                    <span className="font-medium">{option}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fill in the Blank */}
          {question.type === 'fill_blank' && (
            <div className="space-y-3">
              <Input
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Escribe tu respuesta..."
                disabled={showFeedback}
                className="text-lg p-4"
              />
            </div>
          )}

          {/* Essay */}
          {question.type === 'essay' && (
            <div className="space-y-3">
              <Textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Desarrolla tu respuesta de forma detallada..."
                disabled={showFeedback}
                className="min-h-40 p-4"
              />
              <p className="text-xs text-slate-500">
                📝 Mínimo 50 palabras recomendadas para una respuesta completa
              </p>
            </div>
          )}
        </div>

        {/* Feedback */}
        {showFeedback && question.explanation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border-l-4 ${
              (question.type === 'multiple_select' 
                ? JSON.stringify([...selectedAnswers].sort()) === JSON.stringify([...(question.correct_answers || [])].sort())
                : question.type === 'fill_blank'
                ? textAnswer.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim()
                : selectedAnswer === question.correct_answer)
                ? 'bg-green-50 border-green-500'
                : 'bg-amber-50 border-amber-500'
            }`}
          >
            <div className="flex gap-3">
              {(question.type === 'multiple_select' 
                ? JSON.stringify([...selectedAnswers].sort()) === JSON.stringify([...(question.correct_answers || [])].sort())
                : question.type === 'fill_blank'
                ? textAnswer.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim()
                : selectedAnswer === question.correct_answer) ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-slate-800 mb-1">Explicación:</p>
                <p className="text-sm text-slate-700">{question.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {!showFeedback && quiz.show_feedback_immediately !== false ? (
            <Button
              onClick={() => setShowFeedback(true)}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              Verificar Respuesta
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {currentQuestion < quiz.questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}