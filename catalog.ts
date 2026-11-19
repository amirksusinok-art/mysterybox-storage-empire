// Prices are game parameters. Model names describe retail products, not randomized hardware specifications.
export type Product = readonly [name:string, category:string, base:number, spec:string, fault:string, image?:string]
type Family = readonly [prefix:string, category:string, price:number, spec:string, fault:string, models:string]

const families: readonly Family[] = [
  ['Apple iPhone','Смартфоны',24000,'Смартфон iOS','Износ аккумулятора',
    '11|11 Pro|11 Pro Max|12|12 mini|12 Pro|12 Pro Max|13|13 mini|13 Pro|13 Pro Max|14|14 Plus|14 Pro|14 Pro Max|15|15 Plus|15 Pro|15 Pro Max|16|16 Plus|16 Pro|16 Pro Max|16e'],
  ['Samsung Galaxy','Смартфоны',20000,'Смартфон Android','Выгорание дисплея',
    'S20|S20+|S20 Ultra|S20 FE|S21|S21+|S21 Ultra|S21 FE|S22|S22+|S22 Ultra|S23|S23+|S23 Ultra|S23 FE|S24|S24+|S24 Ultra|S24 FE|S25|S25+|S25 Ultra|Z Flip4|Z Flip5|Z Fold4|Z Fold5'],
  ['Google Pixel','Смартфоны',19000,'Смартфон Android','Люфт разъёма зарядки',
    '6|6 Pro|6a|7|7 Pro|7a|8|8 Pro|8a|9|9 Pro|9 Pro XL|9 Pro Fold|9a'],
  ['Xiaomi','Смартфоны',15000,'Смартфон Android','Износ аккумулятора',
    'Mi 11|11T|11T Pro|12|12 Pro|12T|12T Pro|13|13 Pro|13T|13T Pro|14|14 Ultra|14T|14T Pro'],
  ['Redmi','Смартфоны',9500,'Смартфон Android','Не работает микрофон',
    'Note 7|Note 8|Note 8 Pro|Note 9|Note 9S|Note 9 Pro|Note 10|Note 10S|Note 10 Pro|Note 11|Note 11S|Note 12|Note 12 Pro 5G|Note 13|Note 13 Pro 5G'],
  ['OnePlus','Смартфоны',16500,'Смартфон Android','Люфт разъёма зарядки',
    '8T|9|9 Pro|10 Pro|10T|11|12|12R|Nord|Nord 2|Nord 3|Nord 4'],
  ['Nothing','Смартфоны',19000,'Смартфон Android','Не работает вибромотор','Phone (1)|Phone (2)|Phone (2a)|Phone (2a) Plus|Phone (3a)|Phone (3a) Pro'],
  ['NVIDIA GeForce','Видеокарты',18000,'Дискретная видеокарта','Повышенный шум вентилятора',
    'GTX 1050|GTX 1050 Ti|GTX 1060|GTX 1070|GTX 1070 Ti|GTX 1080|GTX 1080 Ti|GTX 1650|GTX 1650 SUPER|GTX 1660|GTX 1660 SUPER|GTX 1660 Ti|RTX 2060|RTX 2060 SUPER|RTX 2070|RTX 2070 SUPER|RTX 2080|RTX 2080 SUPER|RTX 2080 Ti|RTX 3050|RTX 3060|RTX 3060 Ti|RTX 3070|RTX 3070 Ti|RTX 3080|RTX 3080 Ti|RTX 3090|RTX 3090 Ti|RTX 4060|RTX 4060 Ti|RTX 4070|RTX 4070 SUPER|RTX 4070 Ti|RTX 4070 Ti SUPER|RTX 4080|RTX 4080 SUPER|RTX 4090'],
  ['AMD Radeon','Видеокарты',16000,'Дискретная видеокарта','Износ термоинтерфейса',
    'RX 460|RX 470|RX 480|RX 550|RX 560|RX 570|RX 580|RX 590|RX 5500 XT|RX 5600 XT|RX 5700|RX 5700 XT|RX 6400|RX 6500 XT|RX 6600|RX 6600 XT|RX 6650 XT|RX 6700 XT|RX 6750 XT|RX 6800|RX 6800 XT|RX 6900 XT|RX 6950 XT|RX 7600|RX 7600 XT|RX 7700 XT|RX 7800 XT|RX 7900 GRE|RX 7900 XT|RX 7900 XTX'],
  ['AMD Ryzen','Процессоры',9500,'Настольный процессор','Загрязнены контакты',
    '5 1600|5 2600|5 3600|5 3600X|5 4500|5 5500|5 5600|5 5600G|5 5600X|5 7500F|5 7600|5 7600X|5 9600X|7 1700|7 2700X|7 3700X|7 3800X|7 5700X|7 5700G|7 5700X3D|7 5800X|7 5800X3D|7 7700|7 7700X|7 7800X3D|7 9700X|7 9800X3D|9 3900X|9 3950X|9 5900X|9 5950X|9 7900X|9 7950X|9 7950X3D'],
  ['Intel Core','Процессоры',11000,'Настольный процессор','Загрязнены контакты',
    'i3-8100|i3-9100F|i3-10100F|i3-12100F|i3-13100F|i5-8400|i5-9400F|i5-10400F|i5-11400F|i5-12400F|i5-12600K|i5-13400F|i5-13600K|i5-14400F|i5-14600K|i7-8700K|i7-9700K|i7-10700K|i7-11700K|i7-12700K|i7-13700K|i7-14700K|i9-9900K|i9-10900K|i9-11900K|i9-12900K|i9-13900K|i9-14900K'],
  ['Lenovo ThinkPad','Компьютеры',22000,'Ноутбук бизнес-класса','Забита система охлаждения','T420|T430|T440p|T450|T460|T470|T480s|T490|X220|X230|X240|X250|X260|X270|X280|P50|P51|P52|P53'],
  ['Dell OptiPlex','Компьютеры',18000,'Офисный компьютер','Слабая батарея CMOS','3020|3040|3050|3060|3070|3080|390|7010|7040|7050|7060|7070|790|9020'],
  ['Samsung','Комплектующие',6500,'Твердотельный накопитель','Накопитель требует проверки SMART','850 EVO|860 EVO|870 EVO|870 QVO|960 EVO|970 EVO|970 EVO Plus|980|980 PRO|990 EVO|990 PRO'],
  ['Sony','Консоли',19000,'Игровая система','Требуется чистка охлаждения','PlayStation|PS one|PlayStation 2|PlayStation 2 Slim|PlayStation 3|PlayStation 3 Slim|PlayStation 3 Super Slim|PlayStation 4|PlayStation 4 Slim|PlayStation 4 Pro|PlayStation 5|PlayStation 5 Digital Edition|PlayStation 5 Slim|PlayStation 5 Pro|PSP-1000|PSP-2000|PSP-3000|PSP Go|PS Vita PCH-1000|PS Vita PCH-2000'],
  ['Microsoft','Консоли',19000,'Игровая система','Нестабильный разъём питания','Xbox|Xbox 360|Xbox 360 S|Xbox 360 E|Xbox One|Xbox One S|Xbox One X|Xbox Series S|Xbox Series X'],
  ['Nintendo','Консоли',16500,'Игровая система','Требуется чистка контактов','NES|Super NES|64|GameCube|Wii|Wii U|Game Boy|Game Boy Pocket|Game Boy Color|Game Boy Advance|Game Boy Advance SP|Game Boy Micro|DS|DS Lite|DSi|3DS|3DS XL|2DS|New Nintendo 3DS XL|Switch|Switch Lite|Switch OLED'],
  ['Makita','Инструменты',7500,'Электроинструмент','Износ патрона','DDF453|DDF482|DDF484|DDF487|DDF489|DDF486|DHP482|DHP484|DTD152|DTD154|DTD172|HR2470|HR2630|GA5030|GA9020'],
  ['Bosch','Инструменты',8400,'Электроинструмент','Износ редуктора','GSB 13 RE|GSB 16 RE|GBH 2-26 DRE|GBH 2-28 F|GSR 12V-15|GSR 12V-35|GSR 18V-50|GSR 18V-55|GWS 7-125|GWS 9-125 S'],
  ['DeWalt','Инструменты',9000,'Электроинструмент','Нестабильный выключатель','DCD771|DCD776|DCD777|DCD791|DCD796|DCD996|DCF887|DCF850|DCG405|DWE4257'],
  ['Canon EOS','Фото',17000,'Цифровой фотоаппарат','Заедает механизм затвора','350D|400D|450D|500D|550D|600D|650D|700D|750D|800D|60D|70D|80D|90D|7D|5D Mark II|5D Mark III|6D|M50|R50'],
  ['Nikon','Фото',17500,'Цифровой фотоаппарат','Загрязнена матрица','D3100|D3200|D3300|D3400|D3500|D5000|D5100|D5200|D5300|D5500|D5600|D7000|D7100|D7200|D7500|D750'],
  ['Зенит','Коллекции',7500,'Плёночный зеркальный фотоаппарат','Требуется профилактика затвора','Е|ЕТ|ЕМ|11|12сд|19'],
  ['Casio','Коллекции',6000,'Электронные наручные часы','Износ уплотнения','F-91W|A158WA|A168WA|CA-53W|DW-5600E|DW-6900|AE-1200WH'],
  ['Commodore','Ретро',16000,'Ретрокомпьютер','Окислились контакты','64|128|VIC-20|Plus/4|Amiga 500|Amiga 600|Amiga 1200'],
  ['DJI','Дроны',29000,'Камерный квадрокоптер','Требуется замена пропеллеров','Mavic Mini|Mini 2|Mini 2 SE|Mini 3|Mini 3 Pro|Mini 4 Pro|Mavic Air|Air 2S|Air 3'],
  ['JBL','Аудио',8900,'Портативная акустика Bluetooth','Износ аккумулятора','Flip 4|Flip 5|Flip 6|Charge 3|Charge 4|Charge 5|Go 2|Go 3|Go 4|Clip 3|Clip 4'],
  ['Dell','Мониторы',14500,'ЖК-монитор','Неравномерная подсветка','U2412M|U2415|U2419H|U2422H|U2520D|U2719D|U2720Q|U2723QE|P2419H|P2422H'],
  ['LG','Мониторы',18000,'ЖК-дисплей','Нестабильная подсветка','24MP59G|27GL850|27GN850|27GP850|32UN650|OLED55C1|OLED55C2|OLED55C3'],
  ['Dyson','Бытовая техника',14500,'Беспроводной пылесос','Засорён фильтр','V6|V7|V8|Cyclone V10|V11|V12 Detect Slim|V15 Detect'],
  ['De’Longhi','Бытовая техника',17000,'Кофемашина','Накипь в водяном контуре','EC685|EC785|EC885|ECAM 22.110.B|ECAM 23.460.S|ECAM 350.55.B|ECAM 290.61.B'],
  ['KitchenAid','Бытовая техника',19000,'Планетарный миксер','Шум при нагрузке','Artisan 5KSM125|Artisan 5KSM175PS|Classic 5K45SS'],
  ['Trek','Велосипеды',18000,'Горный велосипед','Необходима регулировка трансмиссии','Marlin 4|Marlin 5|Marlin 6|Marlin 7|Marlin 8'],
]

