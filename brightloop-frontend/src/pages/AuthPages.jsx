import React,{useState} from 'react';
import {Link,useNavigate,useSearchParams} from 'react-router-dom';
import {useAuth} from '../context/Auth';
import {api} from '../api/client';
import {Layers3,CalendarClock,ReceiptText,ChartNoAxesCombined,ShieldCheck,ArrowRight,Eye,EyeOff} from 'lucide-react';
const errorMessage=e=>e.response?.data?.message||e.message||'Request failed. Check your details and try again.';
function Frame({title,subtitle,children}){return <main className="auth-screen"><section className="auth-card"><div className="auth-logo">✦ brightloop<span className="accent">.</span></div><h1>{title}</h1><p>{subtitle}</p>{children}</section></main>}
function Notice({error,success}){return <>{error&&<div role="alert" className="auth-error">{error}</div>}{success&&<div role="status" className="auth-success">{success}</div>}</>}
function PasswordInput({value,onChange,autoComplete='current-password',placeholder='Enter your password',required=true,minLength}){const [visible,setVisible]=useState(false);return <span className="password-wrap"><input type={visible?'text':'password'} autoComplete={autoComplete} placeholder={placeholder} required={required} minLength={minLength} value={value} onChange={onChange}/><button className="password-eye" type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?'Hide password':'Show password'} aria-pressed={visible}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></span>}
export function Login(){
  const {login}=useAuth(),nav=useNavigate();
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function submit(e){e.preventDefault();setError('');setBusy(true);try{await login(email,password);nav(email.trim().toLowerCase()==='test@cus.com'?'/subscriptions':'/',{replace:true})}catch(e){setError(errorMessage(e))}finally{setBusy(false)}}
  const features=[
    {Icon:CalendarClock,title:'Subscription management',description:'Manage customers, plans, renewals and subscriptions.'},
    {Icon:ReceiptText,title:'Recurring billing',description:'Organize invoices, payments, taxes and discounts.'},
    {Icon:ChartNoAxesCombined,title:'Financial visibility',description:'See revenue, outstanding balances and overdue invoices.'}
  ];
  return <main className="login-split">
    <section className="login-story" aria-label="About Brightloop">
      <div className="login-brand"><Layers3 size={28}/> <span>brightloop<span className="accent">.</span></span></div>
      <div className="login-story-body">
        <div className="login-eyebrow"><span className="login-spark"/> SUBSCRIPTION MANAGEMENT PLATFORM</div>
        <h1>One platform.<br/><span>Every subscription.</span></h1>
        <p className="login-description">Brightloop helps teams manage subscriptions, simplify recurring billing, track payments and understand their finances — all in one place.</p>
        <div className="login-feature-list">{features.map(({Icon,title,description})=><div className="login-feature" key={title}><div className="login-feature-icon"><Icon size={21}/></div><div><strong>{title}</strong><p>{description}</p></div></div>)}</div>
      </div>
      <div className="login-story-footer"><ShieldCheck size={17}/> Designed for admins, teams and customers</div>
      <div className="login-orb login-orb-one"/><div className="login-orb login-orb-two"/>
    </section>
    <section className="login-form-panel"><div className="auth-card login-auth-card">
      <div className="login-form-eyebrow">WELCOME BACK</div>
      <h1>Login to Brightloop</h1><p>Access your subscriptions, invoices and billing workspace.</p>
      <form onSubmit={submit}>
        <label className="auth-field">Email address<input type="email" autoComplete="email" placeholder="Enter your email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <label className="auth-field">Password<PasswordInput value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <div className="auth-right"><Link to="/forgot-password">Forgot password?</Link></div>
        <Notice error={error}/>
        <button className="primary-btn auth-submit login-submit" disabled={busy}>{busy?'Logging in…':<>Login <ArrowRight size={18}/></>}</button>
      </form>
      <p className="auth-foot">New customer? <Link to="/signup">Create an account</Link></p>
    </div></section>
  </main>
}
export function Signup(){const {signup}=useAuth(),nav=useNavigate(),[form,setForm]=useState({name:'',email:'',password:'',confirm:''}),[error,setError]=useState(''),[busy,setBusy]=useState(false);const set=(k,v)=>setForm(f=>({...f,[k]:v}));async function submit(e){e.preventDefault();if(form.password!==form.confirm){setError('Passwords do not match.');return}if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/.test(form.password)){setError('Use more than 8 characters, uppercase, lowercase and a special character.');return}setBusy(true);setError('');try{await signup({name:form.name,email:form.email,password:form.password});nav('/login',{state:{registered:true}})}catch(e){setError(errorMessage(e))}finally{setBusy(false)}}return <Frame title="Create your account" subtitle="Customer registration. Staff accounts are created by an administrator."><form onSubmit={submit}><label className="auth-field">Name<input required value={form.name} onChange={e=>set('name',e.target.value)}/></label><label className="auth-field">Email<input type="email" autoComplete="email" required value={form.email} onChange={e=>set('email',e.target.value)}/></label><label className="auth-field">Password<PasswordInput autoComplete="new-password" minLength={9} value={form.password} onChange={e=>set('password',e.target.value)}/></label><label className="auth-field">Confirm password<PasswordInput autoComplete="new-password" value={form.confirm} onChange={e=>set('confirm',e.target.value)}/></label><Notice error={error}/><button className="primary-btn auth-submit" disabled={busy}>{busy?'Creating…':'Create account'}</button></form><p className="auth-foot">Already registered? <Link to="/login">Login</Link></p></Frame>}
export function ForgotPassword(){const [email,setEmail]=useState(''),[error,setError]=useState(''),[success,setSuccess]=useState(''),[busy,setBusy]=useState(false);async function submit(e){e.preventDefault();setBusy(true);setError('');try{await api.post('/auth/forgot-password',{email});setSuccess('If this email is registered, a password reset link will arrive shortly.')}catch(e){setError('Could not submit the request. Please try again.')}finally{setBusy(false)}}return <Frame title="Reset your password" subtitle="Enter the email you used to register. We'll send a reset link."><form onSubmit={submit}><label className="auth-field">Registered email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><Notice error={error} success={success}/><button disabled={busy} className="primary-btn auth-submit">{busy?'Sending…':'Send reset link'}</button></form><p className="auth-foot"><Link to="/login">Back to login</Link></p></Frame>}
export function ResetPassword(){const [params]=useSearchParams(),token=params.get('token'),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[success,setSuccess]=useState(''),[busy,setBusy]=useState(false);async function submit(e){e.preventDefault();if(password!==confirm){setError('Passwords do not match.');return}if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/.test(password)){setError('Password needs more than 8 characters, uppercase, lowercase and a special character.');return}setBusy(true);setError('');try{await api.post('/auth/reset-password',{token,password});setSuccess('Password changed. You can sign in now.')}catch(e){setError(errorMessage(e))}finally{setBusy(false)}}return <Frame title="Choose a new password" subtitle="This link can be used once before it expires.">{!token?<Notice error="Missing reset token. Request a new link."/>:<form onSubmit={submit}><label className="auth-field">New password<PasswordInput autoComplete="new-password" minLength={9} value={password} onChange={e=>setPassword(e.target.value)}/></label><label className="auth-field">Confirm new password<PasswordInput autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><Notice error={error} success={success}/><button className="primary-btn auth-submit" disabled={busy||!!success}>{busy?'Saving…':'Update password'}</button></form>}<p className="auth-foot"><Link to="/login">Return to login</Link></p></Frame>}
