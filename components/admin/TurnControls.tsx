import React, { useState } from 'react';
import { Card, CardContent, Button, Dialog, Input } from '../ui/Common';
import { ChevronLeft, ChevronRight, RotateCcw, Settings, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  currentTurn: number;
  onAction: (action: 'ADVANCE' | 'PREVIOUS' | 'SET' | 'RESET', value?: number) => void;
}

export default function TurnControls({ currentTurn, onAction }: Props) {
  const [showSetDialog, setShowSetDialog] = useState(false);
  const [setVal, setSetVal] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSet = () => {
    const num = parseInt(setVal);
    if (!isNaN(num) && num >= 0) {
      onAction("SET", num);
      setShowSetDialog(false);
      setSetVal("");
    }
  };

  return (
    <>
      <Card className="bg-white shadow-md border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Control Principal
            </div>
            
            <div className="flex items-center gap-6 mb-8 w-full justify-center">
               <Button 
                 variant="outline" 
                 size="icon"
                 className="h-14 w-14 rounded-full border-2"
                 onClick={() => onAction("PREVIOUS")}
                 disabled={currentTurn <= 0}
               >
                 <ChevronLeft className="w-6 h-6" />
               </Button>

               <motion.div 
                 key={currentTurn}
                 initial={{ scale: 0.8, opacity: 0.5 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="text-8xl font-bold text-slate-900 min-w-[160px] text-center"
               >
                 {currentTurn}
               </motion.div>

               <Button 
                 className="h-20 w-20 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-blue-200 hover:shadow-xl transition-all"
                 onClick={() => onAction("ADVANCE")}
               >
                 <ChevronRight className="w-10 h-10" />
               </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <Button variant="secondary" onClick={() => {}} className="text-slate-600" title="Re-llamar (Visual)">
                <RotateCcw className="w-4 h-4 mr-2" /> Repetir
              </Button>
              <Button variant="outline" onClick={() => setShowSetDialog(true)}>
                <Settings className="w-4 h-4 mr-2" /> Ajustar
              </Button>
              <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setShowResetConfirm(true)}>
                <Trash2 className="w-4 h-4 mr-2" /> Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Dialog */}
      <Dialog open={showSetDialog}>
         <div className="p-6">
           <h3 className="text-lg font-bold mb-4">Establecer Turno Manualmente</h3>
           <Input 
             type="number" 
             placeholder="Nuevo número..." 
             value={setVal}
             onChange={(e) => setSetVal(e.target.value)}
             className="mb-4"
           />
           <div className="flex gap-2">
             <Button variant="secondary" className="flex-1" onClick={() => setShowSetDialog(false)}>Cancelar</Button>
             <Button className="flex-1" onClick={handleSet}>Guardar</Button>
           </div>
         </div>
      </Dialog>

      {/* Reset Dialog */}
      <Dialog open={showResetConfirm}>
         <div className="p-6 text-center">
           <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
           <h3 className="text-lg font-bold text-red-600">¿Reiniciar Contador?</h3>
           <p className="text-slate-500 mt-2 mb-6">El turno volverá a 0. Esto no borra los tickets.</p>
           <div className="flex gap-2">
             <Button variant="secondary" className="flex-1" onClick={() => setShowResetConfirm(false)}>Cancelar</Button>
             <Button variant="destructive" className="flex-1" onClick={() => {
               onAction("RESET");
               setShowResetConfirm(false);
             }}>Reiniciar</Button>
           </div>
         </div>
      </Dialog>
    </>
  );
}