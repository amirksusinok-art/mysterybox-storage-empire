import {useEffect,useRef,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Archive,ArrowLeft,Box,CalendarDays,ChartNoAxesCombined,CircleHelp,Clock3,Gavel,House,PackageOpen,Settings,ShoppingBag,ShoppingCart,Star,Warehouse,Wrench,Wallet,X} from 'lucide-react'
import * as E from './game'
import type {Game,Item,Lot} from './game'
import './style.css'

const pages=[['Обзор',House],['Аукционы',Gavel],['Мои склады',Warehouse],['Гараж',Archive],['Мастерская',Wrench],['Маркетплейс',ShoppingCart],['Магазин',ShoppingBag],['Задания',CalendarDays],['Профиль',Star],['Настройки',Settings]] as const
const repairSteps:Record<string,string[]>={
  Смартфоны:['Отключить аккумулятор','Снять повреждённый дисплей','Установить новый экран'],
  Компьютеры:['Разобрать корпус','Очистить компоненты','Заменить термоинтерфейс'],
  Консоли:['Открыть корпус','Восстановить охлаждение','Проверить под нагрузкой'],
  Коллекции:['Проверить маркировку','Очистить поверхность','Восстановить механизм'],
  Инструменты:['Снять корпус','Заменить щётки','Проверить привод'],
}
const time=(s:number)=>Math.floor(s/60).toString().padStart(2,'0')+':'+(s%60).toString().padStart(2,'0')
const positive=(n:number)=>(n>0?'+':'')+E.rub(n)
type Dialog={kind:'find'; item:Item; lot:number}|{kind:'repair'|'offer'|'listing'; id:string}
let audioContext:AudioContext|undefined
function sound(volume:number,kind:number){
  if(!volume)return
  try {
    const audio=audioContext??=new AudioContext()
    void audio.resume().catch(()=>{})
    const wave=audio.createOscillator()
    const level=audio.createGain()
    wave.type=kind===0?'triangle':'sine'
    wave.frequency.setValueAtTime([130,330,540,720][kind],audio.currentTime)
    wave.frequency.exponentialRampToValueAtTime([65,180,270,980][kind],audio.currentTime+.14)
    level.gain.setValueAtTime(volume/650,audio.currentTime)
    level.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18)
    wave.connect(level).connect(audio.destination)
    wave.start()
    wave.stop(audio.currentTime+.19)
  } catch { /* Audio can be disabled by the browser. */ }
}
function App(){
  const [game,setGame]=useState<Game>()
  const current=useRef<Game|null>(null)
  const queue=useRef(Promise.resolve())
  const [status,setStatus]=useState('Восстанавливаем прогресс')
  const [failed,setFailed]=useState(false)
  const [saveState,setSaveState]=useState('Локальное сохранение')
  const [page,setPage]=useState(1)
  const [lotId,setLotId]=useState<number|null>(null)
  const watch=useRef<number|null>(null)
  const [filter,setFilter]=useState(-1)
  const [sort,setSort]=useState('date')
  const [category,setCategory]=useState('')
  const [zoom,setZoom]=useState(1)
  const [light,setLight]=useState(false)
  const [dialog,setDialog]=useState<Dialog|null>(null)
  const modal=useRef<HTMLDialogElement>(null)
  const [input,setInput]=useState('')
  const [stage,setStage]=useState(0)
  const [offer,setOffer]=useState(0)
  const [notice,setNotice]=useState('')
  const [photo,setPhoto]=useState(0)

  function persist(next:Game){
    queue.current=queue.current.then(async()=>{
      try{await E.writeSave(next);setSaveState('Прогресс сохранён')}
      catch{setSaveState('Ошибка сохранения')}
    })
  }
  function update(change:(next:Game)=>void){
    if(!current.current)return
    const next=structuredClone(current.current)
    change(next)
    current.current=next
    setGame(next)
    persist(next)
  }
  async function boot(){
    setFailed(false)
    try{
      setStatus('Восстанавливаем прогресс')
      const saved=await E.readSave()
      setStatus('Загружаем аукционы')
      await new Promise(requestAnimationFrame)
      const next=saved??E.initial()
      setStatus('Подготавливаем гараж')
      await E.writeSave(next)
      current.current=next
      setGame(next)
      setSaveState('Прогресс сохранён')
    }catch{setFailed(true)}
  }
  useEffect(()=>{void boot()
    const timer=window.setInterval(()=>{
      if(document.hidden||!current.current)return
      update(next=>E.tick(next,watch.current))
    },1000)
    return ()=>window.clearInterval(timer)
  },[])
  useEffect(()=>{
    if(dialog&&!modal.current?.open)modal.current?.showModal()
    if(!dialog&&modal.current?.open)modal.current.close()
  },[dialog])
  useEffect(()=>{
    if(!notice)return
    const timer=setTimeout(()=>setNotice(''),3500)
    return ()=>clearTimeout(timer)
  },[notice])

  function go(next:number,id:number|null=null){
    setPage(next);setLotId(id);watch.current=next===1?id:null
    setZoom(1);setLight(false);setPhoto(0);setCategory('')
    window.scrollTo(0,0)
  }
  function open(next:Dialog,initial=''){
    setInput(initial);setStage(0);setOffer(0);setDialog(next)
  }
  if(!game)return <div className="splash"><Box size={64}/><h1>MYSTERY<span>BOX</span></h1><small>Storage Empire</small><progress max={3} value={status.startsWith('Вос')?1:status.startsWith('Заг')?2:3}/><p>{failed?'Не удалось открыть локальное сохранение':status}</p>{failed&&<button className="primary" onClick={boot}>Повторить</button>}</div>

  const lot=game.lots.find(l=>l.id===lotId)
  const money=E.available(game)
  const reserved=E.reserved(game)
  const won=game.lots.filter(l=>l.status==='won')
  const active=game.lots.filter(l=>l.status==='idle'||l.status==='live')
  const room=E.used(game)
  const rank=1+Math.floor(game.rep/4)
  const selected=dialog&&dialog.kind!=='find'?game.garage.find(i=>i.id===dialog.id):undefined
  const visibleItems=game.garage.filter(i=>!category||i.category===category).sort((a,b)=>{
    if(sort==='price')return E.value(game,b)-E.value(game,a)
    if(sort==='condition')return b.condition-a.condition
    if(sort==='rarity')return b.rarity-a.rarity
    return b.acquired-a.acquired
  })
  const marketEvent=E.events[game.batch%E.events.length]
  const rescue=money<2300&&!game.rescue&&!game.garage.length&&!reserved&&!won.some(l=>l.opened.length<l.items.length)
  const tasks=[
    ['daily-'+game.day.key,'Купить склад сегодня',game.day.bought,1,1500],
    ['daily-repair-'+game.day.key,'Починить устройство сегодня',game.day.repaired,1,1250],
    ['daily-sale-'+game.day.key,'Продать две находки сегодня',game.day.sold,2,1200],
    ['lots','Купить три склада',won.length,3,3500],
    ['rare','Найти пять редких предметов',game.found,5,4500],
    ['profit','Получить 100 000 ₽ чистой прибыли',game.profit,100000,8500],
    ['repairs','Отремонтировать десять предметов',game.repaired,10,7000],
  ] as const
  function buy(label:string,cost:number,apply:(g:Game)=>void){
    update(g=>{if(E.available(g)<cost)return; E.entry(g,label,-cost);apply(g)})
    sound(game!.volume,2)
  }
  function finishFind(item:Item,id:number,quick:boolean){
    update(g=>{
      const source=g.lots.find(l=>l.id===id&&l.status==='won')
      if(!source||source.opened.includes(item.id)||(!quick&&E.used(g)+item.size>g.capacity))return
      source.opened.push(item.id)
      if(item.rarity>=2)g.found++
      if(quick)E.sale(g,item,Math.round(E.value(g,item)*.63))
      else g.garage.push({...item,acquired:g.time})
    })
    setDialog(null)
    setNotice(quick?'Находка продана':'Находка в гараже')
    sound(game!.volume,quick?3:1)
  }
  function quickSale(item:Item,coefficient:number,label:string){
    update(g=>{
      const target=g.garage.find(i=>i.id===item.id)
      if(target&&!g.listings.some(l=>l.item===item.id))E.sale(g,target,Math.round(E.value(g,target)*coefficient))
    })
    setDialog(null);setNotice(label);sound(game!.volume,3)
  }
  function title(head:string,copy?:string){
    return <div className="heading"><h1>{head}</h1>{copy&&<p>{copy}</p>}</div>
  }
  function cover(l:Lot,inside=false){
    return <div className={'cover '+(inside?'interior':'door door-'+(l.type%3))} style={inside?{transform:'scale('+zoom+')',filter:light?'brightness(1.35)':'',backgroundPosition:photo===0?'3.85% 66.0%':photo===1?'4.65% 66.0%':'3.15% 66.0%'}:undefined} role="img" aria-label={inside?'Коробки и мебель внутри склада':'Закрытый склад'}/>
  }
  function lotCard(l:Lot){
    const [name,,rep,area]=E.categories[l.type]
    return <article className="card lot" key={l.id}>
      <div className="picture">{cover(l)}<span className="lot-tag">№{l.id}</span></div>
      <div className="card-body"><h3>{name} склад</h3><p className="meta">{area} <span>·</span> {10+l.type*7} м²</p>
        <div className="lot-price"><div><small>{l.status==='live'?'Текущая ставка':'Стартовая цена'}</small><strong>{E.rub(l.price)}</strong></div><span className="timer"><Clock3 size={13}/>{l.status==='live'?time(l.left):'Готов к осмотру'}</span></div>
        <button className="primary wide" disabled={game!.rep<rep} onClick={()=>go(1,l.id)}>{game!.rep<rep?'Репутация ≥ '+rep:l.status==='live'?'К торгам':'Осмотреть склад'}</button>
      </div></article>
  }
  function itemCard(i:Item){
    const listing=game!.listings.find(l=>l.item===i.id)
    const condition=i.condition>=80?'good':i.condition>=50?'warn':'bad'
    const repair=repairCost(i)
    return <article className={'card item rarity-'+i.rarity} key={i.id}><div className="item-title"><Box size={25}/><div><small>{i.category}</small><h3>{i.name}</h3></div></div>
      <p className="tag rarity">{E.rarities[i.rarity]}</p>
      <p className="muted">{i.spec} · Комплектность {Math.round(i.complete*100)}%</p>
      <div className="condition"><span className={condition}>Состояние {i.condition}%</span><progress value={i.condition} max={100}/></div>
      <p className="muted">{i.diagnosed?(i.condition>=100?'Исправен':i.fault):'Дефекты не проверены'}</p>
      <p className="item-value">{i.diagnosed||game!.workers.includes(0)||page===5?E.rub(E.value(game!,i)):'Оценка после диагностики'} <small>· {i.size} ед.</small></p>
      {page===3&&<button onClick={()=>go(4)}>В мастерскую</button>}
      {page===4&&(listing?<p>Снимите товар с продажи для ремонта.</p>:<div className="actions">
        {!i.diagnosed&&<button onClick={()=>{update(g=>{const item=g.garage.find(x=>x.id===i.id);if(item)item.diagnosed=true});sound(game!.volume,2)}}>Диагностика</button>}
        {i.diagnosed&&i.condition<100&&<><button className="primary" disabled={money<repair||game!.parts<1} onClick={()=>open({kind:'repair',id:i.id})}>Ремонт · {E.rub(repair)}</button><button onClick={()=>update(g=>{
          const item=g.garage.find(x=>x.id===i.id)
          if(!item||g.listings.some(l=>l.item===i.id))return
          g.garage=g.garage.filter(x=>x.id!==i.id)
          g.parts+=item.size
          E.entry(g,'Утиль · '+item.name,Math.floor(E.value(g,item)*.29),item.lot)
        })}>Разобрать на детали</button></>}
      </div>)}
      {page===5&&(listing?<div className="actions"><span className="tag">{listing.mode==='auction'?'Торги':'Объявление'} · {time(Math.max(0,listing.at-game!.time))}</span><button onClick={()=>update(g=>{g.listings=g.listings.filter(l=>l.item!==i.id)})}>Снять</button></div>:<div className="actions">
        <button className="primary" onClick={()=>quickSale(i,.72,'Быстрая продажа завершена')}>Продать · {E.rub(Math.round(E.value(game!,i)*.72))}</button>
        <button onClick={()=>open({kind:'listing',id:i.id},String(E.value(game!,i)))}>Объявление</button>
        <button onClick={()=>open({kind:'offer',id:i.id},String(E.value(game!,i)))}>Переговоры</button>
        <button onClick={()=>{update(g=>{
          const max=E.marketMax(g,i)
          g.listings.push({item:i.id,price:Math.round(max*(.82+Math.random()*.17)),mode:'auction',at:g.time+24,max})
        });setNotice('Аукцион покупателей открыт')}}>Аукцион</button>
        {i.category==='Коллекции'&&<button disabled={game!.rep<2} onClick={()=>quickSale(i,marketEvent===E.events[5]?1.18:1.02,'Коллекционер принял находку')}>Коллекционеру · реп. 2</button>}
      </div>)}
    </article>
  }
  function repairCost(i:Item){return Math.max(1,Math.ceil(E.repairCost(game!,i)*(game!.tools>1?.82:1)))}
  function repair(i:Item){
    const steps=repairSteps[i.category]
    if(stage+1<steps.length){setStage(stage+1);sound(game!.volume,2);return}
    update(g=>{
      const item=g.garage.find(x=>x.id===i.id)
      const cost=repairCost(i)
      if(!item||!item.diagnosed||item.condition===100||g.parts<1||E.available(g)<cost)return
      g.parts--;item.condition=100;g.repaired++;g.day.repaired++
      E.entry(g,'Ремонт · '+i.name,-cost,item.lot)
    })
    setDialog(null);setNotice('Ремонт завершён');sound(game!.volume,2)
  }
  return <div className={game.effects?'app':'app no-effects'}>
    <aside><button className="brand" onClick={()=>go(0)}><Box size={34}/><span><b>MysteryBox</b><small>STORAGE EMPIRE</small></span></button>
      <nav aria-label="Разделы">{pages.map(([label,Icon],n)=><button className={n===page?'active':''} aria-current={n===page?'page':undefined} key={label} onClick={()=>go(n)}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <div className="aside-footer"><span className="dot"/> Одиночная игра</div>
    </aside>
    <div className="layout"><header className="top"><div className="level"><span>{rank}</span><div><small>Уровень</small><progress max={4} value={game.rep%4}/></div></div>
      <div className="stats"><div><Wallet/><span><small>Доступно</small><b>{E.rub(money)}</b></span></div><div><ChartNoAxesCombined/><span><small>Чистая прибыль</small><b className={game.profit<0?'bad':'good'}>{positive(game.profit)}</b></span></div><div><Star/><span><small>Репутация</small><b>{game.rep}</b></span></div></div>
    </header>
    <main>
    {page===0&&<>{title('Обзор бизнеса','Покупайте склады, восстанавливайте находки и продавайте их с прибылью.')}
      <div className="hero home"><div><span className="eyebrow">СКЛАДСКИЕ АУКЦИОНЫ</span><h2>Следующий склад.<br/>Следующая находка.</h2><button className="primary" onClick={()=>go(1)}>Перейти к торгам</button></div></div>
      <div className="summary"><article className="card"><small>Куплено складов</small><strong>{won.length}</strong></article><article className="card"><small>Место в гараже</small><strong>{room} / {game.capacity}</strong></article><article className="card"><small>Продано находок</small><strong>{game.sold}</strong></article></div>
      {rescue&&<section className="panel"><h2>Разовый заказ</h2><p>Помогите разобрать чужой склад и получите 3 500 ₽.</p><button className="primary" onClick={()=>update(g=>{if(!g.rescue){g.rescue=true;E.entry(g,'Заказ на разбор склада',3500)}})}>Выполнить заказ</button></section>}
      </>}
    {page===1&&!lot&&<>{title('Аукционы','Осмотрите склад перед торгами. Ваши соперники — боты.')}
      <div className="hero auction-hero"><div><span className="eyebrow"><span className="dot"/> ТОРГОВАЯ ПЛОЩАДКА</span><h2>{active.length} {active.length===1?'доступный лот':active.length<5?'доступных лота':'доступных лотов'}</h2><p>Новые склады через <b>{time(300-game.time%300)}</b></p></div></div>
      <div className="filters" aria-label="Категории складов">{['Все',...E.categories.map(c=>c[0])].map((c,n)=><button className={filter===n-1?'selected':''} key={c} onClick={()=>setFilter(n-1)}>{c}</button>)}</div>
      <div className="grid">{active.filter(l=>filter<0||filter===l.type).map(lotCard)}</div>
      {!active.some(l=>filter<0||filter===l.type)&&<div className="empty"><Gavel/><p>В этой категории сейчас нет лотов.</p><button onClick={()=>setFilter(-1)}>Все категории</button></div>}
      {rescue&&<button className="primary" onClick={()=>go(0)}>К разовому заказу</button>}
    </>}
    {page===1&&lot&&<><button className="back" onClick={()=>go(1)}><ArrowLeft size={17}/> Все аукционы</button>{title('Склад №'+lot.id,E.categories[lot.type][4])}
      <div className="split"><section className="card"><div className="inspection">{lot.status==='idle'&&lot.inspect>0||lot.status==='won'?cover(lot,true):cover(lot)}</div>
        {lot.status==='idle'&&lot.inspect>0&&<div className="card-body actions"><button onClick={()=>setZoom(z=>z>=2?1:z+.25)}>Масштаб ×{zoom}</button><button aria-pressed={light} onClick={()=>setLight(!light)}>Фонарик</button><button onClick={()=>setPhoto(p=>(p+1)%3)}>Ракурс {photo+1}</button></div>}
        <div className="card-body"><p className="muted">{E.categories[lot.type][3]} · {10+lot.type*7} м² · {lot.items.length} мест для разбора</p></div>
      </section>
      <section className="panel auction-side"><small>{lot.status==='idle'?'До конца осмотра':lot.status==='live'?'До закрытия торгов':'Торги завершены'}</small><span className="timer"><Clock3 size={15}/>{time(lot.status==='idle'?lot.inspect:lot.left)}</span>
        <small>Текущая ставка</small><strong className="big-price">{E.rub(lot.price)}</strong>
        <p className="muted">Доставка {E.rub(E.delivery(game,lot))}</p>
        {lot.status==='idle'&&<button className="primary wide" disabled={game.rep<E.categories[lot.type][2]} onClick={()=>update(g=>{const l=g.lots.find(x=>x.id===lot.id);if(l?.status==='idle')l.status='live'})}>Начать торги</button>}
        {lot.status==='live'&&<><div className="actions">{[1,2].map(n=><button className="primary" key={n} disabled={lot.leader===5||money<lot.price+E.step(lot.type)*n+E.delivery(game,lot)} onClick={()=>{update(g=>{const l=g.lots.find(x=>x.id===lot.id);if(l)E.bid(g,l,n)});sound(game.volume,0)}}>+ {E.rub(E.step(lot.type)*n)}</button>)}</div><p className="muted">{lot.leader===5?'Вы лидируете. Ставка и доставка зарезервированы.':money<lot.price+E.step(lot.type)+E.delivery(game,lot)?'Недостаточно средств для следующей ставки.':'Ставка в последние 5 секунд продлит торги.'}</p></>}
        {lot.status==='won'&&<button className="primary wide" onClick={()=>go(2,lot.id)}>Открыть купленный склад</button>}
        {lot.status==='lost'&&<p className="muted">{lot.leader===-1?'Лот закрыт без ставок.':'Лот ушёл другому участнику.'}</p>}
        <h3>История ставок</h3>{lot.history.length?lot.history.slice(0,6).map(([name,price],n)=><div className={'row '+(n===0?'leading':'')} key={price}><span>{name}</span><b>{E.rub(price)}</b></div>):<p className="muted">Ставок пока нет.</p>}
      </section></div></>}
    {page===2&&(!lot?<>{title('Мои склады','Купленные боксы и неразобранные находки.')}<div className="grid">{won.map(l=><article className="card lot" key={l.id}><div className="picture">{cover(l)}<span className="lot-tag">№{l.id}</span></div><div className="card-body"><h3>{E.categories[l.type][0]} склад</h3><p className="muted">Открыто {l.opened.length} из {l.items.length}</p><button className="primary wide" onClick={()=>go(2,l.id)}>Войти в склад</button></div></article>)}</div>
    {!won.length&&<div className="empty"><Warehouse/><p>Вы ещё не купили склад.</p><button onClick={()=>go(1)}>На аукционы</button></div>}</>:<>
      <button className="back" onClick={()=>go(2)}><ArrowLeft size={17}/> Мои склады</button>{title('Разбор склада №'+lot.id,'Открыто '+lot.opened.length+' из '+lot.items.length+' · Гараж '+room+' / '+game.capacity)}
      <div className="inspection card">{cover(lot,true)}</div>
      <div className="crate-grid">{lot.items.map((i,n)=><button key={i.id} className="crate" disabled={lot.opened.includes(i.id)} onClick={()=>{open({kind:'find',item:i,lot:lot.id});sound(game.volume,1)}}>{lot.opened.includes(i.id)?<PackageOpen/>:<Box/>}<span>{lot.opened.includes(i.id)?'Открыто':(n===3?'Запертый чемодан':'Коробка')+' №'+(n+1)}</span></button>)}</div>
      {lot.opened.length===lot.items.length&&<button className="primary" onClick={()=>go(3)}>Перейти в гараж</button>}
    </>)}
    {page>=3&&page<=5&&<>{title(pages[page][0],page===3?'Занято '+room+' из '+game.capacity+' единиц хранения':page===4?'Запчасти: '+game.parts+' · Инструменты: уровень '+game.tools:'Рынок · '+marketEvent+' · Комиссия площадки '+Math.round(E.fee(game)*100)+'%')}
      {page===4&&<button className="back" onClick={()=>go(6)}>Купить инструменты и детали</button>}
      <div className="sortbar"><label>Категория <select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Все предметы</option>{[...new Set(game.garage.map(i=>i.category))].map(c=><option key={c}>{c}</option>)}</select></label>
      <label>Сортировка <select value={sort} onChange={e=>setSort(e.target.value)}><option value="date">Сначала новые</option><option value="price">По стоимости</option><option value="condition">По состоянию</option><option value="rarity">По редкости</option></select></label></div>
      <div className="grid">{visibleItems.map(itemCard)}</div>
      {!visibleItems.length&&<div className="empty"><Archive/><p>{game.garage.length?'В этой категории нет предметов.':'Здесь появятся находки из купленных складов.'}</p><button onClick={()=>game.garage.length?setCategory(''):go(won.length?2:1)}>{game.garage.length?'Сбросить фильтр':won.length?'Мои склады':'На аукционы'}</button></div>}
    </>}
    {page===6&&<>{title('Магазин','Оснащение, расширение гаража и сотрудники.')}
      <div className="grid">{[
        ['Стеллажи +10 мест','Ёмкость гаража сейчас '+game.capacity,8500,(g:Game)=>{g.capacity+=10},false],
        ['Набор инструментов','Снижает расходы на ремонт на 18%',12000,(g:Game)=>{g.tools=2},game.tools>=2],
        ['Комплект запчастей','3 детали для ремонта',2600,(g:Game)=>{g.parts+=3},false],
      ].map(([label,desc,cost,apply,owned])=><article className="card card-body" key={String(label)}><h3>{String(label)}</h3><p className="muted">{String(desc)}</p><button className="primary" disabled={Boolean(owned)||money<Number(cost)} onClick={()=>buy(String(label),Number(cost),apply as (g:Game)=>void)}>{owned?'Установлено':E.rub(Number(cost))}</button></article>)}</div>
      <h2>Сотрудники</h2><div className="grid">{E.staff.map(([name,salary,benefit],n)=><article className="card card-body" key={name}><h3>{name}</h3><p className="muted">{benefit}. Зарплата {E.rub(salary)} за смену (5 минут).</p>{game.workers.includes(n)?<button onClick={()=>update(g=>{if(n!==3||E.reserved(g)===0)g.workers=g.workers.filter(x=>x!==n)})} disabled={n===3&&reserved>0}>Уволить</button>:<button className="primary" disabled={money<salary||game.rep<2} onClick={()=>buy('Найм · '+name,salary,g=>g.workers.push(n))}>Нанять · {game.rep<2?'репутация 2':E.rub(salary)}</button>}</article>)}</div>
    </>}
    {page===7&&<>{title('Задания','Ежедневные и постоянные цели.')}<div className="grid">{tasks.map(([id,label,done,target,reward])=><article className="card card-body" key={id}><h3>{label}</h3><p className="muted">{Math.max(0,Math.min(done,target))} / {target}</p><progress value={Math.max(0,done)} max={target}/><p><button disabled={done<target||game.claims.includes(id)} className="primary" onClick={()=>update(g=>{if(g.claims.includes(id))return;g.claims.push(id);E.entry(g,'Награда · '+label,reward,undefined,false)})}>{game.claims.includes(id)?'Получено':'Получить '+E.rub(reward)}</button></p></article>)}</div></>}
    {page===8&&<>{title('Профиль','Статистика сделок и движения денег.')}<div className="summary">
      <article className="card"><small>Чистая прибыль</small><strong>{positive(game.profit)}</strong></article><article className="card"><small>Самая дорогая продажа</small><strong>{E.rub(game.record)}</strong></article><article className="card"><small>Куплено складов</small><strong>{won.length}</strong></article><article className="card"><small>Лучший результат по складу</small><strong>{E.rub(Math.max(0,...won.map(l=>l.net)))}</strong></article><article className="card"><small>Наибольшие расходы по складу</small><strong>{E.rub(Math.min(0,...won.map(l=>l.net)))}</strong></article><article className="card"><small>Ремонтов</small><strong>{game.repaired}</strong></article></div>
      <section className="panel"><h2>Журнал операций</h2>{game.ledger.length?game.ledger.map((e,n)=><div className="row" key={n}><span>{e.label}</span><b className={e.amount>0?'good':'bad'}>{positive(e.amount)}</b></div>):<p className="muted">Операций пока нет.</p>}</section></>}
    {page===9&&<>{title('Настройки')}<section className="panel settings"><label>Громкость · {game.volume}% <input type="range" min="0" max="100" value={game.volume} onChange={e=>update(g=>{g.volume=Number(e.target.value)})}/></label><button onClick={()=>sound(game.volume,3)} disabled={!game.volume}>Проверить звук</button><label><input type="checkbox" checked={game.effects} onChange={e=>update(g=>{g.effects=e.target.checked})}/> Визуальные эффекты</label><p className="muted">{saveState}. Сохранение привязано к этому браузеру и адресу игры.</p><button onClick={()=>persist(game)}>Сохранить сейчас</button></section></>}
    </main><footer><CircleHelp size={15}/> Виртуальные деньги · Торги против ботов <span>{saveState}</span></footer></div>
    <dialog ref={modal} aria-labelledby="modal-title" onClose={()=>setDialog(null)}>
      {dialog&&<><button className="close" aria-label="Закрыть" onClick={()=>setDialog(null)}><X size={19}/></button>
      {dialog.kind==='find'&&<div className={'discovery rarity-'+dialog.item.rarity}><PackageOpen size={52}/><p className="eyebrow">НАЙДЕН ПРЕДМЕТ</p><h2 id="modal-title">{dialog.item.name}</h2><span className="tag rarity">{E.rarities[dialog.item.rarity]}</span><p className="muted">{dialog.item.spec}</p><p>Состояние {dialog.item.condition}% · {dialog.item.size} ед.</p><strong>{E.rub(E.value(game,dialog.item))}</strong>
        <div className="actions"><button className="primary" disabled={room+dialog.item.size>game.capacity} onClick={()=>finishFind(dialog.item,dialog.lot,false)}>Забрать в гараж</button><button onClick={()=>finishFind(dialog.item,dialog.lot,true)}>Продать за {E.rub(Math.round(E.value(game,dialog.item)*.63))}</button></div>
        {room+dialog.item.size>game.capacity&&<p className="warn">В гараже не хватает места. Находку можно оставить в складе.</p>}</div>}
      {dialog.kind==='repair'&&selected&&<><h2 id="modal-title">Ремонт</h2><p>{selected.name} · {E.rub(repairCost(selected))}</p><p className="muted">Выполните операции в правильном порядке.</p><progress max={repairSteps[selected.category].length} value={stage}/>
        <div className="actions">{[...repairSteps[selected.category]].reverse().map((label,n)=><button key={label} disabled={repairSteps[selected.category].length-1-n<stage} onClick={()=>label===repairSteps[selected.category][stage]?repair(selected):setNotice('Сначала: '+repairSteps[selected.category][stage])}>{label}</button>)}</div></>}
      {(dialog.kind==='offer'||dialog.kind==='listing')&&selected&&<><h2 id="modal-title">{dialog.kind==='offer'?'Переговоры':'Новое объявление'}</h2><p>{selected.name}</p>
        {dialog.kind==='offer'&&<p className="muted">{offer<0?'Покупатель отклонил цену.':offer>0?'Встречное предложение: '+E.rub(offer):'Покупатель предлагает '+E.rub(Math.round(E.marketMax(game,selected)*.79))}</p>}
        <form onSubmit={e=>{
          e.preventDefault()
          const price=Number(input)
          if(!Number.isSafeInteger(price)||price<1||price>10000000)return
          const max=E.marketMax(game,selected)
          if(dialog.kind==='listing'){
            update(g=>{if(!g.listings.some(l=>l.item===selected.id))g.listings.push({item:selected.id,price,mode:'listing',max,at:g.time+35})});setDialog(null);setNotice('Объявление опубликовано на 35 секунд')
          }else if(price<=max*.95){quickSale(selected,price/E.value(game,selected),'Покупатель принял цену')}
          else setOffer(price>max*1.35?-1:Math.round(max*.93))
        }}><label>Ваша цена <input type="number" min="1" max="10000000" required value={input} onChange={e=>setInput(e.target.value)}/></label><div className="actions"><button className="primary">{dialog.kind==='offer'?'Предложить цену':'Опубликовать'}</button>{dialog.kind==='offer'&&offer>=0&&<button type="button" onClick={()=>quickSale(selected,(offer||Math.round(E.marketMax(game,selected)*.79))/E.value(game,selected),'Сделка завершена')}>Принять предложение</button>}</div></form></>}
      </>}
    </dialog>
    {notice&&<div className="toast" role="status">{notice}</div>}
  </div>
}
createRoot(document.getElementById('root')!).render(<App/>)

