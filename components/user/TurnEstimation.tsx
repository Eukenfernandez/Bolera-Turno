import React from 'react';
import { Card, CardContent } from '../ui/Common';
import { Clock, Zap, Timer } from 'lucide-react';

export default function TurnEstimation({ turnsAhead }: { turnsAhead: number }) {
  const estimatedMinutes = turnsAhead * 5;
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;

  let config = {
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: Timer,
    text: "Tiempo de espera estimado"
  };

  if (turnsAhead <= 5) {
    config = { color: "text-green-600", bg: "bg-green-50", icon: Zap, text: "¡Muy pronto!" };
  } else if (turnsAhead <= 15) {
    config = { color: "text-yellow-600", bg: "bg-yellow-50", icon: Clock, text: "Pronto" };
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col justify-center h-full">
        <div className={`w-10 h-10 rounded-full ${config.bg} ${config.color} flex items-center justify-center mb-4`}>
          <config.icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{config.text}</h3>
        <div className="text-3xl font-bold text-slate-800">
          {hours > 0 ? `${hours}h ` : ''}{minutes} min
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {turnsAhead} turnos por delante
        </p>
      </CardContent>
    </Card>
  );
}