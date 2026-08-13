const $=s=>document.querySelector(s);const pad=n=>String(n).padStart(2,'0');
const today=new Date();today.setHours(0,0,0,0);const initialReplace=new Date(today);initialReplace.setDate(today.getDate()+4);
const state={replaceDate:initialReplace,available:[],skills:['Голосовая поддержка L1'],customSkills:[],customOpen:false,cardStyle:0,viewReplace:new Date(today.getFullYear(),today.getMonth(),1),viewAvailable:new Date(today.getFullYear(),today.getMonth(),1)};
const months=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const fmt=d=>`${pad(d.getDate())}.${pad(d.getMonth()+1)}.${String(d.getFullYear()).slice(-2)}`;const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
function monthMarkup(view,selected,multi=false){const y=view.getFullYear(),m=view.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate();let html=`<div class="calendar-header"><button class="calendar-nav prev" type="button" aria-label="Предыдущий месяц">‹</button><div class="calendar-title">${months[m]} ${y}</div><button class="calendar-nav next" type="button" aria-label="Следующий месяц">›</button></div><div class="calendar-grid">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(x=>`<span class="weekday">${x}</span>`).join('')}`;for(let i=0;i<first;i++)html+='<span></span>';for(let d=1;d<=days;d++){const date=new Date(y,m,d),isPast=date<today,isSelected=multi?selected.includes(key(date)):selected&&key(date)===key(selected);html+=`<button type="button" class="day ${isSelected?'selected':''} ${key(date)===key(today)?'today':''} ${isPast?'disabled':''}" data-date="${key(date)}" ${isPast?'disabled':''}>${d}</button>`}return html+'</div>'}
function parseDate(v){const [y,m,d]=v.split('-').map(Number);return new Date(y,m-1,d)}
function bindCalendar(root,type){root.querySelector('.prev').onclick=()=>{state[type].setMonth(state[type].getMonth()-1);renderCalendars()};root.querySelector('.next').onclick=()=>{state[type].setMonth(state[type].getMonth()+1);renderCalendars()};root.querySelectorAll('.day:not(.disabled)').forEach(b=>b.onclick=()=>{const d=parseDate(b.dataset.date);if(type==='viewReplace'){state.replaceDate=d;$('#replaceCalendar').hidden=true}else{const k=key(d),i=state.available.indexOf(k);i>=0?state.available.splice(i,1):state.available.push(k);state.available.sort()}renderCalendars();drawCard();save()})}
function dateLabel(date,withYear=false){return new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'short',...(withYear?{year:'numeric'}:{})}).format(date).replace('.','')}
function renderCalendars(){const pop=$('#replaceCalendar'),inline=$('#availableCalendar');pop.innerHTML=monthMarkup(state.viewReplace,state.replaceDate);inline.innerHTML=monthMarkup(state.viewAvailable,state.available,true);bindCalendar(pop,'viewReplace');bindCalendar(inline,'viewAvailable');$('#replaceDateText').textContent=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(state.replaceDate);$('#dateCounter').textContent=`${state.available.length} выбрано`;const years=new Set(state.available.map(v=>parseDate(v).getFullYear()));$('#selectedDateList').innerHTML=state.available.length?state.available.map(v=>{const d=parseDate(v);return `<span class="selected-date-chip"><strong>${pad(d.getDate())}</strong>${months[d.getMonth()]}${years.size>1?` ${d.getFullYear()}`:''}</span>`}).join(''):'<span class="selected-date-empty">Выбранные даты появятся здесь</span>'}
$('#replaceDateButton').onclick=()=>$('#replaceCalendar').hidden=!$('#replaceCalendar').hidden;document.addEventListener('click',e=>{const path=e.composedPath();if(!path.includes($('#replaceCalendar'))&&!path.includes($('#replaceDateButton')))$('#replaceCalendar').hidden=true});
function syncSkills(){document.querySelectorAll('[data-skill]').forEach(b=>b.classList.toggle('active',state.skills.includes(b.dataset.skill)));$('#customSkillButton').classList.toggle('active',state.customOpen||state.customSkills.length>0);$('#customSkillWrap').hidden=!state.customOpen;$('#customSkillList').innerHTML=state.customSkills.map((s,i)=>`<button type="button" class="custom-skill-tag" data-index="${i}" title="Удалить">${s}</button>`).join('');drawCard();save()}
$('#skillOptions').onclick=e=>{const b=e.target.closest('.skill-option');if(!b)return;if(b.id==='customSkillButton'){state.customOpen=!state.customOpen}else{const s=b.dataset.skill,i=state.skills.indexOf(s);i>=0?state.skills.splice(i,1):state.skills.push(s)}syncSkills()};
function addCustom(){const input=$('#customSkill'),v=input.value.trim();if(v&&!state.customSkills.includes(v)){state.customSkills.push(v);input.value='';syncSkills()}}
$('#addCustomSkill').onclick=addCustom;$('#customSkill').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addCustom()}});$('#customSkillList').onclick=e=>{const b=e.target.closest('.custom-skill-tag');if(!b)return;state.customSkills.splice(Number(b.dataset.index),1);syncSkills()};
['startTime','endTime','username','note'].forEach(id=>$('#'+id).addEventListener('input',()=>{drawCard();save()}));
function rounded(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function fitText(ctx,text,max,width,weight=700){let size=max;do{ctx.font=`${weight} ${size}px Manrope,Arial`;size--}while(ctx.measureText(text).width>width&&size>16);return size+1}
function wrapText(ctx,text,maxWidth,maxLines){const words=String(text).trim().split(/\s+/);const lines=[];let line='';for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width<=maxWidth){line=test}else{if(line)lines.push(line);line=word;if(lines.length===maxLines-1)break}}if(line&&lines.length<maxLines)lines.push(line);const used=lines.join(' ').length;if(used<text.length&&lines.length){let last=lines.length-1;while(ctx.measureText(lines[last]+'…').width>maxWidth&&lines[last].length>1)lines[last]=lines[last].slice(0,-1);lines[last]+='…'}return lines}
function drawAdaptiveText(ctx,text,x,y,width,{maxSize=25,minSize=15,maxLines=2,lineHeight=1.2,weight=700,color='#111'}={}){let size=maxSize,lines=[];for(;size>=minSize;size--){ctx.font=`${weight} ${size}px Manrope,Arial`;lines=wrapText(ctx,text,width,maxLines);if(lines.length<=maxLines&&lines.every(line=>ctx.measureText(line).width<=width))break}ctx.fillStyle=color;ctx.font=`${weight} ${size}px Manrope,Arial`;lines.forEach((line,i)=>ctx.fillText(line,x,y+i*size*lineHeight));return lines.length*size*lineHeight}
function lineIcon(ctx,type,x,y){ctx.save();ctx.translate(x,y);ctx.strokeStyle='#111';ctx.fillStyle='#111';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';if(type==='headset'){ctx.beginPath();ctx.arc(0,0,25,Math.PI,0);ctx.stroke();ctx.strokeRect(-29,0,9,22);ctx.strokeRect(20,0,9,22);ctx.beginPath();ctx.moveTo(29,18);ctx.quadraticCurveTo(29,34,10,34);ctx.stroke();rounded(ctx,4,29,14,9,4,'#ffc400')}else if(type==='clock'){ctx.beginPath();ctx.arc(0,4,29,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,-14);ctx.moveTo(0,4);ctx.lineTo(16,14);ctx.strokeStyle='#f5b900';ctx.stroke()}else{rounded(ctx,-27,-24,54,49,9,null,'#111');ctx.beginPath();ctx.moveTo(-15,-32);ctx.lineTo(-15,-17);ctx.moveTo(15,-32);ctx.lineTo(15,-17);ctx.stroke();ctx.fillStyle='#f5b900';[-13,0,13].forEach(dx=>ctx.fillRect(dx-3,-3,6,6));[-13,0,13].forEach(dx=>ctx.fillRect(dx-3,11,6,6))}ctx.restore()}

function drawCard(){const c=$('#cardCanvas'),ctx=c.getContext('2d'),allSkills=[...state.skills,...state.customSkills];ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#f4f3ef';ctx.fillRect(0,0,1200,760);rounded(ctx,20,20,1160,720,36,'#fff');ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#f33';ctx.font='800 52px Manrope,Arial';ctx.fillText('Y',62,88);ctx.fillStyle='#111';ctx.fillText('andex',100,88);ctx.font='400 51px Manrope,Arial';ctx.fillText('Team',270,88);rounded(ctx,877,48,243,52,26,'#f4f3ef');ctx.fillStyle='#666';ctx.font='700 16px Manrope,Arial';ctx.fillText('ПРЕДЛОЖЕНИЕ ОБ ОБМЕНЕ',898,80);
const g=ctx.createLinearGradient(0,130,0,270);g.addColorStop(0,'#ffd53d');g.addColorStop(1,'#ffbd08');rounded(ctx,54,128,1092,142,26,g);ctx.fillStyle='#111';ctx.font='800 43px Manrope,Arial';ctx.fillText('Ищу замену',88,186);ctx.font='500 24px Manrope,Arial';ctx.fillText('на рабочий день',89,224);rounded(ctx,756,145,348,108,22,'#fff');lineIcon(ctx,'calendar',804,203);ctx.fillStyle='#8c887e';ctx.font='800 11px Manrope,Arial';ctx.fillText('ДАТА ЗАМЕНЫ',850,178);ctx.fillStyle='#111';ctx.font='800 38px Manrope,Arial';ctx.fillText(fmt(state.replaceDate),850,222);
rounded(ctx,54,290,1092,324,25,'#faf9f6');ctx.strokeStyle='#e5e2d8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(105,403);ctx.lineTo(1095,403);ctx.moveTo(105,497);ctx.lineTo(1095,497);ctx.stroke();rounded(ctx,75,312,70,70,20,'#fff0ba');lineIcon(ctx,'headset',110,347);ctx.fillStyle='#89857a';ctx.font='800 14px Manrope,Arial';ctx.fillText('НАВЫКИ',174,332);drawAdaptiveText(ctx,allSkills.length?allSkills.join('  •  '):'Не выбраны',174,361,880,{maxSize:23,minSize:14,maxLines:2,lineHeight:1.15});rounded(ctx,75,415,70,70,20,'#fff0ba');lineIcon(ctx,'clock',110,447);ctx.fillStyle='#89857a';ctx.font='800 14px Manrope,Arial';ctx.fillText('СМЕНА',174,432);ctx.fillStyle='#111';ctx.font='700 25px Manrope,Arial';ctx.fillText(`${$('#startTime').value||'—'} — ${$('#endTime').value||'—'}`,174,469);
rounded(ctx,75,516,70,70,20,'#fff0ba');lineIcon(ctx,'calendar',110,552);ctx.fillStyle='#89857a';ctx.font='800 14px Manrope,Arial';ctx.fillText('МОГУ ВЫЙТИ',174,531);const dates=state.available.slice(0,8).map(v=>parseDate(v));if(!dates.length){ctx.fillStyle='#aaa';ctx.font='600 20px Manrope,Arial';ctx.fillText('Выберите даты в календаре',174,568)}else{let dx=174,dy=545;const showYear=new Set(dates.map(d=>d.getFullYear())).size>1;dates.forEach(d=>{const label=dateLabel(d,showYear);ctx.font='800 17px Manrope,Arial';const chipW=Math.max(82,ctx.measureText(label).width+24);if(dx+chipW>1080){dx=174;dy+=45}rounded(ctx,dx,dy,chipW,37,11,'#fff','#f5b900');ctx.fillStyle='#111';ctx.textAlign='center';ctx.fillText(label,dx+chipW/2,dy+25);ctx.textAlign='left';dx+=chipW+9})}rounded(ctx,54,632,1092,78,23,'#1e1f1d');ctx.fillStyle='#ffc800';ctx.font='30px Manrope,Arial';ctx.fillText('★',82,683);const note=$('#note').value||'Буду благодарен за обмен!';drawAdaptiveText(ctx,note,128,680,620,{maxSize:23,minSize:15,maxLines:1,weight:600,color:'#fff'});ctx.strokeStyle='#5b5c58';ctx.beginPath();ctx.moveTo(845,650);ctx.lineTo(845,692);ctx.stroke();ctx.fillStyle='#ffc800';ctx.font='25px Manrope,Arial';ctx.fillText('@',878,680);const user=$('#username').value||'username';drawAdaptiveText(ctx,user,912,680,195,{maxSize:22,minSize:15,maxLines:1,color:'#fff'});ctx.fillStyle='#aaa';ctx.font='500 9px Manrope,Arial';ctx.textAlign='center';ctx.fillText('НЕОФИЦИАЛЬНЫЙ ФАНАТСКИЙ ПРОЕКТ · НЕ СВЯЗАН С ЯНДЕКСОМ',600,728);ctx.textAlign='left'}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2300)}
$('#downloadButton').onclick=()=>{const a=document.createElement('a');a.download=`замена-${key(state.replaceDate)}.png`;a.href=$('#cardCanvas').toDataURL('image/png');a.click();toast('Карточка скачана')};$('#copyButton').onclick=async()=>{try{const blob=await new Promise(r=>$('#cardCanvas').toBlob(r,'image/png'));await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);toast('Карточка скопирована')}catch{toast('Копирование не поддерживается — скачайте PNG')}};
function save(){localStorage.setItem('teamSwapState',JSON.stringify({replace:key(state.replaceDate),available:state.available,skills:state.skills,customSkills:state.customSkills,cardStyle:state.cardStyle,start:$('#startTime').value,end:$('#endTime').value,user:$('#username').value,note:$('#note').value}))}
function load(){try{const s=JSON.parse(localStorage.getItem('teamSwapState'));if(!s)return;state.replaceDate=parseDate(s.replace);state.available=s.available||[];state.skills=s.skills||(s.skill?[s.skill]:state.skills);state.customSkills=s.customSkills||(s.customSkill?[s.customSkill]:[]);state.cardStyle=Number.isInteger(s.cardStyle)?Math.max(0,Math.min(2,s.cardStyle)):0;$('#startTime').value=s.start||'11:00';$('#endTime').value=s.end||'23:00';$('#username').value=s.user||'malinovskym';$('#note').value=s.note||''}catch{}}
$('#resetButton').onclick=()=>{localStorage.removeItem('teamSwapState');location.reload()};load();renderCalendars();syncSkills();

