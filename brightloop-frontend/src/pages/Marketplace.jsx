import React,{useEffect,useState} from 'react';
import {ShoppingBag,CheckCircle2,Package,RefreshCw} from 'lucide-react';
import {useAuth} from '../context/Auth';
import {useWorkspace} from '../context/Workspace';
import {snapshot,saveSnapshot,addPeriod} from '../data/engine';
import {Link} from 'react-router-dom';
const rupees=n=>'₹'+Number(n||0).toLocaleString('en-IN');
export default function Marketplace(){
 const {user}=useAuth(),{mode}=useWorkspace();const [data,setData]=useState(()=>snapshot()),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const customer=user?.role?.toLowerCase()==='customer';
 useEffect(()=>{const refresh=()=>setData(snapshot());window.addEventListener('brightloop-updated',refresh);return()=>window.removeEventListener('brightloop-updated',refresh)},[]);
 const today=new Date().toISOString().slice(0,10);
 const available=data.plans.filter(p=>(!p.available_from||p.available_from<=today)&&(!p.available_until||p.available_until>=today));
 const purchases=data.subscriptions.filter(s=>String(s.customer_id)===String(user?.customer_id));
 function buy(plan){setMessage('');if(!customer){setMessage('Only customer accounts can buy plans.');return}if(mode!=='demo'){setMessage('API mode checkout is not configured. Connect a secure backend purchase endpoint.');return}setBusy(true);try{
  const d=snapshot(),p=d.plans.find(x=>String(x.id)===String(plan.id));if(!p)throw Error('Plan is no longer available');const date=new Date().toISOString().slice(0,10);if((p.available_from&&date<p.available_from)||(p.available_until&&date>p.available_until))throw Error('This plan is unavailable');
  const id=Math.max(0,...d.subscriptions.map(s=>Number(s.id)||0))+1;const qty=Math.max(1,Number(p.minimum_quantity||1));const expiry=addPeriod(date,p.billing_frequency||'Monthly');
  d.subscriptions.push({id,subscription_number:'SUB-'+String(id).padStart(5,'0'),customer_id:user.customer_id,plan_id:p.id,product_id:p.product_id,start_date:date,expiry_date:expiry,status:'Active',quantity:qty,unit_price:Number(p.price||0),payment_terms:'Net 7',demo_purchase:true});saveSnapshot(d);setMessage('Activated! Your purchase is saved in My Subscriptions. No payment was collected.');
 }catch(e){setMessage(e.message)}finally{setBusy(false)}}
 return <div className="content"><section className="page-intro"><div><span className="eyebrow">BRIGHTLOOP / MARKETPLACE</span><h2>Explore & Buy</h2><p>Browse plans created by your admin. In demo mode, Buy Now activates a subscription immediately without payment.</p></div></section>
 {mode!=='demo'&&<p className="notice">Marketplace purchases require a backend endpoint in API mode.</p>}
 {message&&<p role="status" className="notice">{message}</p>}
 <div className="market-grid">{available.map(plan=>{const product=data.products.find(p=>String(p.id)===String(plan.product_id));return <article className="panel market-card" key={plan.id}><div className="market-icon"><ShoppingBag size={22}/></div><h3>{plan.name}</h3><p className="muted-text">{product?.name||'Subscription plan'}</p><div className="market-price">{rupees(plan.price)} <small>/ {String(plan.billing_frequency||'Monthly').toLowerCase()}</small></div><p className="muted-text">Minimum quantity: {plan.minimum_quantity||1}</p><button className="primary-btn" disabled={!customer||busy} onClick={()=>buy(plan)}><CheckCircle2 size={17}/> Buy Now</button></article>})}{!available.length&&<div className="panel market-card">No plans available yet. Ask an admin to create one.</div>}</div>
 <h3 style={{marginTop:32}}>Available products</h3><div className="market-grid">{data.products.map(product=><article className="panel market-card" key={product.id}><div className="market-icon"><Package size={22}/></div><h3>{product.name}</h3><p>{rupees(product.sales_price)}</p><p className="muted-text">{product.type||'Product'}</p><p className="muted-text">{available.some(p=>String(p.product_id)===String(product.id))?'Choose a plan above to activate this product.':'No subscription plan is available for this product yet.'}</p></article>)}</div>
 {customer&&<section className="panel market-card" style={{marginTop:28}}><h3>My purchased subscriptions ({purchases.length})</h3>{purchases.map(s=><p key={s.id}><RefreshCw size={15} style={{verticalAlign:'middle'}}/> {s.subscription_number} · {data.plans.find(p=>String(p.id)===String(s.plan_id))?.name||'Plan'} · <strong>{s.status}</strong></p>)}{!purchases.length&&<p className="muted-text">You haven't purchased any plans yet.</p>}<Link to="/subscriptions">View My Subscriptions</Link></section>}
 <p className="demo-note">Demo-only activation: purchases are stored in this browser, not charged to a payment method. For production, enforce ownership, checkout and persistence in PostgreSQL.</p></div>
}
