import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Calendar } from 'lucide-react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-slate-600 font-mono text-sm shadow-sm">
        <Calendar className="w-3 h-3 text-blue-600" />
        <span>
          {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-slate-600 font-mono text-sm shadow-sm">
        <ClockIcon className="w-3 h-3 text-blue-600" />
        <span>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