function pillRows(ctx,items,maxWidth,{fontSize=17,padX=20,gap=10}={}){ctx.font=`700 ${fontSize}px Manrope,Arial`;const rows=[[]];let used=0;items.forEach(text=>{let size=fontSize;ctx.font=`700 ${size}px Manrope,Arial`;while(ctx.measureText(text).width>maxWidth-padX*2&&size>12){size--;ctx.font=`700 ${size}px Manrope,Arial`}const width=Math.min(maxWidth,Math.ceil(ctx.measureText(text).width+padX*2));if(used&&used+gap+width>maxWidth){rows.push([]);used=0}rows[rows.length-1].push({text,width,size});used+=width+gap});return rows}
function drawPillRows(ctx,rows,x,y,{height=42,gapX=10,gapY=9,fill='#fff8d8',stroke='#f2bb00',text='#171717'}={}){rows.forEach((row,rowIndex)=>{let px=x;row.forEach(item=>{const py=y+rowIndex*(height+gapY);rounded(ctx,px,py,item.width,height,13,fill,stroke);ctx.fillStyle=text;ctx.font=`700 ${item.size}px Manrope,Arial`;ctx.textAlign='center';ctx.fillText(item.text,px+item.width/2,py+height/2+item.size*.35);ctx.textAlign='left';px+=item.width+gapX})})}

