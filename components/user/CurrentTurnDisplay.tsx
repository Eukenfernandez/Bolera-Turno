import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/Common';

export default function CurrentTurnDisplay({ currentTurn }: { currentTurn: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <CardContent className="flex flex-col items-center justify-center py-12 relative z-10">
          <span className="text-blue-100 font-medium uppercase tracking-wider text-sm mb-2">
            Turno Actual
          </span>
          <motion.div
            key={currentTurn}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-bold tracking-tighter"
          >
            {currentTurn}
          </motion.div>
          <span className="text-blue-200 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Atendiendo ahora
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}