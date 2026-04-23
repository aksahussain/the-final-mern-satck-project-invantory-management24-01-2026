import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { motion } from 'framer-motion';
import { Send, Bot, User, Trash2 } from 'lucide-react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const { data } = await API.get('/chat');
            setMessages(data);
        } catch (error) {
            console.error("Failed to load chat history");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleClearChat = async () => {
        if (!window.confirm("Are you sure you want to clear the chat history and start a new conversation?")) return;

        try {
            await API.delete('/chat');
            setMessages([]);
        } catch (error) {
            console.error("Failed to clear chat history");
            alert("Failed to clear chat history. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        try {
            // Optimistic update
            // But functionality requires backend response for the bot answer
            const { data } = await API.post('/chat', { message: input });
            // data returns [userMsg, botMsg]
            setMessages([...messages, ...data]);
            setInput('');
        } catch (error) {
            console.error("Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-6rem)] bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Bot size={24} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-gray-900 dark:text-white">Inventory Assistant</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ask about stock, sales, or products</p>
                    </div>
                    <button
                        onClick={handleClearChat}
                        className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-red-900/30"
                        title="Clear History"
                    >
                        <Trash2 size={14} />
                        <span>New Chat</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <Bot size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Hello! How can I help you with the inventory today?</p>
                        <p className="text-sm mt-2">Try asking: "Which products are low in stock?"</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.isBotResponse ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.isBotResponse
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none'
                            : 'bg-primary-600 text-white rounded-tr-none'
                            }`}>
                            <p>{msg.message}</p>
                            <p className={`text-[10px] mt-1 ${msg.isBotResponse ? 'text-gray-400' : 'text-primary-200'}`}>
                                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </motion.div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-card">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        placeholder="Type your message..."
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