/* Previous layout retained as a compatibility fallback for older saved states. */
function drawTeamCard(){
  const canvas=$('#cardCanvas'),ctx=canvas.getContext('2d');
  const skills=[...state.skills,...state.customSkills];
  const skillRows=pillRows(ctx,skills.length?skills:['Навыки не выбраны'],860,{fontSize:17,padX:19,gap:10});
  const dates=state.available.map(parseDate);const severalYears=new Set(dates.map(d=>d.getFullYear())).size>1;
  const dateLabels=dates.map(d=>dateLabel(d,severalYears));
  const dateRows=pillRows(ctx,dateLabels.length?dateLabels:['Выберите даты в календаре'],860,{fontSize:16,padX:18,gap:9});
  const skillHeight=Math.max(58,skillRows.length*51-9);
  const dateHeight=Math.max(48,dateRows.length*48-9);
  const contentTop=292,skillsBlock=80+skillHeight,shiftBlock=104,datesBlock=76+dateHeight;
  const footerY=contentTop+skillsBlock+shiftBlock+datesBlock+18;
  const cardHeight=footerY+128;
  canvas.width=1200;canvas.height=cardHeight;
  ctx.fillStyle='#efeee9';ctx.fillRect(0,0,1200,cardHeight);
  const paper=ctx.createLinearGradient(0,0,1200,cardHeight);paper.addColorStop(0,'#fff');paper.addColorStop(1,'#f8f7f3');rounded(ctx,20,20,1160,cardHeight-40,36,paper);
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#f33';ctx.font='800 52px Manrope,Arial';ctx.fillText('Y',62,88);ctx.fillStyle='#111';ctx.fillText('andex',100,88);ctx.font='400 51px Manrope,Arial';ctx.fillText('Team',270,88);
  rounded(ctx,904,48,216,52,26,'#f2f1ed');ctx.fillStyle='#666';ctx.font='700 13px Manrope,Arial';ctx.fillText('ОБМЕН РАБОЧИМ ДНЁМ',925,80);
  const yellow=ctx.createLinearGradient(54,128,1146,270);yellow.addColorStop(0,'#ffb900');yellow.addColorStop(.55,'#ffca16');yellow.addColorStop(1,'#ffe16a');rounded(ctx,54,128,1092,142,26,yellow);
  glow(ctx,960,190,170,'rgba(255,255,255,.22)');rounded(ctx,78,151,86,96,23,'rgba(255,255,255,.28)');draw3DIcon(ctx,0,121,198,104,{rotation:-.05});ctx.font='800 41px Manrope,Arial';ctx.fillStyle='#111';ctx.fillText('Ищу замену',190,186);ctx.font='500 23px Manrope,Arial';ctx.fillText('на рабочий день',191,224);
  rounded(ctx,754,145,352,108,22,'rgba(255,255,255,.96)');draw3DIcon(ctx,1,806,200,108,{rotation:.025});ctx.fillStyle='#8c887e';ctx.font='800 11px Manrope,Arial';ctx.fillText('ДАТА ЗАМЕНЫ',856,178);ctx.fillStyle='#111';ctx.font='800 38px Manrope,Arial';ctx.fillText(fmt(state.replaceDate),856,222);
  rounded(ctx,54,contentTop,1092,footerY-contentTop-18,26,'#faf9f6','#ebe8df');
  let y=contentTop+28;
  rounded(ctx,75,y,70,70,20,'#fff0ba');draw3DIcon(ctx,0,110,y+35,78);ctx.fillStyle='#89857a';ctx.font='800 13px Manrope,Arial';ctx.fillText('НАВЫКИ',174,y+17);drawPillRows(ctx,skillRows,174,y+30,{height:42,gapX:10,gapY:9});
  y+=skillsBlock;ctx.strokeStyle='#e8e4da';ctx.beginPath();ctx.moveTo(86,y-13);ctx.lineTo(1112,y-13);ctx.stroke();
  rounded(ctx,75,y,70,70,20,'#fff0ba');draw3DIcon(ctx,2,110,y+35,75);ctx.fillStyle='#89857a';ctx.font='800 13px Manrope,Arial';ctx.fillText('СМЕНА',174,y+18);ctx.fillStyle='#111';ctx.font='800 29px Manrope,Arial';ctx.fillText(`${$('#startTime').value||'—'} — ${$('#endTime').value||'—'}`,174,y+58);
  y+=shiftBlock;ctx.strokeStyle='#e8e4da';ctx.beginPath();ctx.moveTo(86,y-13);ctx.lineTo(1112,y-13);ctx.stroke();
  rounded(ctx,75,y,70,70,20,'#fff0ba');draw3DIcon(ctx,1,110,y+35,78);ctx.fillStyle='#89857a';ctx.font='800 13px Manrope,Arial';ctx.fillText('МОГУ ВЫЙТИ',174,y+17);drawPillRows(ctx,dateRows,174,y+30,{height:39,gapX:9,gapY:9,fill:dates.length?'#fff':'#f2f1ed',stroke:dates.length?'#f2bb00':'#dedbd2',text:dates.length?'#171717':'#8b8982'});
  rounded(ctx,54,footerY,1092,78,23,'#1e1f1d');draw3DIcon(ctx,3,99,footerY+39,66,{shadow:'rgba(0,0,0,.28)'});const note=$('#note').value||'Буду благодарен за обмен!';drawAdaptiveText(ctx,note,145,footerY+49,603,{maxSize:23,minSize:15,maxLines:1,weight:600,color:'#fff'});ctx.strokeStyle='#5b5c58';ctx.beginPath();ctx.moveTo(845,footerY+18);ctx.lineTo(845,footerY+60);ctx.stroke();ctx.fillStyle='#ffc800';ctx.font='25px Manrope,Arial';ctx.fillText('@',878,footerY+48);drawAdaptiveText(ctx,$('#username').value||'username',912,footerY+48,195,{maxSize:22,minSize:15,maxLines:1,color:'#fff'});
  ctx.fillStyle='#a5a29a';ctx.font='500 9px Manrope,Arial';ctx.textAlign='center';ctx.fillText('НЕОФИЦИАЛЬНЫЙ ФАНАТСКИЙ ПРОЕКТ · НЕ СВЯЗАН С ЯНДЕКСОМ',600,cardHeight-34);ctx.textAlign='left';
}

