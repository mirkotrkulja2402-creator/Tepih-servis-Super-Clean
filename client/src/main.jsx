import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home, Users, Tags, ClipboardList, FileText, BarChart3, Route, Wallet,
  Settings, QrCode, Search, RefreshCw, Plus, Trash2, Pencil, FileDown,
  Printer, Upload, Download, MapPin, Menu, X, Check, Ban, Car, Shield,
  Palette, Image as ImageIcon, Link2, ReceiptText, SlidersHorizontal,
  ChevronRight, LogOut, CalendarDays, Ruler, UserRound, Clock3, LockKeyhole, Eye, EyeOff, LogIn
} from "lucide-react";
import "./styles.css";

const MODULES = [
  ["home","Početna",Home],["kupci","Kupci",Users],["cjenovnik","Cjenovnik",Tags],
  ["narudzbe","Narudžbe",ClipboardList],["racuni","Računi",FileText],
  ["blagajna","Blagajna",Wallet],["izvjestaji","Izvještaji",BarChart3],
  ["ruta","Ruta",Route],["gari","GARI",Ruler],["qr","QR KOD",QrCode],
  ["administrator","Administrator",Settings]
];

const cities = [
  "Banja Luka","Bihać","Bijeljina","Brčko","Cazin","Čapljina","Doboj","Foča",
  "Goražde","Gradiška","Istočno Sarajevo","Jajce","Konjic","Livno","Mostar",
  "Nevesinje","Prijedor","Prnjavor","Sarajevo","Trebinje","Tuzla","Višegrad",
  "Zenica","Zvornik","Živinice"
];

const actionDefs = [
  ["Dodaj",Plus],["Ukloni",Trash2],["Izmijeni",Pencil],["Pretraga",Search],
  ["Osvježi",RefreshCw],["PDF",FileDown],["Print",Printer],["Izvoz",Download],["Uvoz",Upload]
];

const seed = {
  company:{name:"Super Clean", subtitle:"TEPIH SERVIS", phone:"066 311 221", city:"Banja Luka"},
  priceList:[
    {id:1,name:"Pranje tepiha",unit:"m²",price:5,category:"Pranje"},
    {id:2,name:"Dubinsko čišćenje",unit:"kom",price:25,category:"Čišćenje"}
  ],
  customers:[], orders:[], measurements:[], invoices:[], payments:[], vehicles:[],
  settings:{deliveryPrice:5, theme:"clean-blue", logoPosition:"left"}
};

function load(){ try { return JSON.parse(localStorage.getItem("sc_new_v1")) || seed; } catch { return seed; } }
function save(db){ localStorage.setItem("sc_new_v1", JSON.stringify(db)); }
function money(v){ return `${Number(v||0).toFixed(2).replace(".",",")} KM`; }
function today(){ return new Date().toISOString().slice(0,10); }
function nextNo(arr, key="id"){ return arr.length ? Math.max(...arr.map(x=>Number(x[key])||0))+1 : 1; }

function App(){
  const [db,setDb] = useState(load);
  const [page,setPage] = useState("home");
  const [mobileOpen,setMobileOpen] = useState(false);
  const [user,setUser] = useState(null);
  const [toast,setToast] = useState("");
  const [modal,setModal] = useState(null);

  const commit=(next,msg="Sačuvano")=>{ setDb(next); save(next); if(msg){setToast(msg);setTimeout(()=>setToast(""),1800)} };
  const nav=(p)=>{setPage(p);setMobileOpen(false);setModal(null);};

  if(!user) return <Login onLogin={()=>setUser({name:"Administrator",role:"Administrator"})}/>;

  const current = MODULES.find(x=>x[0]===page);
  const Icon = current?.[2] || Home;

  return <div className={`app theme-${db.settings.theme||"clean-blue"}`}>
    <header className="topbar">
      <button className="mobile-menu" onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X/>:<Menu/>}</button>
      <div className="top-brand" onClick={()=>nav("home")}>
        <img src="/assets/logo.png" alt="Super Clean"/>
        <div><b>Super Clean</b><span>Tepih servis</span></div>
      </div>
      <div className="top-title"><Icon size={20}/><strong>{current?.[1]||"Početna"}</strong></div>
      <div className="userbox"><UserRound size={18}/><span>{user.name}</span><small>{user.role}</small><button title="Odjava" onClick={()=>setUser(null)}><LogOut size={17}/></button></div>
    </header>

    <aside className={`sidebar ${mobileOpen?"open":""}`}>
      <div className="side-scroll">
        {MODULES.map(([id,label,I])=><button key={id} className={page===id?"active":""} onClick={()=>nav(id)}><I size={19}/><span>{label}</span></button>)}
      </div>
      <div className="side-footer">Super Clean • by Mirko</div>
    </aside>

    <main className="content">
      {page==="home" && <HomePage db={db} nav={nav}/>}
      {page==="cjenovnik" && <PriceList db={db} commit={commit} open={setModal}/>}
      {page==="kupci" && <Customers db={db} commit={commit}/>}
      {page==="narudzbe" && <Orders db={db} commit={commit} nav={nav}/>}
      {page==="racuni" && <Invoices db={db} commit={commit}/>}
      {page==="blagajna" && <CashDesk db={db} commit={commit}/>}
      {page==="izvjestaji" && <Reports db={db}/>}
      {page==="ruta" && <Routes db={db} commit={commit}/>}
      {page==="gari" && <Gari db={db} commit={commit}/>}
      {page==="qr" && <QrWindow db={db}/>}
      {page==="administrator" && <Administrator db={db} commit={commit}/>}
    </main>
    {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    {modal}
  </div>
}

