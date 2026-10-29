import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { ShoppingBag, Coffee, Search, Plus, Minus, X, ArrowLeft, Menu, ShieldCheck, Package, LogOut, RefreshCw, Instagram, MessageCircle, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import './style.css';

const CONFIG = {
  brand: 'ROASTERA',
  email: 'roastera.aleppo@gmail.com',
  whatsapp: '963993236108',
  currency: 'ل.س',
};
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const initialProducts = [
  {id:'signature',name:'خلطة روستيرا',subtitle:'Signature Blend',description:'خلطة متوازنة برائحة غنية ونهاية ناعمة، مناسبة لبداية يوم مختلف.',price:85000,weight:'250 غ',category:'خلطاتنا',badge:'اختيارنا',image:'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=85',active:true,stock:20},
  {id:'espresso',name:'إسبريسو داكن',subtitle:'Dark Espresso',description:'تحميص غني وقوام ممتلئ لمحبي الإسبريسو والنكهات العميقة.',price:95000,weight:'250 غ',category:'إسبريسو',badge:'قوي وغني',image:'https://images.unsplash.com/photo-1510707577719-ae7c14805e76?auto=format&fit=crop&w=900&q=85',active:true,stock:15},
  {id:'ethiopia',name:'إثيوبيا المختارة',subtitle:'Ethiopia Select',description:'طابع عطري ولمسات فاكهية لطيفة لعشاق القهوة المختصة.',price:110000,weight:'250 غ',category:'قهوة مختصة',badge:'مختصة',image:'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=85',active:true,stock:12},
  {id:'daily',name:'قهوة كل يوم',subtitle:'Everyday Coffee',description:'قهوة يومية متوازنة، سهلة التحضير ومناسبة لكل الأوقات.',price:140000,weight:'500 غ',category:'خلطاتنا',badge:'للاستخدام اليومي',image:'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=85',active:true,stock:25},
  {id:'decaf',name:'منزوعة الكافيين',subtitle:'Decaf Roast',description:'نكهة القهوة التي تحبها مع كافيين أقل، لتحضير مسائي هادئ.',price:105000,weight:'250 غ',category:'قهوة مختصة',badge:'كافيين أقل',image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',active:true,stock:8},
  {id:'gift',name:'صندوق القهوة',subtitle:'Coffee Gift Box',description:'هدية أنيقة لمحبي القهوة. تفاصيل المحتويات والسعر النهائي تؤكد عبر واتساب.',price:180000,weight:'صندوق هدايا',category:'هدايا',badge:'هدية مميزة',image:'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=900&q=85',active:true,stock:5}
];

function money(n){ return new Intl.NumberFormat('ar-SY').format(Number(n)||0)+' '+CONFIG.currency; }
function waUrl(message){ return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`; }
function useProducts(){
  const [products,setProducts]=useState(initialProducts);
  const [loading,setLoading]=useState(false);
  const [notice,setNotice]=useState('');
  const refresh=async()=>{
    if(!supabase){setNotice('المتجر يعمل ببيانات تجريبية فقط. اربط Supabase لتفعيل قاعدة البيانات.');return;}
    setLoading(true);
    const {data,error}=await supabase.from('products').select('*').eq('active',true).order('created_at',{ascending:true});
    if(error){setNotice('تعذّر تحميل المنتجات من قاعدة البيانات. تأكد من تنفيذ ملف supabase/schema.sql.');}
    else if(data?.length){setProducts(data);}
    else {setNotice('قاعدة البيانات متصلة لكن لا توجد منتجات بعد. أضف المنتجات من لوحة الإدارة.');}
    setLoading(false);
  };
  useEffect(()=>{refresh();},[]);
  return {products,setProducts,loading,notice,refresh};
}

function Header({count,onCart,onAdmin}){
  const [open,setOpen]=useState(false);
  return <header className="header"><div className="nav container">
    <button className="icon-btn mobile-menu" aria-label="القائمة" onClick={()=>setOpen(!open)}><Menu/></button>
    <a className="brand" href="#home" aria-label="ROASTERA"><span className="brand-mark"><Coffee size={23}/></span><span><b>ROASTERA</b><small>COFFEE, CRAFTED</small></span></a>
    <nav className={open?'nav-links open':'nav-links'}><a href="#shop" onClick={()=>setOpen(false)}>المتجر</a><a href="#story" onClick={()=>setOpen(false)}>قصتنا</a><a href="#contact" onClick={()=>setOpen(false)}>تواصل معنا</a></nav>
    <div className="nav-actions"><button className="admin-shortcut" onClick={onAdmin}>لوحة الإدارة</button><button className="cart-btn" onClick={onCart}><ShoppingBag size={18}/><span>السلة</span><b>{count}</b></button></div>
  </div></header>
}

function ProductCard({product,onAdd,onDetails}){
  return <article className="product-card">
    <button className="product-image" onClick={()=>onDetails(product)} aria-label={`تفاصيل ${product.name}`}>
      <img src={product.image} alt={product.name} loading="lazy" onError={e=>{e.currentTarget.src='https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80'}}/>
      {product.badge&&<span className="badge">{product.badge}</span>}
      <span className="image-arrow"><ArrowLeft size={18}/></span>
    </button>
    <div className="product-info"><div className="product-meta"><span>{product.category||'قهوة مختارة'}</span><span>{product.weight||'250 غ'}</span></div>
      <button className="product-title" onClick={()=>onDetails(product)}><h3>{product.name}</h3><small>{product.subtitle||''}</small></button>
      <p className="product-description">{product.description}</p>
      <div className="product-bottom"><strong>{money(product.price)}</strong><button className="add-btn" onClick={()=>onAdd(product)} disabled={Number(product.stock)===0}><Plus size={17}/><span>{Number(product.stock)===0?'نفد المخزون':'أضف للسلة'}</span></button></div>
    </div>
  </article>
}

function Modal({children,onClose,wide=false}){
  useEffect(()=>{const fn=e=>e.key==='Escape'&&onClose();window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn)},[onClose]);
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className={`modal ${wide?'modal-wide':''}`}><button className="modal-close icon-btn" onClick={onClose} aria-label="إغلاق"><X/></button>{children}</section></div>
}

function ProductDetails({product,onClose,onAdd}){
  return <Modal onClose={onClose}><div className="details-image"><img src={product.image} alt={product.name}/></div><span className="eyebrow">{product.subtitle||'ROASTERA SELECTION'}</span><h2>{product.name}</h2><p className="detail-copy">{product.description}</p><div className="details-facts"><span>الوزن <b>{product.weight||'250 غ'}</b></span><span>التصنيف <b>{product.category||'خلطاتنا'}</b></span></div><div className="details-buy"><strong>{money(product.price)}</strong><button className="btn btn-primary" disabled={Number(product.stock)===0} onClick={()=>{onAdd(product);onClose()}}>أضف للسلة <ShoppingBag size={17}/></button></div><p className="tiny-note">يتم تأكيد توفر المنتج وتفاصيل التوصيل عبر واتساب قبل تثبيت الطلب.</p></Modal>
}

function CartDrawer({cart,onClose,onChange,onCheckout}){
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  return <div className="drawer-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><aside className="drawer"><div className="drawer-head"><div><span className="eyebrow">YOUR SELECTION</span><h2>سلة مشترياتك</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div>
    {!cart.length?<div className="empty"><ShoppingBag size={40}/><h3>السلة لسا فاضية</h3><p>اختار قهوتك المفضلة وخلي الباقي علينا.</p><button className="btn btn-primary" onClick={onClose}>تصفّح المنتجات</button></div>:
    <><div className="cart-items">{cart.map(item=><div className="cart-item" key={item.id}><img src={item.image} alt=""/><div className="cart-item-main"><b>{item.name}</b><small>{money(item.price)}</small><div className="qty"><button onClick={()=>onChange(item.id,-1)}><Minus size={14}/></button><span>{item.qty}</span><button onClick={()=>onChange(item.id,1)}><Plus size={14}/></button></div></div><button className="remove" onClick={()=>onChange(item.id,-item.qty)} aria-label="حذف"><X size={16}/></button></div>)}</div><div className="cart-summary"><div><span>المجموع التقديري</span><strong>{money(total)}</strong></div><p>التوصيل وتوفر المنتجات يتم تأكيدهما قبل تثبيت الطلب.</p><button className="btn btn-primary full" onClick={onCheckout}>متابعة الطلب <ArrowLeft size={17}/></button></div></>}
  </aside></div>
}

function Checkout({cart,onClose,onSubmit,submitting}){
  const [form,setForm]=useState({name:'',phone:'',city:'حلب',address:'',notes:''});
  const [error,setError]=useState('');
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  const update=(k,v)=>setForm(p=>({...p,[k]:v}));
  async function submit(e){e.preventDefault();setError('');if(!form.name.trim()||!form.phone.trim()||!form.address.trim()){setError('عبّي الاسم ورقم الهاتف والعنوان لنقدر نتابع طلبك.');return;}if(!cart.length){setError('السلة فارغة.');return;}const result=await onSubmit(form);if(result?.error)setError(result.error);}
  return <Modal onClose={onClose} wide><span className="eyebrow">ONE MORE STEP</span><h2>تفاصيل الطلب</h2><p className="muted">سجّل معلوماتك، وبعد حفظ الطلب رح نفتح واتساب لتأكيده مع فريق ROASTERA.</p>
    <form className="checkout-form" onSubmit={submit}><div className="field"><label>الاسم الكامل *</label><input value={form.name} onChange={e=>update('name',e.target.value)} required maxLength="100" placeholder="اسمك الكامل"/></div><div className="field"><label>رقم الهاتف *</label><input value={form.phone} onChange={e=>update('phone',e.target.value)} required maxLength="30" inputMode="tel" placeholder="09xxxxxxxx"/></div><div className="field"><label>المدينة</label><input value={form.city} onChange={e=>update('city',e.target.value)} maxLength="80"/></div><div className="field"><label>العنوان بالتفصيل *</label><input value={form.address} onChange={e=>update('address',e.target.value)} required maxLength="300" placeholder="الحي، الشارع، أقرب نقطة دالة"/></div><div className="field full-field"><label>ملاحظات (اختياري)</label><textarea value={form.notes} onChange={e=>update('notes',e.target.value)} maxLength="500" rows="3" placeholder="أي ملاحظة عن الطلب أو التوصيل"/></div>
    <div className="order-total full-field"><span>المجموع التقديري للمنتجات</span><b>{money(total)}</b></div><p className="tiny-note full-field">لن يتم الدفع على الموقع. سيتم تأكيد السعر النهائي والتوصيل عبر واتساب. لا تضغط إرسال الطلب أكثر من مرة أثناء الانتظار.</p>
    {error&&<div className="error-note full-field"><AlertCircle size={17}/>{error}</div>}<button className="btn btn-primary full full-field" disabled={submitting}>{submitting?'عم نحفظ طلبك...':'حفظ الطلب والمتابعة إلى واتساب'} <MessageCircle size={18}/></button></form>
  </Modal>
}

function Admin({onClose,products,refreshProducts}){
  const [session,setSession]=useState(null),[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [orders,setOrders]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[tab,setTab]=useState('orders');
  const [edit,setEdit]=useState(null);
  useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data})=>setSession(data.session));const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>subscription.unsubscribe()},[]);
  async function login(e){e.preventDefault();setError('');if(!supabase){setError('اربط Supabase أولاً بإضافة متغيرات البيئة في الاستضافة.');return;}const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)setError('تعذّر الدخول. تحقق من بيانات حساب الإدارة في Supabase.');else setSession(data.session);}
  async function loadOrders(){if(!supabase||!session)return;setLoading(true);setError('');const {data,error}=await supabase.from('orders').select('id,order_number,customer_name,phone,city,address,notes,total,status,created_at,order_items(id,product_name,quantity,unit_price)').order('created_at',{ascending:false}).limit(100);if(error)setError('تعذّر تحميل الطلبات. تأكد من صلاحيات الإدارة في SQL.');else setOrders(data||[]);setLoading(false);}
  useEffect(()=>{if(session)loadOrders()},[session]);
  async function statusChange(id,status){const {error}=await supabase.from('orders').update({status}).eq('id',id);if(error)setError('ما قدرنا نغيّر حالة الطلب.');else loadOrders();}
  async function saveProduct(e){e.preventDefault();if(!supabase)return;const payload={name:edit.name,subtitle:edit.subtitle||'',description:edit.description||'',price:Number(edit.price),weight:edit.weight||'250 غ',category:edit.category||'خلطاتنا',badge:edit.badge||'',image:edit.image,active:edit.active!==false,stock:Number(edit.stock||0)};let result;if(edit.id&&typeof edit.id==='string'&&edit.id.length>20){result=await supabase.from('products').update(payload).eq('id',edit.id)}else{result=await supabase.from('products').insert(payload)}if(result.error){setError('تعذّر حفظ المنتج. تأكد من الصلاحيات والحقول.');return;}setEdit(null);await refreshProducts();setError('تم حفظ المنتج.');}
  async function deleteProduct(id){if(!confirm('متأكد بدك تحذف المنتج؟'))return;const {error}=await supabase.from('products').update({active:false}).eq('id',id);if(error)setError('تعذّر إخفاء المنتج.');else refreshProducts();}
  return <Modal onClose={onClose} wide><div className="admin-head"><div><span className="eyebrow">PRIVATE WORKSPACE</span><h2>لوحة إدارة ROASTERA</h2></div>{session&&<button className="btn btn-outline small" onClick={async()=>{await supabase.auth.signOut();setSession(null)}}><LogOut size={16}/> خروج</button>}</div>
    {!supabase?<div className="notice"><AlertCircle/ ><span>قاعدة البيانات غير مربوطة بعد. أضف متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في الاستضافة.</span></div>:!session?<form className="login-form" onSubmit={login}><p className="muted">الدخول متاح لحساب الإدارة الذي أنشأته في Supabase Auth. لا يوجد حساب افتراضي.</p><div className="field"><label>البريد الإلكتروني</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder={CONFIG.email}/></div><div className="field"><label>كلمة المرور</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></div>{error&&<p className="error-note">{error}</p>}<button className="btn btn-primary full">دخول آمن</button></form>:
    <><div className="admin-tabs"><button className={tab==='orders'?'active':''} onClick={()=>setTab('orders')}>الطلبات ({orders.length})</button><button className={tab==='products'?'active':''} onClick={()=>setTab('products')}>المنتجات</button><button className="refresh-btn" onClick={()=>tab==='orders'?loadOrders():refreshProducts()}><RefreshCw size={15}/> تحديث</button></div>
    {error&&<p className="notice">{error}</p>}
    {tab==='orders'?<div className="orders-list">{loading?<p>عم نحمل الطلبات...</p>:orders.length===0?<div className="empty compact"><Package size={34}/><h3>ما في طلبات لسا</h3><p>الطلبات الجديدة رح تظهر هون بعد ربط قاعدة البيانات.</p></div>:orders.map(o=><article className="order-card" key={o.id}><div className="order-top"><div><b>طلب #{o.order_number}</b><small>{new Date(o.created_at).toLocaleString('ar-SY')}</small></div><strong>{money(o.total)}</strong></div><div className="order-customer"><b>{o.customer_name}</b><span>{o.phone} · {o.city}</span><span>{o.address}</span>{o.notes&&<small>ملاحظة: {o.notes}</small>}</div><ul className="order-products">{(o.order_items||[]).map(i=><li key={i.id}>{i.product_name} × {i.quantity} <span>{money(i.unit_price*i.quantity)}</span></li>)}</ul><div className="order-actions"><a className="btn btn-outline small" href={waUrl(`مرحباً ${o.customer_name}، بخصوص طلبك #${o.order_number} من ROASTERA. المجموع التقديري ${money(o.total)}. نود تأكيد التفاصيل معك.`)} target="_blank" rel="noreferrer"><MessageCircle size={15}/> واتساب</a><select value={o.status} onChange={e=>statusChange(o.id,e.target.value)} aria-label="حالة الطلب"><option value="new">جديد</option><option value="confirmed">تم التأكيد</option><option value="preparing">قيد التحضير</option><option value="delivered">تم التسليم</option><option value="cancelled">ملغي</option></select></div></article>)}</div>:
    <><div className="product-admin-list">{products.map(p=><div className="admin-product" key={p.id}><img src={p.image} alt=""/><div><b>{p.name}</b><small>{money(p.price)} · مخزون {p.stock}</small></div><button className="btn btn-outline small" onClick={()=>setEdit({...p})}>تعديل</button><button className="remove" onClick={()=>deleteProduct(p.id)} title="إخفاء">إخفاء</button></div>)}</div><button className="btn btn-primary full" onClick={()=>setEdit({name:'',subtitle:'',description:'',price:0,weight:'250 غ',category:'خلطاتنا',badge:'',image:'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80',active:true,stock:0})}><Plus size={17}/> إضافة منتج</button></>}
    </>}
    {edit&&<div className="inline-edit"><h3>{edit.id?'تعديل المنتج':'إضافة منتج جديد'}</h3><form className="checkout-form" onSubmit={saveProduct}>{[['name','اسم المنتج'],['subtitle','الاسم الإنجليزي'],['price','السعر بالليرة السورية'],['weight','الوزن'],['category','التصنيف'],['badge','شارة المنتج'],['image','رابط صورة المنتج'],['stock','الكمية المتوفرة']].map(([k,label])=><div className="field" key={k}><label>{label}</label><input required={['name','price','image'].includes(k)} type={['price','stock'].includes(k)?'number':'text'} value={edit[k]??''} onChange={e=>setEdit(p=>({...p,[k]:e.target.value}))}/></div>)}<div className="field full-field"><label>الوصف</label><textarea value={edit.description||''} onChange={e=>setEdit(p=>({...p,description:e.target.value}))}/></div><div className="field full-field"><label><input type="checkbox" checked={edit.active!==false} onChange={e=>setEdit(p=>({...p,active:e.target.checked}))}/> المنتج ظاهر في المتجر</label></div><button className="btn btn-primary">حفظ المنتج</button><button type="button" className="btn btn-outline" onClick={()=>setEdit(null)}>إلغاء</button></form></div>}
  </Modal>
}