function drawEditorialCard(mode){
  const canvas=$('#cardCanvas'),ctx=canvas.getContext('2d');
  const skills=[...state.skills,...state.customSkills];
  const isFood=mode==='food';
  const palette=isFood?{outer:'#efe9e2',paper:'#fffaf3',ink:'#1d1714',muted:'#8c7770',accent:'#ff5a3d',accent2:'#ffcc00',panel:'#fff',line:'#eadbd3',pill:'#fff0e9',pillStroke:'#ff8b75',footer:'#2b1d18',footerText:'#fff'}:{outer:'#090a0c',paper:'#121316',ink:'#f7f6f2',muted:'#898b91',accent:'#ffcc00',accent2:'#fff',panel:'#1c1e22',line:'#303238',pill:'#24262b',pillStroke:'#484b53',footer:'#f5f4f0',footerText:'#111'};
  const skillRows=pillRows(ctx,skills.length?skills:['Навыки не выбраны'],isFood?850:820,{fontSize:16,padX:18,gap:9});
  const dates=state.available.map(parseDate),severalYears=new Set(dates.map(d=>d.getFullYear())).size>1;
  const dateRows=pillRows(ctx,dates.length?dates.map(d=>dateLabel(d,severalYears)):['Выберите даты'],isFood?850:820,{fontSize:16,padX:17,gap:9});
  const skillsH=Math.max(46,skillRows.length*48-8),datesH=Math.max(42,dateRows.length*46-8);
  const cardHeight=690+Math.max(0,skillsH-46)+Math.max(0,datesH-42);
  canvas.width=1200;canvas.height=cardHeight;
  ctx.fillStyle=palette.outer;ctx.fillRect(0,0,1200,cardHeight);rounded(ctx,22,22,1156,cardHeight-44,isFood?38:28,palette.paper);
  ctx.textBaseline='alphabetic';ctx.textAlign='left';
  if(isFood){
    ctx.fillStyle=palette.ink;ctx.font='800 27px Manrope,Arial';ctx.fillText('Yandex Team',64,78);ctx.fillStyle=palette.muted;ctx.font='700 10px Manrope,Arial';ctx.fillText('СМЕНАМИ ЛЕГЧЕ ДЕЛИТЬСЯ',936,74);
    rounded(ctx,54,108,1092,172,32,palette.accent);glow(ctx,690,136,250,'rgba(255,217,170,.20)');ctx.fillStyle='#fff';ctx.font='800 53px Manrope,Arial';ctx.fillText('Нужна замена',88,178);ctx.font='500 19px Manrope,Arial';ctx.fillText('Оператор поддержки · рабочая смена',91,218);draw3DIcon(ctx,0,715,193,192,{rotation:-.08,shadow:'rgba(98,28,14,.25)'});
    rounded(ctx,823,132,286,124,26,'#fff');draw3DIcon(ctx,1,858,195,106,{rotation:.03});ctx.fillStyle=palette.muted;ctx.font='800 10px Manrope,Arial';ctx.fillText('ДАТА ЗАМЕНЫ',897,165);ctx.fillStyle=palette.ink;ctx.font='800 40px Manrope,Arial';ctx.fillText(fmt(state.replaceDate),897,213);rounded(ctx,91,239,152,7,4,palette.accent2);
    let y=310;ctx.fillStyle=palette.muted;ctx.font='800 11px Manrope,Arial';ctx.fillText('01  НАВЫКИ',72,y);drawPillRows(ctx,skillRows,236,y-26,{height:40,gapX:9,gapY:8,fill:palette.pill,stroke:palette.pillStroke,text:palette.ink});y+=skillsH+54;ctx.strokeStyle=palette.line;ctx.beginPath();ctx.moveTo(72,y-24);ctx.lineTo(1128,y-24);ctx.stroke();ctx.fillStyle=palette.muted;ctx.font='800 11px Manrope,Arial';ctx.fillText('02  СМЕНА',72,y+4);ctx.fillStyle=palette.ink;ctx.font='800 30px Manrope,Arial';ctx.fillText(`${$('#startTime').value||'—'} — ${$('#endTime').value||'—'}`,236,y+8);y+=72;ctx.strokeStyle=palette.line;ctx.beginPath();ctx.moveTo(72,y-20);ctx.lineTo(1128,y-20);ctx.stroke();ctx.fillStyle=palette.muted;ctx.font='800 11px Manrope,Arial';ctx.fillText('03  ГОТОВ ВЫЙТИ',72,y+8);drawPillRows(ctx,dateRows,236,y-18,{height:38,gapX:9,gapY:8,fill:'#fff',stroke:palette.accent2,text:palette.ink});
    const footerY=cardHeight-105;rounded(ctx,54,footerY,1092,68,22,palette.footer);draw3DIcon(ctx,3,95,footerY+34,61,{shadow:'rgba(0,0,0,.25)'});drawAdaptiveText(ctx,$('#note').value||'Буду благодарен за обмен!',134,footerY+42,630,{maxSize:21,minSize:14,maxLines:1,weight:600,color:palette.footerText});ctx.fillStyle=palette.footerText;ctx.font='800 20px Manrope,Arial';ctx.fillText('@'+($('#username').value||'username'),890,footerY+43);
  }else{
    ctx.fillStyle=palette.muted;ctx.font='800 10px Manrope,Arial';ctx.fillText('YANDEX / TEAM / SUPPORT',64,68);ctx.fillStyle=palette.accent;ctx.fillRect(1040,52,72,6);ctx.fillStyle=palette.ink;ctx.font='700 57px Manrope,Arial';ctx.fillText('Обмен',64,143);ctx.fillText('сменой',64,199);ctx.fillStyle=palette.muted;ctx.font='500 15px Manrope,Arial';ctx.fillText('Коротко. Понятно. По делу.',68,230);
    glow(ctx,600,145,230,'rgba(255,204,0,.16)');draw3DIcon(ctx,0,574,161,226,{rotation:-.08,shadow:'rgba(0,0,0,.65)'});rounded(ctx,806,92,306,154,30,palette.accent);draw3DIcon(ctx,1,855,169,129,{rotation:.03});ctx.fillStyle='#111';ctx.font='800 10px Manrope,Arial';ctx.fillText('ДАТА ЗАМЕНЫ',907,132);ctx.font='800 44px Manrope,Arial';ctx.fillText(fmt(state.replaceDate),907,190);
    let y=278;rounded(ctx,54,y,1092,skillsH+64,24,palette.panel,palette.line);ctx.fillStyle=palette.muted;ctx.font='800 10px Manrope,Arial';ctx.fillText('НАВЫКИ ОПЕРАТОРА',82,y+29);drawPillRows(ctx,skillRows,280,y+17,{height:40,gapX:9,gapY:8,fill:palette.pill,stroke:palette.pillStroke,text:palette.ink});y+=skillsH+82;
    rounded(ctx,54,y,1092,90,24,palette.panel,palette.line);ctx.fillStyle=palette.muted;ctx.font='800 10px Manrope,Arial';ctx.fillText('СМЕНА',82,y+32);ctx.fillStyle=palette.ink;ctx.font='800 32px Manrope,Arial';ctx.fillText(`${$('#startTime').value||'—'} — ${$('#endTime').value||'—'}`,280,y+57);y+=108;
    rounded(ctx,54,y,1092,datesH+61,24,palette.panel,palette.line);ctx.fillStyle=palette.muted;ctx.font='800 10px Manrope,Arial';ctx.fillText('ДОСТУПНЫЕ ДАТЫ',82,y+29);drawPillRows(ctx,dateRows,280,y+16,{height:38,gapX:9,gapY:8,fill:palette.pill,stroke:palette.pillStroke,text:palette.ink});
    const footerY=cardHeight-100;rounded(ctx,54,footerY,1092,64,20,palette.footer);draw3DIcon(ctx,3,91,footerY+32,58,{shadow:'rgba(0,0,0,.20)'});ctx.fillStyle=palette.footerText;ctx.font='800 20px Manrope,Arial';ctx.fillText('@'+($('#username').value||'username'),128,footerY+40);drawAdaptiveText(ctx,$('#note').value||'Буду благодарен за обмен!',394,footerY+39,686,{maxSize:20,minSize:13,maxLines:1,weight:600,color:palette.footerText});
  }
  ctx.fillStyle=palette.muted;ctx.font='500 8px Manrope,Arial';ctx.textAlign='center';ctx.fillText('НЕОФИЦИАЛЬНЫЙ ФАНАТСКИЙ ПРОЕКТ · НЕ СВЯЗАН С ЯНДЕКСОМ',600,cardHeight-12);ctx.textAlign='left';
}

