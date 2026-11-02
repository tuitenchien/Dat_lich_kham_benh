import { apiClient } from './axiosClient';

const apiAppointments = '/api/appointments';

export const requestCreateAppointment = async (data) => {
    const res = await apiClient.post(apiAppointments, data);
    return res.data;
};

export const requestGetMyAppointments = async () => {
    const res = await apiClient.get(`${apiAppointments}/my`);
    return res.data;
};

export const requestCancelAppointment = async (id, cancelReason) => {
    const res = await apiClient.put(`${apiAppointments}/${id}/cancel`, { cancelReason });
    return res.data;
};

export const requestGetAllAppointments = async (params) => {
    const res = await apiClient.get(apiAppointments, { params });
    return res.data;
};

export const requestUpdateAppointmentStatus = async (id, status) => {
    const res = await apiClient.put(`${apiAppointments}/${id}/status`, { status });
    return res.data;
};

// ─── DOCTOR APPOINTMENTS API ──────────────────────────────────────────────────
export const requestGetDoctorAppointments = async (params) => {
    const res = await apiClient.get(`${apiAppointments}/doctor/my`, { params });
    return res.data;
};
