import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
      <div className="p-8 bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <button onClick={() => navigate('/')} className="w-full bg-cyan-600 p-2 rounded">Back to Home</button>
      </div>
    </div>
  );
}
