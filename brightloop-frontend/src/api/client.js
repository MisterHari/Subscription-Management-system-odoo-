import axios from 'axios';
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:3000/api',timeout:10000,withCredentials:true});
api.interceptors.request.use(config=>{const token=sessionStorage.getItem('brightloop_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config});
export const getResource=async name=>(await api.get('/'+name)).data;
export const createResource=async(name,data)=>(await api.post('/'+name,data)).data;
export const updateResource=async(name,id,data)=>(await api.patch('/'+name+'/'+id,data)).data;
export const deleteResource=async(name,id)=>(await api.delete('/'+name+'/'+id)).data;
// API paths are a suggested contract: adapt to your Express backend.
