import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import { UserCheck, UserX, Trash2, User, Mail, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await userService.updateUser(id, { role: newRole });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await userService.updateUser(id, { status: newStatus });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(id);
                fetchUsers();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage application users and their permissions</p>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.map((user) => (
                                <motion.tr
                                    key={user._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    {(() => {
                                        const isCurrentUser = currentUser?._id === user._id;

                                        return (
                                            <>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                    <Mail size={12} className="mr-1" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            disabled={isCurrentUser}
                                            title={isCurrentUser ? 'You cannot change your own role' : 'Change user role'}
                                            className="text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="inventory_manager">Inventory Manager</option>
                                            <option value="staff">Staff</option>
                                            <option value="sales team">Sales Team</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {user.status === 'active' ? (
                                                <><CheckCircle size={12} className="mr-1" /> Active</>
                                            ) : (
                                                <><XCircle size={12} className="mr-1" /> Pending Approval</>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleStatusToggle(user._id, user.status)}
                                                disabled={isCurrentUser}
                                                className={`p-2 rounded-lg transition-colors ${user.status === 'active'
                                                    ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    } disabled:cursor-not-allowed disabled:opacity-40`}
                                                title={isCurrentUser ? 'You cannot change your own status' : user.status === 'active' ? 'Deactivate' : 'Approve User'}
                                            >
                                                {user.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                disabled={isCurrentUser}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                                title={isCurrentUser ? 'You cannot delete your own account' : 'Delete User'}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                            </>
                                        );
                                    })()}
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