function App(){
  const {products,setProducts,loading,notice,refresh}=useProducts();
  const [cart,setCart]=useState([]),[showCart,setShowCart]=useState(false),[checkout,setCheckout]=useState(false),[admin,setAdmin]=useState(false),[detail,setDetail]=useState(null);
  const [search,setSearch]=useState(''),[category,setCategory]=useState('الكل'),[toast,setToast]=useState(''),[submitting,setSubmitting]=useState(false),[success,setSuccess]=useState(null);
  const categories=['الكل',...new Set(products.map(p=>p.category).filter(Boolean))];
  const filtered=useMemo(()=>products.filter(p=>(category==='الكل'||p.category===category)&&`${p.name} ${p.subtitle||''} ${p.description||''}`.toLowerCase().includes(search.toLowerCase())),[products,category,search]);
  const count=cart.reduce((s,x)=>s+x.qty,0);
  function add(p){if(Number(p.stock)===0){setToast('هذا المنتج غير متوفر حالياً.');return;}setCart(old=>{const found=old.find(x=>x.id===p.id);if(found)return old.map(x=>x.id===p.id?{...x,qty:Math.min(x.qty+1,Number(p.stock)||99)}:x);return [...old,{...p,qty:1}]});setToast(`انضاف ${p.name} للسلة`);setTimeout(()=>setToast(''),2500);}
  function change(id,delta){setCart(old=>old.map(x=>x.id===id?{...x,qty:x.qty+delta}:x).filter(x=>x.qty>0));}
  function beginCheckout(){setShowCart(false);setCheckout(true);}
  async function submitOrder(form){
    if(!supabase)return {error:'الموقع غير مربوط بقاعدة بيانات بعد، لذلك لم يتم حفظ الطلب. أكمل إعداد Supabase أولاً.'};
    setSubmitting(true);
    try{
      const {data,error}=await supabase.rpc('create_order',{p_customer_name:form.name.trim(),p_phone:form.phone.trim(),p_city:form.city.trim(),p_address:form.address.trim(),p_notes:form.notes.trim(),p_items:cart.map(x=>({product_id:x.id,quantity:x.qty}))});
      if(error){console.error(error);return {error:'ما قدرنا نحفظ الطلب. تأكد من تنفيذ ملف SQL في Supabase وأن المنتجات موجودة. لم يتم إرسال تأكيد كاذب.'};}
      const order=data?.[0]||data;
      if(!order?.order_number){return {error:'لم نستلم رقم طلب واضح من قاعدة البيانات. راجع لوحة الإدارة قبل إعادة الإرسال.'};}
      const lines=cart.map(x=>`• ${x.name} × ${x.qty} = ${money(x.price*x.qty)}`).join('\n');
      const message=`مرحباً ROASTERA، بدي أكد طلبي رقم ${order.order_number}.\n\n${lines}\n\nالمجموع التقديري: ${money(order.total)}\nالاسم: ${form.name}\nالهاتف: ${form.phone}\nالمدينة: ${form.city}\nالعنوان: ${form.address}${form.notes?'\nملاحظات: '+form.notes:''}\n\nيرجى تأكيد التوفر وأجرة التوصيل.`;
      setSuccess({number:order.order_number,total:order.total,wa:waUrl(message)});
      setCart([]);setCheckout(false);
      return {};
    }catch(e){console.error(e);return {error:'حدث خطأ غير متوقع. لم نتمكن من تأكيد حفظ الطلب.'};}
    finally{setSubmitting(false);}
  }
  return <><Header count={count} onCart={()=>setShowCart(true)} onAdmin={()=>setAdmin(true)}/>
    <main>
      <section className="hero" id="home"><div className="hero-grain"></div><div className="hero-content container"><div className="hero-copy"><span className="eyebrow light"><span className="gold-dot"></span> قهوة مختارة بعناية</span><h1>كل فنجان،<br/><em>إله حكاية.</em></h1><p>من أول رائحة البنّ، لآخر رشفة. اكتشف قهوة منتقاة بعناية، ومحمّصة لتصنع لحظتك الخاصة.</p><div className="hero-actions"><a className="btn btn-gold" href="#shop">اكتشف القهوة <ArrowLeft size={18}/></a><a className="text-link" href="#story">قصتنا <span>↙</span></a></div><div className="hero-trust"><span><CheckCircle2 size={16}/> اختيار بعناية</span><span><CheckCircle2 size={16}/> تأكيد مباشر للطلب</span></div></div><div className="hero-visual"><div className="hero-ring"></div><img src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1100&q=90" alt="حبوب قهوة مختارة" onError={e=>e.currentTarget.style.display='none'}/><div className="hero-stamp"><Coffee size={24}/><span>BREWED<br/>WITH CARE</span></div><div className="hero-caption"><span>01 / 06</span><span>THE ROASTERA SELECTION</span></div></div></div><div className="hero-bottom container"><span>ROASTED WITH INTENTION</span><span className="hero-bottom-line"></span><span>حلب، سوريا</span></div></section>
      <section className="intro-strip"><div className="container intro-grid"><div><span className="eyebrow">OUR PROMISE</span><h2>التفاصيل الصغيرة،<br/>بتصنع الفرق الكبير.</h2></div><p>نؤمن أن القهوة مو مجرد مشروب. هي استراحة، لقاء، وبداية حلوة. لذلك اخترنا هوية بسيطة، ونكهة تستحق أن ترجع إلها كل يوم.</p><div className="intro-number"><b>R.</b><span>ROASTERA<br/>COFFEE HOUSE</span></div></div></section>
      <section className="shop-section section-pad" id="shop"><div className="container"><div className="section-heading"><div><span className="eyebrow">THE COLLECTION</span><h2>اختار مزاجك.</h2><p>مجموعة مختارة لترافق لحظاتك، من أول الصبح لآخر النهار.</p></div><div className="searchbox"><Search size={18}/><input placeholder="دوّر على قهوتك..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div><div className="filters">{categories.map(c=><button key={c} className={category===c?'filter active':'filter'} onClick={()=>setCategory(c)}>{c}</button>)}</div>
      {notice&&<div className="notice"><AlertCircle size={17}/>{notice}</div>}
      {loading?<div className="loading">عم نجهّز القهوة...</div>:filtered.length?<div className="product-grid">{filtered.map(p=><ProductCard key={p.id} product={p} onAdd={add} onDetails={setDetail}/>)}</div>:<div className="empty compact"><Coffee size={32}/><h3>ما لقينا هالمنتج</h3><p>جرّب كلمة ثانية أو غيّر التصنيف.</p></div>}
      <div className="shop-note"><ShieldCheck size={18}/><span>كل الطلبات تحتاج تأكيداً عبر واتساب قبل اعتماد السعر النهائي والتوصيل.</span></div></div></section>
      <section className="story-section" id="story"><div className="container story-grid"><div className="story-image"><img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85" alt="تحضير القهوة"/><span className="story-label">SLOW DOWN. SIP WELL.</span></div><div className="story-copy"><span className="eyebrow">A LITTLE ABOUT US</span><h2>القهوة الجيدة<br/><em>بتبدأ من الاهتمام.</em></h2><p>ROASTERA مساحة لكل شخص بيحب يختار قهوته على مهله. نهتم بالتفاصيل، من اختيار البنّ إلى الطريقة اللي بتوصلك فيها تجربتك.</p><p>عم نبني حكايتنا فنجان ورا فنجان، وبيسعدنا تكون جزء منها.</p><a href={waUrl('مرحباً ROASTERA، حابب أعرف أكتر عن منتجاتكم.')} target="_blank" rel="noreferrer" className="text-link dark">احكي معنا <ArrowLeft size={16}/></a></div></div></section>
      <section className="cta-section"><div className="container cta-inner"><div><span className="eyebrow light">YOUR NEXT FAVORITE CUP</span><h2>فنجانك الجاي<br/><em>ناطرَك.</em></h2></div><a className="btn btn-gold" href="#shop">تصفّح المجموعة <ArrowLeft size={18}/></a><div className="cta-deco"><Coffee size={100}/></div></div></section>
    </main>
    <footer id="contact" className="footer"><div className="container"><div className="footer-main"><div className="footer-brand"><a className="brand brand-light" href="#home"><span className="brand-mark"><Coffee size={23}/></span><span><b>ROASTERA</b><small>COFFEE, CRAFTED</small></span></a><p>قهوة مختارة بعناية، للحظات بتستحق التمهّل.</p></div><div><h4>روابط سريعة</h4><a href="#shop">المتجر</a><a href="#story">قصتنا</a><button className="footer-link" onClick={()=>setAdmin(true)}>لوحة الإدارة</button></div><div><h4>تواصل معنا</h4><a href={waUrl('مرحباً ROASTERA، حابب أتواصل معكم.')} target="_blank" rel="noreferrer"><MessageCircle size={16}/> واتساب الشركة</a><a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a><span className="footer-city">حلب، سوريا</span></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ROASTERA. جميع الحقوق محفوظة.</span><span>MADE FOR COFFEE PEOPLE <Coffee size={14}/></span></div></div></footer>
    <a className="floating-wa" href={waUrl('مرحباً ROASTERA، عندي استفسار.')} target="_blank" rel="noreferrer" aria-label="تواصل عبر واتساب"><MessageCircle size={24}/></a>
    {showCart&&<CartDrawer cart={cart} onClose={()=>setShowCart(false)} onChange={change} onCheckout={beginCheckout}/>}
    {checkout&&<Checkout cart={cart} onClose={()=>setCheckout(false)} onSubmit={submitOrder} submitting={submitting}/>}
    {admin&&<Admin onClose={()=>setAdmin(false)} products={products} refreshProducts={refresh}/>}
    {detail&&<ProductDetails product={detail} onClose={()=>setDetail(null)} onAdd={add}/>}
    {success&&<Modal onClose={()=>setSuccess(null)}><div className="success-icon"><CheckCircle2 size={42}/></div><span className="eyebrow">ORDER SAVED</span><h2>طلبك تسجّل بنجاح!</h2><p className="muted">رقم الطلب: <b>#{success.number}</b></p><div className="order-total"><span>المجموع التقديري</span><b>{money(success.total)}</b></div><p className="detail-copy">الخطوة الجاية: افتح واتساب وأرسل الرسالة الجاهزة حتى نأكد توفر المنتجات والتوصيل. ما تم الدفع بعد.</p><a className="btn btn-primary full" href={success.wa} target="_blank" rel="noreferrer" onClick={()=>setSuccess(null)}>إرسال تفاصيل الطلب عبر واتساب <MessageCircle size={18}/></a><p className="tiny-note">إذا سكّرت واتساب قبل الإرسال، الطلب محفوظ بقاعدة البيانات ويمكن للإدارة مراجعته.</p></Modal>}
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </>
}

createRoot(document.getElementById('root')).render(<App/>);
