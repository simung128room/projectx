import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white ">
      <div className="p-8 bg-[#121212] border border-[#374151]  w-full max-w-sm ">
        <h1 className="text-2xl font-medium mb-6">Register</h1>
        <button onClick={() => navigate('/')} className="w-full bg-[#364153] p-2 rounded">Back to Home</button>
      </div>
    </div>
  );
}
