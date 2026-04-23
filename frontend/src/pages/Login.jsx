import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-white transition-all duration-500">

            {/* Back Button */}
            <Link
                to="/"
                className="absolute top-8 left-8 z-50 flex items-center space-x-2 px-4 py-2 rounded-full border bg-white text-gray-600 hover:text-primary-600 shadow-sm"
            >
                <ArrowLeft size={18} />
                <span className="text-sm font-bold">Back</span>
            </Link>

            {/* Left Side */}
            <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-gray-50 border-r">
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Welcome back!
                    </h3>
                    <p className="text-gray-500">
                        Sign in to continue managing your inventory.
                    </p>
                </div>
            </div>

            {/* Right Side Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-md w-full"
                >

                    {/* Heading */}
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Hello Again
                        </h2>
                        <p className="text-gray-500 mt-2 text-lg">
                            Enter your details to access your account
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Email */}
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        {/* Forgot */}
                        <div className="flex justify-end">
                            <Link
                                to="/"
                                className="text-sm font-bold text-primary-600 hover:text-primary-700"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition"
                        >
                            <span>Sign In</span>
                            <ArrowRight size={20} />
                        </button>
                    </form>

                    {/* Bottom */}
                    <div className="mt-10 text-center text-sm">
                        <p className="text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary-600 font-bold">
                                Create Account
                            </Link>
                        </p>
                    </div>

                </motion.div>
            </div>
        </div>
    );
};

export default Login;
