import React from 'react';
import { motion } from 'motion/react';

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 h-full">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 rounded-full border-[6px] border-transparent border-t-indigo-500 border-r-teal-500 border-b-green-500"
    />
    <span className="text-sm text-slate-600 font-semibold mt-4">{text}</span>
  </div>
);