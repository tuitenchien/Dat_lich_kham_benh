import { apiClient } from './axiosClient';

const apiSchedules = '/api/schedules';

export const requestGetSchedules = async (params) => {
    const res = await apiClient.get(apiSchedules, { params });
    return res.data;
};

export const requestGetAllSchedules = async (params) => {
    const res = await apiClient.get(`${apiSchedules}/all`, { params });
    return res.data;
};

export const requestCreateSchedules = async (data) => {
    const res = await apiClient.post(`${apiSchedules}/bulk-create`, data);
    return res.data;
};

export const requestDeleteSchedule = async (id) => {
    const res = await apiClient.delete(`${apiSchedules}/${id}`);
    return res.data;
};
