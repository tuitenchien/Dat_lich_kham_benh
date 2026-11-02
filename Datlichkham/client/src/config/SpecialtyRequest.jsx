import { request } from './request';
import { apiClient } from './axiosClient';

const apiSpecialties = '/api/specialties';

export const requestGetSpecialties = async (params) => {
    const res = await apiClient.get(apiSpecialties, { params });
    return res.data;
};

export const requestCreateSpecialty = async (data) => {
    const res = await apiClient.post(apiSpecialties, data);
    return res.data;
};

export const requestUpdateSpecialty = async (id, data) => {
    const res = await apiClient.put(`${apiSpecialties}/${id}`, data);
    return res.data;
};

export const requestDeleteSpecialty = async (id) => {
    const res = await apiClient.delete(`${apiSpecialties}/${id}`);
    return res.data;
};

export const requestUploadSpecialtyImage = async (formData) => {
    const res = await request.post(`${apiSpecialties}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};