function Login({onLogin}){
  const [remember,setRemember]=useState(true);
  const [showPassword,setShowPassword]=useState(false);

  const css=`
    .superclean-login-page{
      min-height:100dvh;width:100%;box-sizing:border-box;overflow:hidden;
      display:flex;flex-direction:column;align-items:center;
      padding:0;background:#eef8ff url("/assets/login-bg-vacuum.jpg") center top / 100% auto no-repeat;
      color:#17375d;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;
    }
    .superclean-login-top{width:100%;height:clamp(360px,44.5vw,455px);flex:0 0 auto;display:flex;justify-content:center;align-items:flex-start;padding:0;box-sizing:border-box;}
    .superclean-login-logo{display:none;}
    .superclean-login-card{
      width:min(760px,74.5vw);box-sizing:border-box;background:rgba(255,255,255,.97);
      border:1px solid rgba(120,165,195,.25);border-radius:34px;
      box-shadow:0 18px 45px rgba(31,96,137,.18);padding:46px 50px 0;
      position:relative;z-index:3;flex:0 0 auto;
    }
    .superclean-login-kicker{display:flex;align-items:center;justify-content:center;gap:26px;color:#526d87;font-size:20px;letter-spacing:2.5px;font-weight:500;margin:0 0 28px;text-align:center;}
    .superclean-login-kicker:before,.superclean-login-kicker:after{content:"";display:block;width:50px;height:4px;border-radius:4px;background:#178bdc;}
    .superclean-login-title{margin:0;text-align:center;color:#0c315a;font-weight:500;font-size:clamp(48px,6vw,68px);line-height:1.05;}
    .superclean-login-subtitle{margin:22px 0 22px;text-align:center;color:#8192a4;font-size:clamp(22px,3vw,30px);font-weight:400;}
    .superclean-login-usericon{width:58px;height:58px;border-radius:50%;margin:0 auto 26px;display:grid;place-items:center;background:#e9f6ff;color:#178bdc;}
    .superclean-login-field{width:100%;height:70px;box-sizing:border-box;margin-bottom:20px;border:2px solid #d8e3eb;border-radius:20px;background:#fff;display:flex;align-items:center;padding:0 20px;}
    .superclean-login-field-icon{width:44px;height:44px;display:grid;place-items:center;color:#148bdc;border-right:1px solid #e2e9ee;padding-right:18px;box-sizing:content-box;flex:0 0 auto;}
    .superclean-login-input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#3b536d;font-size:22px;padding:0 18px;}
    .superclean-login-eye{border:0;background:transparent;color:#8095aa;padding:6px;cursor:pointer;}
    .superclean-login-button{width:100%;height:76px;border:0;border-radius:20px;background:linear-gradient(135deg,#1695e7,#0878d0);color:white;display:flex;align-items:center;justify-content:center;gap:15px;font-size:29px;font-weight:600;cursor:pointer;box-shadow:0 13px 28px rgba(17,139,222,.23);margin-top:2px;}
    .superclean-login-remember{display:flex;align-items:center;gap:14px;margin:22px 0 34px;color:#536b83;font-size:22px;cursor:pointer;user-select:none;}
    .superclean-login-check{width:28px;height:28px;accent-color:#168fe1;}
    .superclean-login-footer{margin:0 -50px;height:112px;position:relative;overflow:hidden;border-radius:0 0 34px 34px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:0;box-sizing:border-box;}
    .superclean-login-footer:before{content:"";position:absolute;left:-5%;right:-5%;bottom:-28px;height:78px;background:#158de0;border-radius:50% 50% 0 0/35% 35% 0 0;transform:rotate(-1deg);}
    .superclean-login-footer:after{content:"";position:absolute;left:-5%;right:-5%;bottom:36px;height:27px;background:#55c66b;border-radius:50% 50% 0 0/70% 70% 0 0;transform:rotate(2deg);}
    .superclean-login-footer-text,.superclean-login-version{display:none;}
    .superclean-login-slogan{margin-top:42px;text-align:center;font-family:Georgia,serif;font-style:italic;font-size:clamp(25px,4vw,38px);color:#1685d3;padding-bottom:18px;}
    @media(max-width:700px){
      .superclean-login-page{min-height:100dvh;height:100dvh;overflow:hidden;background-size:100% auto;background-position:center top;}
      .superclean-login-top{height:29.6vh;min-height:360px;max-height:455px;}
      .superclean-login-card{width:74.5vw;max-width:none;padding:31px 5vw 0;border-radius:30px;}
      .superclean-login-kicker{font-size:clamp(13px,2.5vw,17px);letter-spacing:1.8px;gap:12px;margin-bottom:22px;white-space:nowrap;}
      .superclean-login-kicker:before,.superclean-login-kicker:after{width:34px;height:4px;flex:0 0 auto;}
      .superclean-login-title{font-size:clamp(44px,6.7vw,52px);}
      .superclean-login-subtitle{font-size:clamp(20px,3vw,24px);margin:17px 0 20px;}
      .superclean-login-usericon{width:54px;height:54px;margin-bottom:24px;}
      .superclean-login-field{height:68px;margin-bottom:19px;padding:0 13px;border-radius:18px;}
      .superclean-login-field-icon{width:38px;height:38px;padding-right:13px;}
      .superclean-login-field-icon svg{width:28px;height:28px;}
      .superclean-login-input{font-size:20px;padding:0 13px;}
      .superclean-login-eye svg{width:27px;height:27px;}
      .superclean-login-button{height:70px;border-radius:18px;font-size:27px;gap:11px;}
      .superclean-login-button svg{width:30px;height:30px;}
      .superclean-login-remember{font-size:20px;gap:11px;margin:20px 0 34px;}
      .superclean-login-check{width:25px;height:25px;}
      .superclean-login-footer{margin:0 -5vw;height:108px;border-radius:0 0 30px 30px;}
      .superclean-login-slogan{margin-top:34px;font-size:clamp(22px,4vw,28px);padding:0 10px 14px;}
    }
    @media(max-width:390px){
      .superclean-login-top{height:29vh;min-height:290px;}
      .superclean-login-card{width:78vw;padding:25px 4vw 0;}
      .superclean-login-kicker{font-size:12px;gap:8px;letter-spacing:1.2px;}
      .superclean-login-kicker:before,.superclean-login-kicker:after{width:28px;}
      .superclean-login-title{font-size:37px;}
      .superclean-login-subtitle{font-size:18px;}
      .superclean-login-field{height:58px;}
      .superclean-login-button{height:60px;font-size:23px;}
      .superclean-login-footer{margin:0 -4vw;height:86px;}
    }
  `;

  return <>
    <style>{css}</style>
    <div className="superclean-login-page">
      <div className="superclean-login-top">
        <img className="superclean-login-logo" src="/assets/logo.png" alt="Tepih servis Super Clean"/>
      </div>

      <div className="superclean-login-card">
        <div className="superclean-login-kicker">TEPIH SERVIS SUPER CLEAN</div>
        <h1 className="superclean-login-title">Dobro došli!</h1>
        <p className="superclean-login-subtitle">Prijavite se u svoj nalog</p>

        <div className="superclean-login-usericon"><UserRound size={30}/></div>

        <div className="superclean-login-field">
          <span className="superclean-login-field-icon"><UserRound size={31}/></span>
          <input className="superclean-login-input" defaultValue="Administrator" autoComplete="username"/>
        </div>

        <div className="superclean-login-field">
          <span className="superclean-login-field-icon"><LockKeyhole size={31}/></span>
          <input className="superclean-login-input" type={showPassword?"text":"password"} defaultValue="superclean" autoComplete="current-password"/>
          <button type="button" className="superclean-login-eye" onClick={()=>setShowPassword(!showPassword)}>
            {showPassword?<EyeOff size={30}/>:<Eye size={30}/>}
          </button>
        </div>

        <button className="superclean-login-button" onClick={onLogin} type="button">
          <LogIn size={34}/> Prijava
        </button>

        <label className="superclean-login-remember">
          <input className="superclean-login-check" type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/>
          <span>Zapamti šifru</span>
        </label>

        <div className="superclean-login-footer" aria-hidden="true"/>
      </div>

      <div className="superclean-login-slogan">Čist prostor, zdraviji dom!</div>
    </div>
  </>;
}

