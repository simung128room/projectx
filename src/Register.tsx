import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-card text-white ">
      <div className="p-8 bg-card border border-border  w-full max-w-sm ">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <button onClick={() => navigate('/')} className="w-full bg-[#10b981] p-2 rounded">Back to Home</button>
      </div>
    </div>
  );
}
