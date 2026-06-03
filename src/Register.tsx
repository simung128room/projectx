import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900">
      <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <button onClick={() => navigate('/')} className="w-full bg-cyan-600 p-2 rounded">Back to Home</button>
      </div>
    </div>
  );
}
