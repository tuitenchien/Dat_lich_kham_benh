import { request } from './request';
import { apiClient } from './axiosClient';

const apiClinics = '/api/clinics';

export const requestGetClinics = async (params) => {
    const res = await apiClient.get(apiClinics, { params });
    return res.data;
};

export const requestGetClinicById = async (id) => {
    const res = await apiClient.get(`${apiClinics}/${id}`);
    return res.data;
};

export const requestCreateClinic = async (data) => {
    const res = await apiClient.post(apiClinics, data);
    return res.data;
};

export const requestUpdateClinic = async (id, data) => {
    const res = await apiClient.put(`${apiClinics}/${id}`, data);
    return res.data;
};

export const requestDeleteClinic = async (id) => {
    const res = await apiClient.delete(`${apiClinics}/${id}`);
    return res.data;
};

export const requestUploadClinicImage = async (formData) => {
    const res = await request.post(`${apiClinics}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};
