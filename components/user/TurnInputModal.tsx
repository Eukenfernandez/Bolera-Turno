import React, { useState } from 'react';
import { Dialog, Input, Button } from '../ui/Common';
import { motion } from 'framer-motion';
import { Ticket as TicketIcon, AlertCircle } from 'lucide-react';

interface TurnInputModalProps {
  open: boolean;
  currentTurn: number;
  onConfirm: (turn: number) => void;
  onOpenChange?: (open: boolean) => void;
}

export default function TurnInputModal({ open, currentTurn, onConfirm, onOpenChange }: TurnInputModalProps) {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const num = parseInt(value);
    if (isNaN(num) || num <= 0) {
      setError("Por favor introduce un número válido");
      return;
    }
    if (num <= currentTurn) {
      setError(`El turno debe ser mayor al actual (${currentTurn})`);
      return;
    }
    onConfirm(num);
  };

  return (
    <Dialog open={open}>
      <div className="p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <TicketIcon className="w-8 h-8" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Registra tu Turno</h2>
        <p className="text-slate-500 mb-6">
          Mira tu ticket físico e introduce el número a continuación.
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium">Turno atendiéndose ahora</p>
          <p className="text-3xl font-bold text-blue-600">{currentTurn}</p>
        </div>

        <div className="space-y-4">
          <Input 
            type="number" 
            placeholder="Ej: 105" 
            className="text-center text-2xl h-14 font-bold tracking-widest"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
          />
          
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-600 text-sm animate-pulse">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            {onOpenChange && (
              <Button 
                variant="secondary" 
                className="flex-1 h-12 text-lg"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            )}
            <Button 
              className={onOpenChange ? "flex-1 h-12 text-lg" : "w-full h-12 text-lg"}
              onClick={handleSubmit}
              disabled={!value}
            >
              Confirmar Turno
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}