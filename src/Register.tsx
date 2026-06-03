import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-8 bg-[#0a0a0a] rounded-2xl border border-white/10 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <button onClick={() => navigate('/')} className="w-full bg-cyan-600 p-2 rounded">Back to Home</button>
      </div>
    </div>
  );
}
