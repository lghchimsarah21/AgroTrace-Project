import axios, { AxiosInstance } from "axios";


export const API_BASE_URL: string = "http://localhost:9192"

const api: AxiosInstance = axios.create({baseURL:API_BASE_URL})

export default api;