function HomePage({db,nav}){
  const stats=[
    ["Kupci",db.customers.length,"kupci",Users],["Narudžbe",db.orders.length,"narudzbe",ClipboardList],
    ["Računi",db.invoices.length,"racuni",FileText],["Blagajna",db.payments.filter(x=>x.paid).length,"blagajna",Wallet]
  ];
  return <div>
    <section className="hero">
      <div><div className="eyebrow">SUPER CLEAN • TEPIH SERVIS</div><h1>Dobro došli u Super Clean</h1><p>Jedan sistem za kupce, narudžbe, mjerenja, račune, blagajnu i rute.</p></div>
      <div className="datebox"><Clock3/><b>{new Date().toLocaleTimeString("bs-BA",{hour:"2-digit",minute:"2-digit"})}</b><span>{new Date().toLocaleDateString("bs-BA",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}</span></div>
    </section>
    <div className="stat-grid">{stats.map(([t,n,p,I])=><button key={t} className="stat" onClick={()=>nav(p)}><I/><div><b>{n}</b><span>{t}</span></div><ChevronRight/></button>)}</div>
    <div className="module-grid">{MODULES.slice(1,10).map(([id,label,I])=><button key={id} className="module-card" onClick={()=>nav(id)}><span className="module-icon"><I/></span><b>{label}</b><ChevronRight/></button>)}</div>
  </div>
}

function Toolbar({onAdd,onSearch,onRefresh,title}){
  return <div className="toolbar">
    {actionDefs.map(([label,I])=><button key={label} onClick={()=> label==="Dodaj"?onAdd?.():label==="Pretraga"?onSearch?.():label==="Osvježi"?onRefresh?.():null}><I size={17}/><span>{label}</span></button>)}
  </div>
}

function Table({columns,rows,onRow}){return <div className="table-wrap"><table><thead><tr>{columns.map(c=><th key={c[0]}>{c[1]}</th>)}</tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={r.id||i} onClick={()=>onRow?.(r)}>{columns.map(([k])=><td key={k}>{r[k]??"—"}</td>)}</tr>):<tr><td colSpan={columns.length} className="empty">Nema zapisa.</td></tr>}</tbody></table></div>}

