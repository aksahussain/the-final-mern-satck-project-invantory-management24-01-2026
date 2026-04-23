import API from './api';

const getUsers = async () => {
    const response = await API.get('/users');
    return response.data;
};

const updateUser = async (id, userData) => {
    const response = await API.put(`/users/${id}`, userData);
    return response.data;
};

const deleteUser = async (id) => {
    const response = await API.delete(`/users/${id}`);
    return response.data;
};

const userService = {
    getUsers,
    updateUser,
    deleteUser
};

export default userService;
