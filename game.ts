export const categories = [
  ['Маленький',2000,0,'Пригород','Из мотомастерской остались инструменты и ящики.'],
  ['Обычный',8000,0,'Промзона','Семья съехала и оставила часть имущества.'],
  ['Электронный',20000,0,'Технопарк','Склад закрывшейся ремонтной точки.'],
  ['Коллекционный',35000,1,'Центр','Бокс бывшего организатора выставок.'],
  ['Заброшенный',15000,0,'Промзона','Аренда просрочена. Часть тары повреждена.'],
  ['Огромный',70000,5,'Промзона','Архив и оборудование торговой компании.'],
  ['Элитный',150000,10,'Северный квартал','Хранилище владельца частной галереи.'],
] as const
const models = [
  ['Шуруповёрт Makita DDF482','Инструменты',5800,'Редуктор, патрон 13 мм, 18 В','Изношены щётки'],
  ['Ноутбук ThinkPad T480','Компьютеры',24000,'Core i5, 16 ГБ, SSD 512 ГБ, 84 °C','Забита система охлаждения'],
  ['Смартфон Pixel 7','Смартфоны',28000,'128 ГБ, батарея 81%, OLED','Трещина дисплея'],
  ['PlayStation 4 Pro','Консоли',23000,'1 ТБ, геймпад и кабель питания','Перегрев под нагрузкой'],
  ['Камера Zenit TTL','Коллекции',16000,'Гелиос-44М, футляр и паспорт','Заедает затвор'],
  ['RTX 3080 Founders Edition','Компьютеры',62000,'10 ГБ GDDR6X, 320 Вт, 89 °C','Высохли термопрокладки'],
  ['Часы Восток Амфибия','Коллекции',35000,'Автоматический механизм, оригинальный браслет','Требуется проверка подлинности'],
  ['Проигрыватель Dual 505','Коллекции',37000,'Ременной привод, крышка и картридж','Растянут приводной ремень'],
] as const
export const rarities = ['Обычный','Необычный','Редкий','Эпический','Легендарный','Мифический']
export const bots = ['Новичок','Перекупщик','Коллекционер','Богач','Аналитик']
export const staff = [
  ['Оценщик',600,'Оценка рынка до диагностики'],
  ['Механик',900,'Скидка 30% на ремонт'],
  ['Продавец',700,'Меньше комиссия'],
  ['Грузчик',500,'Скидка 60% на доставку'],
] as const
export const events = ['Обычный спрос','Спрос на игровые ПК','Спад цен на консоли','Неделя ретро','Сезонная распродажа','Заказ коллекционеров']
export type Item = {id:string; name:string; category:string; base:number; spec:string; fault:string; condition:number; rarity:number; size:number; complete:number; diagnosed:boolean; acquired:number; lot:number}
export type Lot = {id:number; type:number; items:Item[]; opened:string[]; status:'idle'|'live'|'won'|'lost'; price:number; leader:number; left:number; limits:number[]; history:[string,number][]; net:number; inspect:number}
export type Listing = {item:string; price:number; mode:'listing'|'auction'; at:number; max:number}
export type Game = {cash:number; profit:number; rep:number; time:number; batch:number; next:number; lots:Lot[]; garage:Item[]; ledger:{label:string; amount:number}[]; listings:Listing[]; capacity:number; tools:number; parts:number; workers:number[]; rescue:boolean; sold:number; repaired:number; found:number; record:number; volume:number; effects:boolean; claims:string[]; day:{key:string; bought:number; repaired:number; sold:number}}
export const rub = (n:number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
export const dayKey = () => new Date().toLocaleDateString('sv-SE')
const roll = (n:number) => Math.floor(Math.random()*n)
const count = [2,3,4,4,4,6,7]
const pools = [[0,0,4],[0,1,2,3,4],[1,2,3,5],[4,6,7],[0,1,3,7],[1,2,3,5,6,7],[5,6,7]]
export function makeLot(id:number,type:number):Lot {
  const start = categories[type][1]
  const items = Array.from({length:count[type]},(_,index):Item=>{
    const pool=pools[type]
    const [name,category,base,spec,fault]=models[pool[roll(pool.length)]]
    const rarityRoll=roll(100)
    const rarity=rarityRoll<45?0:rarityRoll<72?1:rarityRoll<88?2:rarityRoll<96?3:rarityRoll<99?4:5
    const condition=type===4?25+roll(50):44+roll(50)
    return {id:id+'-'+index,name,category,base,spec,fault,condition,rarity,size:category==='Компьютеры'||name.includes('Dual')?3:1,complete:roll(5)===0?0.8:1,diagnosed:false,acquired:0,lot:id}
  })
  return {id,type,items,opened:[],status:'idle',price:start,leader:-1,left:32,inspect:30,net:0,history:[],limits:bots.map((_,index)=>start+step(type)*(1+roll(4)+index+(index===2&&type===3?4:0)+(index===3&&type>4?5:0)))}
}
export function initial():Game {
  return {cash:50000,profit:0,rep:0,time:0,batch:0,next:1043,lots:[makeLot(1040,0),makeLot(1041,1),makeLot(1042,2)],garage:[],ledger:[],listings:[],capacity:20,tools:1,parts:2,workers:[],rescue:false,sold:0,repaired:0,found:0,record:0,volume:45,effects:true,claims:[],day:{key:dayKey(),bought:0,repaired:0,sold:0}}
}
export const step=(type:number)=>[250,500,1000,1500,750,2500,5000][type]
export const delivery=(g:Game,l:Lot)=>Math.round((300+l.type*230)*(g.workers.includes(3)?0.4:1))
export const reserved=(g:Game)=>g.lots.reduce((sum,l)=>sum+(l.status==='live'&&l.leader===5?l.price+delivery(g,l):0),0)
export const available=(g:Game)=>g.cash-reserved(g)
export const used=(g:Game)=>g.garage.reduce((sum,i)=>sum+i.size,0)
export function value(g:Game,i:Item) {
  const event=g.batch%events.length
  const demand=event===1&&i.category==='Компьютеры'?1.2:event===2&&i.category==='Консоли'?0.76:(event===3||event===5)&&i.category==='Коллекции'?1.22:event===4?0.9:1
  return Math.round(i.base*(0.18+0.82*i.condition/100)*(1+i.rarity*0.12)*i.complete*demand)
}
export const repairCost=(g:Game,i:Item)=>Math.ceil(i.base*(100-i.condition)/100*0.24*(g.workers.includes(1)?0.7:1))
export const fee=(g:Game)=>g.workers.includes(2)?0.04:0.08
export const marketMax=(g:Game,i:Item)=>Math.round(value(g,i)*(1+Math.min(g.rep,20)/100))
export function entry(g:Game,label:string,amount:number,lot?:number,operating=true) {
  g.cash+=amount
  if(operating) g.profit+=amount
  const source=g.lots.find(l=>l.id===lot)
  if(source) source.net+=amount
  g.ledger.unshift({label,amount})
  g.ledger=g.ledger.slice(0,60)
}
export function bid(g:Game,l:Lot,multiplier:number) {
  const price=l.price+step(l.type)*multiplier
  const extra=l.leader===5?l.price+delivery(g,l):0
  if(l.status!=='live'||l.leader===5||available(g)+extra<price+delivery(g,l)) return
  l.price=price
  l.leader=5
  l.history.unshift(['Вы',price])
  if(l.left<=5) l.left+=10
}
export function sale(g:Game,i:Item,price:number,commission=0) {
  const net=Math.round(price*(1-commission))
  entry(g,'Продажа · '+i.name,net,i.lot)
  g.listings=g.listings.filter(l=>l.item!==i.id)
  g.garage=g.garage.filter(x=>x.id!==i.id)
  g.sold++
  g.day.sold++
  g.rep++
  g.record=Math.max(g.record,net)
}
export function tick(g:Game,watch:number|null) {
  if(g.day.key!==dayKey()) g.day={key:dayKey(),bought:0,repaired:0,sold:0}
  g.time++
  if(g.time%300===0){
    g.batch++
    for(const worker of [...g.workers]){
      const [,salary]=staff[worker]
      if(available(g)>=salary) entry(g,'Зарплата · '+staff[worker][0],-salary)
      else g.workers=g.workers.filter(w=>w!==worker)
    }
    g.lots=g.lots.filter(l=>l.status!=='idle'&&l.status!=='lost')
    const types=[0,1,2+(g.batch%5),g.batch%2===0?3:4]
    g.lots.push(...types.map(type=>makeLot(g.next++,type)))
  }
  for(const l of g.lots){
    if(l.status==='idle'&&l.id===watch&&l.inspect>0) l.inspect--
    if(l.status!=='live') continue
    l.left--
    const amount=l.price+step(l.type)
    const contenders=l.limits.map((limit,index)=>({limit,index})).filter(b=>amount<=b.limit&&b.index!==l.leader)
    const chance=l.leader===5?27:12
    if(l.left>0&&contenders.length&&roll(100)<chance){
      const bot=contenders[roll(contenders.length)]
      l.leader=bot.index
      l.price=amount
      l.history.unshift([bots[bot.index],amount])
      if(l.left<=5) l.left+=10
    }
    if(l.left>0) continue
    l.status=l.leader===5?'won':'lost'
    if(l.status==='won'){
      entry(g,'Покупка склада №'+l.id,-l.price,l.id)
      entry(g,'Доставка №'+l.id,-delivery(g,l),l.id)
      g.rep++
      g.day.bought++
    }
  }
  for(const listing of [...g.listings]){
    if(listing.at>g.time) continue
    const item=g.garage.find(i=>i.id===listing.item)
    if(item&&listing.price<=listing.max) sale(g,item,listing.price,fee(g))
    else g.listings=g.listings.filter(l=>l.item!==listing.item)
  }
}
let database:Promise<IDBDatabase>|undefined
function db() {
  return database??=new Promise((resolve,reject)=>{
    const request=indexedDB.open('mysterybox-storage-empire',1)
    request.onupgradeneeded=()=>request.result.createObjectStore('saves')
    request.onsuccess=()=>resolve(request.result)
    request.onerror=()=>{database=undefined;reject(request.error)}
  })
}
export async function readSave():Promise<Game|undefined>{
  const connection=await db()
  return new Promise((resolve,reject)=>{
    const request=connection.transaction('saves').objectStore('saves').get('main')
    request.onsuccess=()=>resolve(request.result)
    request.onerror=()=>reject(request.error)
  })
}
export async function writeSave(game:Game){
  const connection=await db()
  return new Promise<void>((resolve,reject)=>{
    const transaction=connection.transaction('saves','readwrite')
    transaction.objectStore('saves').put(game,'main')
    transaction.oncomplete=()=>resolve()
    transaction.onabort=()=>reject(transaction.error)
  })
}