function PriceList({db,commit}){
  const [edit,setEdit]=useState(null), [q,setQ]=useState("");
  const rows=db.priceList.filter(x=>x.name.toLowerCase().includes(q.toLowerCase()));
  const saveItem=(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);const item={id:edit?.id||nextNo(db.priceList),name:f.get("name"),unit:f.get("unit"),price:Number(f.get("price")),category:f.get("category")};commit({...db,priceList:edit?db.priceList.map(x=>x.id===edit.id?item:x):[...db.priceList,item]},"Cjenovnik sačuvan");setEdit(null)};
  return <Module title="Cjenovnik" subtitle="Usluge, artikli, mjerne jedinice i cijene.">
    <Toolbar onAdd={()=>setEdit({})} onSearch={()=>setQ(prompt("Pretraga cjenovnika:")||"")} onRefresh={()=>setQ("")}/>
    {edit!==null&&<FormCard title={edit.id?"Izmijeni stavku":"Nova stavka"} onCancel={()=>setEdit(null)} onSubmit={saveItem}>
      <Field name="name" label="Naziv / usluga / artikal" defaultValue={edit.name}/><Field name="unit" label="Mjerna jedinica" defaultValue={edit.unit||"m²"} placeholder="m², kom, sat..."/>
      <Field name="price" label="Cijena" type="number" step="0.01" defaultValue={edit.price||0}/><Field name="category" label="Kategorija" defaultValue={edit.category||"Pranje"}/>
    </FormCard>}
    <Table columns={[["name","Naziv / usluga / artikal"],["unit","Mjerna jedinica"],["price","Cijena"],["category","Kategorija"]]} rows={rows.map(x=>({...x,price:money(x.price)}))} onRow={setEdit}/>
    <div className="info-card"><b>+ Dostava</b><span>Trenutno podešeno: {money(db.settings.deliveryPrice)}. Promjena je pod Administrator → Cjenovnik.</span></div>
  </Module>
}

