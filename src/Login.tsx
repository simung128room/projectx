import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#09090b] text-white ">
      <div className="p-8 bg-[#09090b] border border-[#1e1e1e]  w-full max-w-sm ">
        <h1 className="text-2xl font-medium mb-6">Login</h1>
        <button onClick={() => navigate('/')} className="w-full bg-[#10b981] p-2 rounded">Back to Home</button>
      </div>
    </div>
  );
}
