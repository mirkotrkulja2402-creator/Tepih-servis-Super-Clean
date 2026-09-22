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
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const styles = {
    page: {
      height: "100dvh",
      minHeight: "100dvh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "8px 12px 10px",
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden",
      backgroundColor: "#eef8ff",
      backgroundImage: "linear-gradient(rgba(235,248,255,.10),rgba(235,248,255,.22)),url(\"/assets/login-bg-vacuum.jpg\")",
      backgroundSize: "cover",
      backgroundPosition: "center top",
      backgroundRepeat: "no-repeat",
      fontFamily: "Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
      color: "#15365d"
    },
    glow1: {display:"none"},
    glow2: {display:"none"},
    topWave: {display:"none"},
    brand: {position:"relative",zIndex:2,width:"min(390px,92vw)",display:"flex",justifyContent:"center",marginBottom:8,flex:"0 0 auto"},
    logo: {width:"min(285px,70vw)",height:"auto",maxHeight:"185px",objectFit:"contain",filter:"drop-shadow(0 8px 18px rgba(15,78,120,.14))"},
    card: {position:"relative",zIndex:2,width:"min(560px,94vw)",boxSizing:"border-box",background:"rgba(255,255,255,.96)",border:"1px solid rgba(112,160,196,.25)",borderRadius:30,boxShadow:"0 22px 55px rgba(34,92,135,.18)",padding:"18px clamp(18px,5vw,42px) 22px",backdropFilter:"blur(8px)",flex:"0 0 auto"},
    kicker: {textAlign:"center",fontSize:12,letterSpacing:2,color:"#58728e",fontWeight:700,marginBottom:5},
    line: {width:68,height:3,borderRadius:10,background:"linear-gradient(90deg,#168be0,#36b8a5)",margin:"0 auto 9px"},
    title: {textAlign:"center",fontSize:"clamp(34px,7vw,52px)",lineHeight:1.02,margin:"0 0 7px",fontWeight:700,color:"#0d2f55"},
    subtitle: {textAlign:"center",fontSize:"clamp(16px,3.8vw,21px)",color:"#7c8fa4",margin:"0 0 15px"},
    field: {height:58,border:"1px solid #d7e3ed",borderRadius:17,display:"flex",alignItems:"center",padding:"0 13px",background:"#fbfdff",boxShadow:"inset 0 1px 0 rgba(255,255,255,.9)",marginBottom:12},
    iconWrap: {width:36,height:36,borderRadius:11,display:"grid",placeItems:"center",background:"#e9f5ff",color:"#1689df",flex:"0 0 auto"},
    input: {border:0,outline:0,background:"transparent",width:"100%",fontSize:18,color:"#304b66",padding:"0 11px"},
    eye: {border:0,background:"transparent",color:"#8095aa",display:"grid",placeItems:"center",padding:6,cursor:"pointer"},
    button: {width:"100%",height:58,border:0,borderRadius:17,background:"linear-gradient(135deg,#148ce4,#0876ce)",color:"white",fontSize:21,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:12,boxShadow:"0 10px 24px rgba(20,140,228,.25)",cursor:"pointer",marginTop:4},
    rememberRow: {display:"flex",alignItems:"center",gap:10,fontSize:17,color:"#536b83",marginTop:12,cursor:"pointer",userSelect:"none"},
    check: {width:22,height:22,accentColor:"#168be0"},
    wave: {height:18,margin:"15px -42px -22px",borderRadius:"0 0 30px 30px",background:"linear-gradient(170deg,transparent 20%,#55c26b 21%,#55c26b 39%,#158de0 40%,#158de0 72%,#0d79cf 73%)",opacity:.96},
    slogan: {position:"relative",zIndex:2,marginTop:8,textAlign:"center",fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:"clamp(18px,4.6vw,28px)",color:"#1687d7",textShadow:"0 2px 10px rgba(20,130,210,.12)",flex:"0 0 auto"}
  };

  const compact = `@media (max-height: 760px){
    .superclean-login-page{padding-top:4px !important;padding-bottom:4px !important}
    .superclean-login-page .superclean-login-logo{max-height:150px !important;width:min(250px,66vw) !important}
    .superclean-login-page .superclean-login-card{padding-top:14px !important;padding-bottom:18px !important}
    .superclean-login-page .superclean-login-field{height:52px !important;margin-bottom:9px !important}
    .superclean-login-page .superclean-login-button{height:54px !important}
    .superclean-login-page .superclean-login-slogan{margin-top:5px !important;font-size:18px !important}
  }`;

  return (
  <>
    <style>{compact}</style>
    <div className="superclean-login-page" style={styles.page}>
      <div style={styles.glow1}/><div style={styles.glow2}/><div style={styles.topWave}/>
      <div style={styles.brand}>
        <img className="superclean-login-logo" src="/assets/logo.png" style={styles.logo} alt="Tepih servis Super Clean" />
      </div>

      <div className="superclean-login-card" style={styles.card}>
        <div style={styles.kicker}>TEPIH SERVIS SUPER CLEAN</div>
        <div style={styles.line}/>
        <h1 style={styles.title}>Dobro došli!</h1>
        <p style={styles.subtitle}>Prijavite se u svoj nalog</p>

        <div className="superclean-login-field" style={styles.field}>
          <span style={styles.iconWrap}><UserRound size={24}/></span>
          <input style={styles.input} placeholder="Korisničko ime" defaultValue="Administrator" autoComplete="username" />
        </div>

        <div className="superclean-login-field" style={styles.field}>
          <span style={styles.iconWrap}><LockKeyhole size={24}/></span>
          <input style={styles.input} placeholder="Šifra" type={showPassword ? "text" : "password"} defaultValue="superclean" autoComplete="current-password" />
          <button type="button" style={styles.eye} onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword ? "Sakrij šifru" : "Prikaži šifru"}>
            {showPassword ? <EyeOff size={25}/> : <Eye size={25}/>} 
          </button>
        </div>

        <button className="superclean-login-button" style={styles.button} onClick={onLogin} type="button"><LogIn size={27}/> Prijava</button>

        <label style={styles.rememberRow}>
          <input style={styles.check} type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
          <span>Zapamti šifru</span>
        </label>

        <div style={styles.wave}/>
      </div>

      <div className="superclean-login-slogan" style={styles.slogan}>Čist prostor, zdraviji dom!</div>
    </div>
  </>
  );
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
      <SelectField name="payment" label="Način plaćanja" options={["Gotovinski","Žiralno"]} defaultValue={edi
