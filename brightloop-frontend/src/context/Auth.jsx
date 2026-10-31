import React,{createContext,useContext,useEffect,useState} from 'react';
import {api} from '../api/client';
const AuthContext=createContext(null);
const DEMO_ACCOUNTS={
 'test@cus.com':{password:'Text@1234',user:{id:'demo-customer',customer_id:1,name:'Test Customer',email:'test@cus.com',role:'customer'}},
 'admin@cus.com':{password:'Admin@1234',user:{id:'demo-admin',name:'Demo Admin',email:'admin@cus.com',role:'admin'}}
};
const SESSION_KEY='brightloop_demo_session';
const STAFF_KEY='brightloop_demo_staff_accounts';
const staffAccounts=()=>JSON.parse(localStorage.getItem(STAFF_KEY)||'{}');
export const useAuth=()=>useContext(AuthContext);
export default function AuthProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>{let live=true;const saved=sessionStorage.getItem(SESSION_KEY);if(saved){try{const session=JSON.parse(saved);if(live){const account={...DEMO_ACCOUNTS,...staffAccounts()}[session.email];if(account)setUser(account.user)}}catch{}if(live)setLoading(false);return()=>{live=false}}api.get('/auth/me').then(({data})=>{if(live)setUser(data.user??data)}).catch(()=>{}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[]);
 async function login(email,password){const normalized=email.trim().toLowerCase();const demo={...DEMO_ACCOUNTS,...staffAccounts()}[normalized];if(demo){if(demo.password!==password)throw Error('Incorrect email or password.');sessionStorage.setItem(SESSION_KEY,JSON.stringify({email:normalized}));setUser(demo.user);return demo.user}const {data}=await api.post('/auth/login',{email,password});sessionStorage.removeItem(SESSION_KEY);setUser(data.user);return data.user}
 async function signup(payload){if({...DEMO_ACCOUNTS,...staffAccounts()}[payload.email.trim().toLowerCase()])throw Error('This email is reserved for a demo account.');const {data}=await api.post('/auth/signup',payload);return data}
 async function logout(){const demo=!!sessionStorage.getItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);try{if(!demo)await api.post('/auth/logout')}finally{setUser(null)}}
 return <AuthContext.Provider value={{user,loading,login,signup,logout,isDemoAccount:!!user&&!!sessionStorage.getItem(SESSION_KEY)}}>{children}</AuthContext.Provider>
}
