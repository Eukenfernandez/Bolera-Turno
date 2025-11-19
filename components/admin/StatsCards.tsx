import React from 'react';
import { Card, CardContent } from '../ui/Common';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
  total: number;
  pending: number;
  served: number;
  noShow: number;
  currentTurn: number;
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const items = [
    {
      title: "Turno Actual",
      value: stats.currentTurn,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "En Espera",
      value: stats.pending,
      icon: Users,
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    },
    {
      title: "Atendidos",
      value: stats.served,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Ausentes",
      value: stats.noShow,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, idx) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-full ${item.bg} ${item.color} flex items-center justify-center`}>
                <item.icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}