function Customers({db,commit}){
  const [edit,setEdit]=useState(null), [q,setQ]=useState("");
  const rows=db.customers.filter(x=>(x.name+" "+x.phone+" "+x.address).toLowerCase().includes(q.toLowerCase()));
  const saveCustomer=(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);const c={id:edit?.id||crypto.randomUUID(),name:f.get("name"),address:f.get("address"),phone:f.get("phone"),city:f.get("city"),map:f.get("map"),note:f.get("note")};commit({...db,customers:edit?.id?db.customers.map(x=>x.id===edit.id?c:x):[...db.customers,c]},"Kupac sačuvan");setEdit(null)};
  return <Module title="Kupci" subtitle="Jedan kupac po redu, brzo uređivanje i Google mapa.">
    <Toolbar onAdd={()=>setEdit({})} onSearch={()=>setQ(prompt("Pretraga kupaca:")||"")} onRefresh={()=>setQ("")}/>
    {edit!==null&&<FormCard title={edit.id?"Izmijeni kupca":"Novi kupac"} onCancel={()=>setEdit(null)} onSubmit={saveCustomer}>
      <Field name="name" label="Ime i prezime" defaultValue={edit.name}/><Field name="address" label="Adresa" defaultValue={edit.address}/>
      <Field name="phone" label="Broj telefona" defaultValue={edit.phone}/><SelectField name="city" label="Grad" options={cities} defaultValue={edit.city||"Banja Luka"}/>
      <Field name="map" label="Google mapa / adresa za mapu" defaultValue={edit.map}/><Field name="note" label="Napomena" defaultValue={edit.note}/>
    </FormCard>}
    <Table columns={[["name","Ime i prezime"],["address","Adresa"],["phone","Telefon"],["city","Grad"],["map","Lokacija"],["note","Napomena"]]} rows={rows.map(x=>({...x,map:x.map?<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(x.map)}`} target="_blank" onClick={e=>e.stopPropagation()}>Mapa</a>:"—"}))} onRow={setEdit}/>
  </Module>
}

function Orders({db,commit,nav}){
  const [edit,setEdit]=useState(null), [q,setQ]=useState("");
  const rows=db.orders.filter(x=>(String(x.no)+" "+x.customerName+" "+x.phone).toLowerCase().includes(q.toLowerCase()));
  const saveOrder=(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);const o={id:edit?.id||crypto.randomUUID(),no:edit?.no||nextNo(db.orders,"no"),customerId:f.get("customerId"),customerName:f.get("customerName"),address:f.get("address"),phone:f.get("phone"),note:f.get("note"),map:f.get("map"),carpets:Number(f.get("carpets")||0),date:f.get("date"),pickup:f.get("pickup"),status:"Otvorena"};commit({...db,orders:edit?.id?db.orders.map(x=>x.id===edit.id?o:x):[...db.orders,o]},"Narudžba sačuvana");setEdit(null)};
  const start=(o)=>nav("racuni");
  return <Module title="Narudžbe" subtitle="Narudžba → Mjerenje → Račun.">
    <Toolbar onAdd={()=>setEdit({date:today()})} onSearch={()=>setQ(prompt("Pretraga narudžbi:")||"")} onRefresh={()=>setQ("")}/>
    {edit!==null&&<FormCard title={`Narudžba ${edit.no?`N-${edit.no}`:"nova"}`} onCancel={()=>setEdit(null)} onSubmit={saveOrder} submit="Snimi narudžbu">
      <Field name="customerName" label="Ime i prezime kupca" defaultValue={edit.customerName}/>
      <Field name="customerId" label="ID postojećeg kupca (opcionalno)" defaultValue={edit.customerId}/>
      <Field name="address" label="Adresa" defaultValue={edit.address}/><Field name="phone" label="Telefon" defaultValue={edit.phone}/>
      <Field name="note" label="Napomena" defaultValue={edit.note}/><Field name="map" label="Google mapa / adresa" defaultValue={edit.map}/>
      <Field name="carpets" label="Broj tepiha" type="number" defaultValue={edit.carpets||0}/><Field name="date" label="Datum" type="date" defaultValue={edit.date||today()}/>
      <Field name="pickup" label="Način preuzimanja" defaultValue={edit.pickup}/>
    </FormCard>}
    <Table columns={[["no","Oznaka"],["customerName","Kupac"],["address","Adresa"],["phone","Telefon"],["carpets","Br. tepiha"],["date","Datum"],["status","Status"]]} rows={rows.map(x=>({...x,no:`N-${x.no}`}))} onRow={setEdit}/>
    {rows.length>0&&<div className="flow-note"><Ruler/> Mjerenje se otvara iz odabrane narudžbe; podaci mjerenja se kasnije povlače u račun.</div>}
  </Module>
}

function Invoices({db,commit}){
  const [edit,setEdit]=useState(null);
  const rows=db.invoices.map(x=>({...x,total:money(x.total),status:x.status==="storno"?"🔴 Storno":x.status==="finished"?"🔵 Završena":"⚪ Otvorena"}));
  const save=(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);const item={id:edit?.id||crypto.randomUUID(),no:edit?.no||nextNo(db.invoices,"no"),customer:f.get("customer"),date:f.get("date"),payment:f.get("payment"),total:Number(f.get("total")||0),status:"open"};commit({...db,invoices:edit?.id?db.invoices.map(x=>x.id===edit.id?item:x):[...db.invoices,item]},"Račun sačuvan");setEdit(null)};
  return <Module title="Računi" subtitle="Računi se vežu za narudžbu i mjerenje; storno ostaje u evidenciji.">
    <Toolbar onAdd={()=>setEdit({date:today()})} onSearch={()=>setEdit({search:true})} onRefresh={()=>{}}/>
    {edit?.search&&<div className="search-panel"><Search/><input autoFocus placeholder="Pretraži račun..." onKeyDown={e=>e.key==="Enter"&&setEdit(null)}/><button onClick={()=>setEdit(null)}>Zatvori</button></div>}
    {edit&&!edit.search&&<FormCard title={`Račun ${edit.no?`2026/${edit.no}`:"novi"}`} onCancel={()=>setEdit(null)} onSubmit={save} submit="Snimi račun">
      <Field name="customer" label="Kupac" defaultValue={edit.customer}/><Field name="date" label="Datum" type="date" defaultValue={edit.date||today()}/>
      <SelectField name="payment" label="Način plaćanja" options={["Gotovinski","Žiralno"]} defaultValue={edit.payment||"Gotovinski"}/>
      <Field name="total" label="Ukupno" type="number" step="0.01" defaultValue={edit.total||0}/>
      <div className="form-wide"><button type="button" className="secondary">Dodaj stavku +</button><button type="button" className="secondary">Dostava</button><button type="button" className="danger">Storniraj račun</button><button type="button" className="secondary"><Printer size={16}/> Printaj</button></div>
    </FormCard>}
    <Table columns={[["no","Broj računa"],["customer","Kupac"],["date","Datum"],["payment","Plaćanje"],["total","Ukupno"],["status","Status"]]} rows={rows} onRow={setEdit}/>
    <div className="print-note"><ReceiptText/> A4 račun i odrezak kupca na dnu stranice predviđeni su u modulu dokumenata/štampe.</div>
  </Module>
}

function CashDesk({db,commit}){
  const toggle=(inv)=>{const payments=[...db.payments];const p=payments.find(x=>x.invoiceId===inv.id);if(p)p.paid=!p.paid;else payments.push({invoiceId:inv.id,paid:true,at:new Date().toISOString(),by:"Administrator"});commit({...db,payments},"Status blagajne sačuvan")};
  return <Module title="Blagajna" subtitle="Evidencija svih računa i naplate bez brisanja dokaza.">
    <Toolbar onAdd={()=>{}} onSearch={()=>{}} onRefresh={()=>{}}/>
    <Table columns={[["no","Račun"],["customer","Kupac"],["total","Iznos"],["payment","Način"],["paid","Plaćeno"],["audit","Evidencija"]]}

    
rows={db.invoices.map(i=>{const p=db.payments.find(x=>x.invoiceId===i.id);return {...i,total:money(i.total),paid:p?.paid?"Da":"Ne",audit:p?.by?`${p.by} • ${new Date(p.at).toLocaleString("bs-BA")}`:""}})}

onRow={()=>{}}
/>      
 </Module>
}   

function Reports({db}){
  const cash=db.invoices.filter(x=>x.payment==="Gotovinski"&&x.status!=="storno").reduce((a,x)=>a+Number(x.total||0),0);
  const bank=db.invoices.filter(x=>x.payment==="Žiralno"&&x.status!=="storno").reduce((a,x)=>a+Number(x.total||0),0);
  return <Module title="Izvještaji" subtitle="Dan, godina, mjesec, kupac, tepih, m² i način plaćanja.">
    <Toolbar onAdd={()=>{}} onSearch={()=>{}} onRefresh={()=>{}}/>
    <div className="report-grid"><div><span>Promet po danu</span><b>{money(cash+bank)}</b></div><div><span>Promet mjeseca</span><b>{money(cash+bank)}</b></div><div><span>Gotovinski</span><b>{money(cash)}</b></div><div><span>Žiralno</span><b>{money(bank)}</b></div></div>
    <div className="filters"><CalendarDays/><select><option>Dan</option></select><select><option>Godina</option><option>2026</option></select><select><option>Mjesec</option></select><select><option>Kupac</option></select><select><option>Tepih</option></select></div>
    <Table columns={[["date","Datum"],["customer","Kupac"],["no","Račun"],["total","Ukupno"],["payment","Plaćanje"]]} rows={db.invoices.map(x=>({...x,total:money(x.total)}))}/>
  </Module>
}

function Routes({db,commit}){
  const [edit,setEdit]=useState(null);
  const save=(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);const v={id:edit?.id||crypto.randomUUID(),name:f.get("name"),driver:f.get("driver"),plate:f.get("plate")};commit({...db,vehicles:edit?.id?db.vehicles.map(x=>x.id===edit.id?v:x):[...db.vehicles,v]},"Vozilo sačuvano");setEdit(null)};
  return <Module title="Ruta" subtitle="Narudžbe i računi se raspoređuju na Vozilo 1, 2, 3 i dalje.">
    <Toolbar onAdd={()=>setEdit({})} onSearch={()=>{}} onRefresh={()=>{}}/>
    {edit!==null&&<FormCard title="Novo vozilo" onCancel={()=>setEdit(null)} onSubmit={save} submit="Snimi vozilo"><Field name="name" label="Vozilo 1 / ime vozila" defaultValue={edit.name}/><Field name="driver" label="Ime i prezime / vozač" defaultValue={edit.driver}/><Field name="plate" label="Reg. oznaka" defaultValue={edit.plate}/><button type="button" className="danger">Obriši vozilo</button></FormCard>}
    <div className="vehicle-grid">{[...Array(Math.max(3,db.vehicles.length))].map((_,i)=>{const v=db.vehicles[i];return <div className="vehicle" key={i} onClick={()=>v&&setEdit(v)}><Car/><b>{v?.name||`Vozilo ${i+1}`}</b><span>{v?.driver||"Nije podešeno"}</span><small>{v?.plate||""}</small></div>})}</div>
  </Module>
}

function Gari({db,commit}){
  const [rows,setRows]=useState([]),[date,setDate]=useState(today()),[price,setPrice]=useState(5),[name,setName]=useState("Gari");
  const [l,setL]=useState(""),[w,setW]=useState("");
  const add=()=>{const a=Number(l||0),b=Number(w||0);if(!a||!b)return;setRows([...rows,{id:Date.now(),l:a,w:b,m2:a*b}]);setL("");setW("")};
  const total=rows.reduce((a,x)=>a+x.m2,0);
  return <Module title="GARI" subtitle="Interna evidencija; ne ulazi automatski u Kupce/Narudžbe/Račune/Blagajnu.">
    <Toolbar onAdd={add} onSearch={()=>{}} onRefresh={()=>setRows([])}/>
    <div className="gari-head"><Field name="gari-name" label="Naziv" value={name} onChange={e=>setName(e.target.value)}/><Field name="gari-date" label="Datum" type="date" value={date} onChange={e=>setDate(e.target.value)}/><Field name="gari-price" label="Cijena po m²" type="number" value={price} onChange={e=>setPrice(e.target.value)}/></div>
    <div className="inline-add"><input placeholder="Dužina" value={l} onChange={e=>setL(e.target.value)}/><input placeholder="Širina" value={w} onChange={e=>setW(e.target.value)}/><button className="primary" onClick={add}>Dodaj</button></div>
    <Table columns={[["l","Dužina"],["w","Širina"],["m2","m²"]]} rows={rows}/>
    <div className="total-bar"><b>Ukupno m²: {total.toFixed(2)}</b><b>Ukupno: {money(total*price)}</b><button className="primary" onClick={()=>alert("GARI evidencija spremna za print.")}>Print</button></div>
  </Module>
}

function QrWindow({db}){
  const [value,setValue]=useState("");
  return <Module title="QR KOD" subtitle="Skeniranje etikete otvara tačnu narudžbu i tepih.">
    <div className="qr-box"><QrCode size={72}/><h2>Skeniraj QR kod</h2><p>Na telefonu kamera može otvoriti skener etikete.</p><button className="primary" onClick={()=>alert("Kamera/skener će se uključiti kada se instalira QR scanner komponenta.")}>Pokreni skener</button><input value={value} onChange={e=>setValue(e.target.value)} placeholder="Ili unesi sigurni ID QR koda"/>{value&&<div className="qr-result">Referenca: <b>{value}</b></div>}</div>
  </Module>
}

function Administrator({db,commit}){
  const [tab,setTab]=useState("korisnici");
  const tabs=[
    ["korisnici","Korisnici",Users],["dozvole","Dozvole",Shield],["aktivnost","Evidencija aktivnosti",ReceiptText],
    ["tema","Teme i izgled",Palette],["logo","Logo",ImageIcon],["prozori","Prozori i moduli",SlidersHorizontal],
    ["veze","Veze između modula",Link2],["dokumenti","Dokumenti",FileText],["izvjestaji","Izvještaji",BarChart3],
    ["blagajna","Blagajna",Wallet],["cjenovnik","Cjenovnik",Tags],["ruta","Ruta i vozila",Car],
    ["qr","QR i etikete",QrCode],["opste","Opšte postavke",Settings],["sigurnost","Sigurnost",Shield]
  ];
  return <Module title="Administrator" subtitle="Centralna kontrola: korisnici, dozvole, izgled, moduli, dokumenti i sigurnost.">
    <div className="admin-grid">
      <div className="admin-menu">{tabs.map(([id,l,I])=><button className={tab===id?"active":""} onClick={()=>setTab(id)} key={id}><I size={18}/>{l}</button>)}</div>
      <div className="admin-panel">
        {tab==="tema"&&<ThemeSettings db={db} commit={commit}/>}
        {tab==="logo"&&<LogoSettings/>}
        {tab==="cjenovnik"&&<PriceAdmin db={db} commit={commit}/>}
        {tab==="dozvole"&&<Permissions/>}
        {tab==="aktivnost"&&<div className="info-card"><b>Evidencija aktivnosti</b><span>Korisnik, radnja, dokument, stare/nove vrijednosti i datum/vrijeme predviđeni su kao centralni audit zapis.</span></div>}
        {tab!=="tema"&&tab!=="logo"&&tab!=="cjenovnik"&&tab!=="dozvole"&&<div className="info-card"><b>{tabs.find(x=>x[0]===tab)?.[1]}</b><span>Kontrolni panel je predviđen u novoj arhitekturi i vezan za administratorske dozvole.</span></div>}
      </div>
    </div>
  </Module>
}
function ThemeSettings({db,commit}){
  const themes=["clean-blue","ocean","mint","graphite","royal","sand","forest","sky"];
  return <div><h2>Teme i izgled</h2><p>Administrator može birati gotovu temu i kasnije proširivati biblioteku.</p><div className="theme-list">{themes.map(t=><button key={t} className={db.settings.theme===t?"chosen":""} onClick={()=>commit({...db,settings:{...db.settings,theme:t}})}>{t}</button>)}</div></div>
}
function LogoSettings(){return <div><h2>Logo</h2><div className="logo-setting"><img src="/assets/logo.png"/><div><p>Jedinstveni logo se koristi na početnoj, dokumentima i etiketama.</p><input type="file" accept="image/png,image/jpeg,image/webp"/><div className="seg"><button>← Lijevo</button><button>Centar</button><button>Desno →</button></div></div></div></div>}
function PriceAdmin({db,commit}){return <div><h2>Cjenovnik — administratorske postavke</h2><Field name="delivery" label="Cijena dostave" type="number" defaultValue={db.settings.deliveryPrice} onBlur={e=>commit({...db,settings:{...db.settings,deliveryPrice:Number(e.target.value)}},"Cijena dostave sačuvana")}/><p>Administrator može uređivati polja, cijene, kategorije, ikone, fontove, boje, dugmad i dozvole modula.</p></div>}
function Permissions(){return <div><h2>Dozvole</h2><Table columns={[["role","Uloga"],["see","Vidi"],["add","Dodaj"],["edit","Izmijeni"],["delete","Ukloni"],["print","Print"],["export","Izvoz"],["special","Posebne radnje"]]} rows={[{role:"Administrator",see:"✓",add:"✓",edit:"✓",delete:"✓",print:"✓",export:"✓",special:"Sve"},{role:"Blagajnik",see:"✓",add:"—",edit:"—",delete:"—",print:"✓",export:"—",special:"Plaćeno / neplaćeno"}]}/></div>}

function Module({title,subtitle,children}){return <section className="module"><div className="module-head"><div><h1>{title}</h1><p>{subtitle}</p></div></div>{children}</section>}
function FormCard({title,children,onCancel,onSubmit,submit="Sačuvaj"}){return <form className="form-card" onSubmit={onSubmit}><div className="form-head"><h2>{title}</h2></div><div className="form-grid">{children}</div><div className="form-actions"><button type="button" className="secondary" onClick={onCancel}><Ban size={16}/> Otkaži</button><button className="primary" type="submit"><Check size={16}/> {submit}</button></div></form>}
function Field({label,name,type="text",...props}){return <label className="field"><span>{label}</span><input name={name} type={type} {...props}/></label>}
function SelectField({label,name,options,defaultValue}){return <label className="field"><span>{label}</span><select name={name} defaultValue={defaultValue}>{options.map(o=><option key={o}>{o}</option>)}</select></label>}

createRoot(document.getElementById("root")).render(<App/>);
