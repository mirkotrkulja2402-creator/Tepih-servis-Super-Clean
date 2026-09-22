import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home, Users, Tags, ClipboardList, FileText, BarChart3, Route, Wallet,
  Settings, QrCode, Search, RefreshCw, Plus, Trash2, Pencil, FileDown,
  Printer, Upload, Download, MapPin, Menu, X, Check, Ban, Car, Shield,
  Palette, Image as ImageIcon, Link2, ReceiptText, SlidersHorizontal,
  ChevronRight, LogOut, CalendarDays, Ruler, UserRound, Clock3
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
  const [user,setUser] = useState({name:"Administrator",role:"Administrator"});
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

  return (
    <div className="login">
      <div className="login-card">
        <img
          src="/assets/logo.png"
          className="login-logo"
          alt="Tepih servis Super Clean"
        />

        <h1>Dobro došli!</h1>
        <p className="login-subtitle">Prijavite se u svoj nalog</p>

        <div className="login-field">
          <span className="login-icon">👤</span>
          <input
            placeholder="Korisničko ime"
            defaultValue="Administrator"
            autoComplete="username"
          />
        </div>
        <div className="login-field">
          <span className="login-icon">🔒</span>
          <input
            placeholder="Šifra"
            type={showPassword ? "text" : "password"}
            defaultValue="superclean"
            autoComplete="current-password"
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "◉" : "◌"}
          </button>
        </div>

        <button className="primary big login-button" onClick={onLogin}>
          ↪&nbsp; Prijava
        </button>

        <label className="remember-password">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>Zapamti šifru</span>
        </label>

        <div className="login-wave">
          <div>Tepih servis Super Clean</div>
          <div>v1.0</div>
        </div>
      </div>
    </div>
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
  const total = rows.reduce((sum,r)=>sum+r.m2,0);
  const value = total * Number(price || 0);

  return <Module title="GARI" subtitle="Interna evidencija preuzetih tepiha.">
    <div className="form-grid">
      <Field name="gari-name" label="Naziv" value={name} onChange={e=>setName(e.target.value)}/>
      <Field name="gari-date" label="Datum" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
      <Field name="gari-price" label="Cijena po m²" type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)}/>
      <Field name="gari-l" label="Dužina (m)" type="number" step="0.01" value={l} onChange={e=>setL(e.target.value)}/>
      <Field name="gari-w" label="Širina (m)" type="number" step="0.01" value={w} onChange={e=>setW(e.target.value)}/>
    </div>

    <button className="primary" type="button" onClick={add}>Dodaj tepih</button>

    <Table
      columns={[
        ["l","Dužina"],
        ["w","Širina"],
        ["m2","m²"]
      ]}
      rows={rows}
    />

    <div className="info-card">
      <b>Ukupno: {total.toFixed(2)} m²</b>
      <span>Vrijednost: {money(value)}</span>
    </div>
  </Module>
}
