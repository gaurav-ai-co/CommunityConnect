import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input } from '../components/UI';
import { ShieldCheck, User, Shield, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';
import { dataService } from '../services/firebase';

export const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const handleLogin = (role: UserRole) => {
    // Mapping demo roles to mock emails for easy access
    const email = role === UserRole.RESIDENT ? 'resident@demo.com' : 
                  role === UserRole.GUARD ? 'guard@demo.com' : 'admin@demo.com';
    login(email);
  };

  if (isRegistering) {
    return <RegisterForm onBack={() => setIsRegistering(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600 text-white mb-4 shadow-lg">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">CommunityConnect</h1>
        <p className="text-gray-500 mt-2">Smart Living & Security Platform</p>
      </div>

      <Card className="w-full max-w-md p-8 shadow-xl border-0">
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Select Role to Demo</h2>
        
        <div className="space-y-4">
          <button 
            onClick={() => handleLogin(UserRole.RESIDENT)}
            disabled={loading}
            className="w-full flex items-center p-4 rounded-xl border-2 border-transparent bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-200 transition-all group text-left"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600 group-hover:text-indigo-700">
              <User className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-900">Resident Login</p>
              <p className="text-sm text-gray-500">Access visitors, payments & notices</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin(UserRole.GUARD)}
            disabled={loading}
            className="w-full flex items-center p-4 rounded-xl border-2 border-transparent bg-green-50 hover:bg-green-100 hover:border-green-200 transition-all group text-left"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm text-green-600 group-hover:text-green-700">
              <Shield className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-900">Security Guard</p>
              <p className="text-sm text-gray-500">Log entries & manage gate</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin(UserRole.ADMIN)}
            disabled={loading}
            className="w-full flex items-center p-4 rounded-xl border-2 border-transparent bg-gray-100 hover:bg-gray-200 hover:border-gray-300 transition-all group text-left"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm text-gray-600 group-hover:text-gray-700">
              <Lock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-900">Admin Console</p>
              <p className="text-sm text-gray-500">Manage community & reports</p>
            </div>
          </button>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
           <button onClick={() => setIsRegistering(true)} className="text-indigo-600 font-medium hover:underline text-sm flex items-center justify-center w-full">
             <UserPlus className="w-4 h-4 mr-2" /> New Resident? Register here
           </button>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          Demo Mode: No password required. Simulates Firebase Auth.
        </div>
      </Card>
    </div>
  );
};

const RegisterForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', block: 'A', flat: '101' });
  const [loading, setLoading] = useState(false);
  const { blocks, flats } = dataService.getFlatsConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dataService.addUser({
        displayName: formData.name,
        email: formData.email,
        role: UserRole.RESIDENT,
        block: formData.flat.split('-')[0], // Extract block from flat string
        flatNumber: formData.flat.split('-')[1],
        isPublic: true,
        pets: []
      });
      alert("Registration Successful! Please ask Admin to approve your account.");
      onBack();
    } catch (e) {
      alert("Error: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 mb-4 flex items-center text-sm">
           <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Resident Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Flat</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.flat}
              onChange={e => setFormData({...formData, flat: e.target.value})}
            >
              {flats.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <p className="text-xs text-gray-500 mt-1">Limited to 3 members per flat.</p>
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>Register</Button>
        </form>
      </Card>
    </div>
  );
};