const appleChips:Record<string,string>={'11':'A13 Bionic','12':'A14 Bionic','13':'A15 Bionic','14':'A15 Bionic','15':'A16 Bionic','16':'A18'}
function iPhoneSpec(model:string){
  const series=model.slice(0,2)
  const pro=model.includes('Pro')
  const chip=series==='14'&&pro?'A16 Bionic':series==='15'&&pro?'A17 Pro':series==='16'&&pro?'A18 Pro':appleChips[series]
  const diagonal=model.includes('mini')?'5,4':model.includes('Plus')?'6,7':model.includes('Max')?(series==='11'?'6,5':series==='16'?'6,9':'6,7'):model==='11 Pro'?'5,8':model==='16 Pro'?'6,3':'6,1'
  const screen=model==='11'?'LCD':'OLED'
  return chip+' · '+diagonal+'″ '+screen
}

const exact: Record<string,[string,string?]> = {
  'Apple iPhone 13':['A15 Bionic · 6,1″ OLED · 128/256/512 ГБ','phone'],
  'Apple iPhone 11':['A13 Bionic · 6,1″ LCD · 64/128/256 ГБ'],
  'Apple iPhone 16':['A18 · 6,1″ OLED · 128/256/512 ГБ'],
  'NVIDIA GeForce GTX 1080 Ti':['Pascal · 11 ГБ GDDR5X'],
  'NVIDIA GeForce RTX 2060':['Turing · 6 или 12 ГБ GDDR6'],
  'NVIDIA GeForce RTX 3060':['Ampere · 8 или 12 ГБ GDDR6'],
  'NVIDIA GeForce RTX 3080':['Ampere · 10 или 12 ГБ GDDR6X'],
  'NVIDIA GeForce RTX 4070':['Ada Lovelace · 12 ГБ видеопамяти'],
  'AMD Ryzen 5 5600':['Zen 3 · 6 ядер / 12 потоков · AM4','cpu'],
  'AMD Ryzen 7 7800X3D':['Zen 4 · 8 ядер / 16 потоков · AM5'],
  'Intel Core i7-12700K':['Alder Lake · 12 ядер (8P+4E) · LGA1700'],
  'Sony PlayStation 2':['Emotion Engine · привод DVD','console'],
  'Sony PlayStation 5':['AMD Zen 2 · графика RDNA 2 · SSD'],
  'Canon EOS 600D':['APS-C CMOS · 18 Мп · байонет EF/EF-S','camera'],
  'Makita DDF482':['18 В LXT · патрон до 13 мм','drill'],
  'KitchenAid Artisan 5KSM125':['Чаша 4,8 л · 10 скоростей'],
}

export const catalog: Product[] = families.flatMap(([prefix,category,price,spec,fault,models])=>
  models.split('|').map(model=>{
    const name=prefix+' '+model
    const info=exact[name]
    return [name,category,price,info?.[0]??(prefix==='Apple iPhone'?iPhoneSpec(model):spec),fault,info?.[1]]
  }),
)
