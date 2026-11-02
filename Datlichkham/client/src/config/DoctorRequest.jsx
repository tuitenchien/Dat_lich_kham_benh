import { request } from './request';
import { apiClient } from './axiosClient';

const apiDoctors = '/api/doctors';

export const requestGetDoctors = async (params) => {
    const res = await apiClient.get(apiDoctors, { params });
    return res.data;
};

export const requestGetDoctorById = async (id) => {
    const res = await apiClient.get(`${apiDoctors}/${id}`);
    return res.data;
};

export const requestCreateDoctor = async (data) => {
    const res = await apiClient.post(apiDoctors, data);
    return res.data;
};

export const requestUpdateDoctor = async (id, data) => {
    const res = await apiClient.put(`${apiDoctors}/${id}`, data);
    return res.data;
};

export const requestDeleteDoctor = async (id) => {
    const res = await apiClient.delete(`${apiDoctors}/${id}`);
    return res.data;
};

export const requestUploadDoctorImage = async (formData) => {
    const res = await request.post(`${apiDoctors}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};
