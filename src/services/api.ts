import axios from 'axios';

export const SESSION_STORAGE_KEY = "eventplus:session"
export const UNAUTHORIZED_EVENT = "eventplus:unauthorized"

export const axiosInstance = axios.create({
    baseURL: 'https://localhost:7266/api/',
    timeout: 15000,
    headers: {
        Accept: "application/json"
    }
});