function drawDotField(ctx,x,y,columns,rows,color){ctx.save();ctx.fillStyle=color;for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){const alpha=Math.max(.08,.72-(row+col)*.045);ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x+col*12,y+row*12,2.2,0,Math.PI*2);ctx.fill()}ctx.restore()}
function drawMinimalIcon(ctx,type,x,y,color='#111',accent='#ffcc00'){
  ctx.save();ctx.translate(x,y);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3.5;ctx.lineCap='round';ctx.lineJoin='round';
  if(type==='swap'){ctx.beginPath();ctx.arc(0,0,18,-2.65,.3);ctx.stroke();ctx.beginPath();ctx.moveTo(15,-9);ctx.lineTo(19,0);ctx.lineTo(9,1);ctx.stroke();ctx.beginPath();ctx.arc(0,0,18,.5,3.45);ctx.stroke();ctx.beginPath();ctx.moveTo(-15,9);ctx.lineTo(-19,0);ctx.lineTo(-9,-1);ctx.stroke()}
  if(type==='calendar'){rounded(ctx,-19,-16,38,35,7,null,color);ctx.beginPath();ctx.moveTo(-19,-6);ctx.lineTo(19,-6);ctx.moveTo(-10,-21);ctx.lineTo(-10,-12);ctx.moveTo(10,-21);ctx.lineTo(10,-12);ctx.stroke();ctx.fillStyle=accent;[-9,0,9].forEach(px=>{ctx.beginPath();ctx.arc(px,5,2.5,0,Math.PI*2);ctx.fill()})}
  if(type==='skills'){ctx.beginPath();ctx.arc(0,-7,8,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,16,15,Math.PI,0);ctx.lineTo(15,20);ctx.lineTo(-15,20);ctx.closePath();ctx.stroke();rounded(ctx,12,-18,8,8,3,accent)}
  if(type==='clock'){ctx.beginPath();ctx.arc(0,0,19,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-11);ctx.moveTo(0,0);ctx.lineTo(10,7);ctx.strokeStyle=accent;ctx.stroke()}
  if(type==='dates'){ctx.beginPath();ctx.arc(0,-8,7,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-14,18);ctx.quadraticCurveTo(-12,3,0,3);ctx.quadraticCurveTo(12,3,14,18);ctx.closePath();ctx.stroke();ctx.fillStyle=accent;ctx.beginPath();ctx.arc(16,-14,4,0,Math.PI*2);ctx.fill()}
  ctx.restore();
}
function drawMinimalCard(mode){
  const canvas=$('#cardCanvas'),ctx=canvas.getContext('2d');
  const skills=[...state.skills,...state.customSkills];
  const dates=state.available.map(parseDate),severalYears=new Set(dates.map(d=>d.getFullYear())).size>1;
  const themes={
    team:{outer:'#e9e8e3',paper:'#ffffff',ink:'#111111',muted:'#777771',hero:'#ffcc00',heroInk:'#111111',date:'#ffffff',panel:'#f7f7f5',line:'#e3e2dc',pill:'#ffffff',pillLine:'#d7d6cf',footer:'#171816',footerInk:'#ffffff',accent:'#ffcc00'},
    food:{outer:'#eee7e1',paper:'#fffaf6',ink:'#201815',muted:'#8a7770',hero:'#ff5a3d',heroInk:'#ffffff',date:'#ffffff',panel:'#ffffff',line:'#eadbd5',pill:'#fff1ec',pillLine:'#ffc0b2',footer:'#2b1d19',footerInk:'#ffffff',accent:'#ffcc00'},
    studio:{outer:'#090a0c',paper:'#121316',ink:'#f5f4f0',muted:'#8b8d92',hero:'#1c1e22',heroInk:'#f5f4f0',date:'#ffcc00',panel:'#1b1d21',line:'#303238',pill:'#24262b',pillLine:'#44474e',footer:'#f3f2ed',footerInk:'#111111',accent:'#ffcc00'}
  };
  const t=themes[mode]||themes.team;
  const valueWidth=820;
  const skillRows=pillRows(ctx,skills.length?skills:['Навыки не выбраны'],valueWidth,{fontSize:16,padX:18,gap:9});
  const dateRows=pillRows(ctx,dates.length?dates.map(d=>dateLabel(d,severalYears)):['Выберите даты'],valueWidth,{fontSize:16,padX:17,gap:9});
  const blockHeight=rows=>94+Math.max(0,rows.length-1)*47;
  const skillsH=blockHeight(skillRows),shiftH=94,datesH=blockHeight(dateRows);
  const heroY=112,heroH=146,contentY=282,gap=12;
  const shiftY=contentY+skillsH+gap,datesY=shiftY+shiftH+gap,footerY=datesY+datesH+18;
  const cardHeight=footerY+126;
  canvas.width=1200;canvas.height=cardHeight;
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle=t.outer;ctx.fillRect(0,0,1200,cardHeight);
  rounded(ctx,20,20,1160,cardHeight-40,34,t.paper);

  if(mode!=='studio')drawDotField(ctx,1010,38,10,6,mode==='food'?'#ff8b73':'#ffcc00');
  ctx.fillStyle='#f04432';ctx.font='800 34px Manrope,Arial';ctx.fillText('Y',58,80);ctx.fillStyle=t.ink;ctx.fillText('andex',82,80);
  ctx.font='500 34px Manrope,Arial';ctx.fillText('Team',184,80);
  rounded(ctx,970,50,152,34,17,t.panel,t.line);ctx.fillStyle=t.muted;ctx.font='800 10px Manrope,Arial';ctx.textAlign='center';ctx.fillText('ОБМЕН СМЕНОЙ',1046,72);ctx.textAlign='left';

  const heroFill=ctx.createLinearGradient(54,heroY,1146,heroY+heroH);if(mode==='team'){heroFill.addColorStop(0,'#ffd75b');heroFill.addColorStop(1,'#ffc400')}else if(mode==='food'){heroFill.addColorStop(0,'#ff785f');heroFill.addColorStop(1,'#ff5038')}else{heroFill.addColorStop(0,'#23252a');heroFill.addColorStop(1,'#191b1f')}rounded(ctx,54,heroY,1092,heroH,28,heroFill,mode==='studio'?t.line:null);
  rounded(ctx,78,135,92,100,25,mode==='studio'?'#2d3035':'rgba(255,255,255,.30)');drawMinimalIcon(ctx,'swap',124,185,t.heroInk,t.accent);
  ctx.fillStyle=t.heroInk;ctx.font='800 45px Manrope,Arial';ctx.fillText('Ищу замену',198,174);
  ctx.font='600 17px Manrope,Arial';ctx.globalAlpha=.68;ctx.fillText('Рабочий день',201,209);ctx.globalAlpha=1;
  rounded(ctx,760,132,354,106,22,t.date,mode==='studio'?null:t.line);
  drawMinimalIcon(ctx,'calendar',799,185,'#111',t.accent);ctx.fillStyle=mode==='studio'?'#5e5200':t.muted;ctx.font='800 10px Manrope,Arial';ctx.fillText('ДАТА ЗАМЕНЫ',834,163);
  ctx.fillStyle='#111';ctx.font='800 37px Manrope,Arial';ctx.fillText(fmt(state.replaceDate),834,207);

  function section(y,height,index,label,rows,options={}){
    rounded(ctx,54,y,1092,height,22,t.panel,t.line);
    rounded(ctx,74,y+18,52,58,17,mode==='studio'?'#25272c':mode==='food'?'#fff0eb':'#fff3c8');drawMinimalIcon(ctx,options.icon,100,y+47,t.ink,t.accent);
    ctx.fillStyle=t.muted;ctx.font='800 10px Manrope,Arial';ctx.fillText(index,144,y+38);ctx.font='800 11px Manrope,Arial';ctx.fillText(label,170,y+38);
    if(options.shift){ctx.fillStyle=t.ink;ctx.font='800 31px Manrope,Arial';ctx.fillText(`${$('#startTime').value||'—'} — ${$('#endTime').value||'—'}`,280,y+57);return}
    drawPillRows(ctx,rows,280,y+25,{height:40,gapX:9,gapY:7,fill:t.pill,stroke:t.pillLine,text:t.ink});
  }
  section(contentY,skillsH,'01','НАВЫКИ',skillRows,{icon:'skills'});
  section(shiftY,shiftH,'02','СМЕНА',[],{shift:true,icon:'clock'});
  section(datesY,datesH,'03','МОГУ ВЫЙТИ',dateRows,{icon:'dates'});

  rounded(ctx,54,footerY,1092,68,20,t.footer);
  const note=$('#note').value||'Буду благодарен за обмен!';
  ctx.strokeStyle=t.accent;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?7:15,px=86+Math.cos(a)*r,py=footerY+34+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.stroke();
  drawAdaptiveText(ctx,note,118,footerY+43,630,{maxSize:20,minSize:13,maxLines:1,weight:600,color:t.footerInk});
  rounded(ctx,824,footerY+12,292,44,16,null,mode==='studio'?'#d1b200':'#b99b00');
  ctx.fillStyle=t.accent;ctx.font='800 19px Manrope,Arial';ctx.fillText('@',850,footerY+41);drawAdaptiveText(ctx,$('#username').value||'username',877,footerY+41,210,{maxSize:18,minSize:13,maxLines:1,weight:800,color:t.footerInk});
  ctx.fillStyle=t.muted;ctx.font='500 8px Manrope,Arial';ctx.textAlign='center';ctx.fillText('НЕОФИЦИАЛЬНЫЙ ФАНАТСКИЙ ПРОЕКТ · НЕ СВЯЗАН С ЯНДЕКСОМ',600,cardHeight-27);ctx.textAlign='left';
}

