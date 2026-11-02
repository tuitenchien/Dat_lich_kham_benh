import { apiClient } from './axiosClient';

const apiReviews = '/api/reviews';

export const requestCreateReview = async (data) => {
    const res = await apiClient.post(apiReviews, data);
    return res.data;
};

export const requestGetDoctorReviews = async (doctorId) => {
    const res = await apiClient.get(`${apiReviews}/doctor/${doctorId}`);
    return res.data;
};

export const requestGetMyReviews = async () => {
    const res = await apiClient.get(`${apiReviews}/my`);
    return res.data;
};