const cardStyles=[
  {id:'team',name:'Yellow',description:'Светлый · жёлтый акцент'},
  {id:'food',name:'Warm',description:'Светлый · тёплый акцент'},
  {id:'studio',name:'Graphite',description:'Тёмный · жёлтый акцент'}
];

drawCard=function(){drawMinimalCard(cardStyles[state.cardStyle].id)};
function renderStyleSwitcher(){const style=cardStyles[state.cardStyle];$('#styleName').textContent=style.name;$('#styleDescription').textContent=style.description;$('#styleDots').innerHTML=cardStyles.map((_,i)=>`<span class="style-dot ${i===state.cardStyle?'active':''}"></span>`).join('');$('.preview-panel').dataset.cardStyle=style.id;drawCard();save()}
function changeStyle(direction){state.cardStyle=(state.cardStyle+direction+cardStyles.length)%cardStyles.length;renderStyleSwitcher()}
$('#previousStyle').onclick=()=>changeStyle(-1);$('#nextStyle').onclick=()=>changeStyle(1);$('.style-switcher').addEventListener('keydown',e=>{if(e.key==='ArrowLeft')changeStyle(-1);if(e.key==='ArrowRight')changeStyle(1)});
renderStyleSwitcher();document.fonts.ready.then(drawCard);

