// ============================================================
// CONFIG
// ============================================================
const HER_NAME = "Sutleza";
const HIS_NAME = "Ram";

// ============================================================
// AMBIENT FLOATING HEARTS (background, whole site)
// ============================================================
(function ambientHearts(){
  const wrap = document.getElementById('ambient');
  const glyphs = ['♥','❤','💛','💕'];
  const COUNT = window.innerWidth < 500 ? 14 : 24;
  for(let i=0;i<COUNT;i++){
    const h = document.createElement('span');
    h.className = 'heart';
    h.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];
    h.style.left = Math.random()*100 + 'vw';
    h.style.setProperty('--drift', (Math.random()*80-40) + 'px');
    h.style.fontSize = (0.9 + Math.random()*1.6) + 'rem';
    h.style.animationDuration = (9 + Math.random()*10) + 's';
    h.style.animationDelay = (Math.random()*10) + 's';
    wrap.appendChild(h);
  }
})();

// ============================================================
// SCREEN NAVIGATION HELPER
// ============================================================
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo({top:0, behavior:'smooth'});
}

// ============================================================
// SCREEN 0 — ENVELOPE OPEN
// ============================================================
const envelope = document.getElementById('envelope');
const waxSeal = document.getElementById('waxSeal');

function openEnvelope(){
  envelope.classList.add('open');
  setTimeout(() => showScreen('screen-question'), 750);
}
waxSeal.addEventListener('click', openEnvelope);
envelope.addEventListener('click', openEnvelope);

// ============================================================
// SCREEN 1 — YES / NO (the "no" button that runs away)
// ============================================================
const btnRow = document.getElementById('btnRow');
const btnYes = document.getElementById('btnYes');
const btnNo  = document.getElementById('btnNo');
const noHint = document.getElementById('noHint');

let noDodgeCount = 0;
const dodgeMessages = [
  '( "No" is a little shy... )',
  '( it just ran away 😄 )',
  '( keep trying... )',
  '( "No" doesn\'t want to be found 🙈 )',
  '( only "Yes" is left now )'
];

function moveNoButtonRandom(){
  // switch to fixed positioning so it can roam the full viewport
  btnNo.classList.add('roaming');
  const w = btnNo.offsetWidth || 100;
  const h = btnNo.offsetHeight || 48;
  const maxX = window.innerWidth - w - 16;
  const maxY = window.innerHeight - h - 16;
  const x = Math.max(16, Math.random()*maxX);
  const y = Math.max(16, Math.random()*maxY);
  btnNo.style.left = x + 'px';
  btnNo.style.top = y + 'px';

  noDodgeCount++;
  noHint.textContent = dodgeMessages[Math.min(noDodgeCount, dodgeMessages.length-1)];
  btnYes.classList.add('grow');
}

function distance(ax,ay,bx,by){ return Math.hypot(ax-bx, ay-by); }

// desktop: dodge when cursor gets close
document.addEventListener('mousemove', (e) => {
  if(document.getElementById('screen-question').classList.contains('hidden')) return;
  const rect = btnNo.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  const dist = distance(e.clientX, e.clientY, cx, cy);
  if(dist < 90){
    moveNoButtonRandom();
  }
});

// mobile / touch: move it away right on touchstart so a tap can't land
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  moveNoButtonRandom();
}, {passive:false});

// safety net: if somehow clicked, still just dodge instead of doing anything
btnNo.addEventListener('click', (e) => {
  e.preventDefault();
  moveNoButtonRandom();
});

function sparkleBurst(x, y){
  const glyphs = ['✨','💛','💕'];
  for(let i=0;i<10;i++){
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    const angle = Math.random()*Math.PI*2;
    const dist = 40 + Math.random()*60;
    s.style.setProperty('--sx', Math.cos(angle)*dist + 'px');
    s.style.setProperty('--sy', Math.sin(angle)*dist + 'px');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}

btnYes.addEventListener('click', (e) => {
  const rect = btnYes.getBoundingClientRect();
  sparkleBurst(rect.left + rect.width/2, rect.top + rect.height/2);
  setTimeout(() => {
    showScreen('screen-calendar');
    buildCalendar();
  }, 250);
});

// ============================================================
// SCREEN 2 — CALENDAR (past dates & past months disabled)
// ============================================================
const calMonthLabel = document.getElementById('calMonthLabel');
const calDays = document.getElementById('calDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const btnDateContinue = document.getElementById('btnDateContinue');

const today = new Date();
today.setHours(0,0,0,0);

let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedDate = null;

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function buildCalendar(){
  calMonthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;
  calDays.innerHTML = '';

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  for(let i=0;i<firstDay;i++){
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    calDays.appendChild(empty);
  }

  for(let d=1; d<=daysInMonth; d++){
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = d;

    const thisDate = new Date(viewYear, viewMonth, d);
    thisDate.setHours(0,0,0,0);

    const isPast = thisDate < today;
    const isToday = thisDate.getTime() === today.getTime();

    if(isPast){
      cell.classList.add('past');
    } else {
      if(isToday) cell.classList.add('today');
      if(selectedDate && thisDate.getTime() === selectedDate.getTime()){
        cell.classList.add('selected');
      }
      cell.addEventListener('click', () => {
        selectedDate = thisDate;
        buildCalendar();
        btnDateContinue.disabled = false;
      });
    }
    calDays.appendChild(cell);
  }

  // disable navigating into months before the current month
  const isCurrentMonth = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
  prevMonthBtn.disabled = isCurrentMonth;
}

prevMonthBtn.addEventListener('click', () => {
  const isCurrentMonth = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
  if(isCurrentMonth) return;
  viewMonth--;
  if(viewMonth < 0){ viewMonth = 11; viewYear--; }
  buildCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  viewMonth++;
  if(viewMonth > 11){ viewMonth = 0; viewYear++; }
  buildCalendar();
});

btnDateContinue.addEventListener('click', () => {
  if(!selectedDate) return;
  const label = selectedDate.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  document.getElementById('chosenDateLabel').textContent = `Date confirmed: ${label}`;
  showScreen('screen-menu');
});

// ============================================================
// SCREEN 3 — MENU
// ============================================================
const MENU = {
  veg: [
    {name:'Paneer Tikka', emoji:'🧀'},
    {name:'Veg Biryani', emoji:'🍛'},
    {name:'Dal Makhani', emoji:'🍲'},
    {name:'Garlic Naan', emoji:'🫓'},
    {name:'Veg Manchurian', emoji:'🥦'},
    {name:'Paneer Butter Masala', emoji:'🍅'},
  ],
  nonveg: [
    {name:'Butter Chicken', emoji:'🍗'},
    {name:'Chicken Biryani', emoji:'🍚'},
    {name:'Seekh Kebab', emoji:'🍢'},
    {name:'Fish Fry', emoji:'🐟'},
    {name:'Chicken Tikka', emoji:'🍖'},
    {name:'Egg Curry', emoji:'🥚'},
  ],
  drinks: [
    {name:'Mango Lassi', emoji:'🥭'},
    {name:'Cold Coffee', emoji:'☕'},
    {name:'Fresh Lime Soda', emoji:'🍋'},
    {name:'Masala Chai', emoji:'🍵'},
    {name:'Milkshake', emoji:'🥤'},
    {name:'Mocktail', emoji:'🍹'},
  ]
};

const selectedItems = { veg:new Set(), nonveg:new Set(), drinks:new Set() };

function buildMenuPanels(){
  Object.keys(MENU).forEach(cat => {
    const panel = document.getElementById('panel-' + cat);
    panel.innerHTML = '';
    MENU[cat].forEach(item => {
      const el = document.createElement('div');
      el.className = 'menu-item';
      el.innerHTML = `
        <span class="emoji">${item.emoji}</span>
        <span class="name">${item.name}</span>
        <span class="check">✓ liya</span>
      `;
      el.addEventListener('click', () => {
        if(selectedItems[cat].has(item.name)){
          selectedItems[cat].delete(item.name);
          el.classList.remove('selected');
        } else {
          selectedItems[cat].add(item.name);
          el.classList.add('selected');
        }
        refreshBookButton();
      });
      panel.appendChild(el);
    });
  });
}
buildMenuPanels();

document.querySelectorAll('.tab-btn').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.menu-panel').forEach(p => p.classList.add('hidden-panel'));
    document.getElementById('panel-' + tab.dataset.tab).classList.remove('hidden-panel');
  });
});

const btnBook = document.getElementById('btnBook');
const selectHint = document.getElementById('selectHint');

function refreshBookButton(){
  const total = selectedItems.veg.size + selectedItems.nonveg.size + selectedItems.drinks.size;
  btnBook.disabled = total === 0;
  selectHint.style.visibility = total === 0 ? 'visible' : 'hidden';
}
refreshBookButton();

btnBook.addEventListener('click', () => {
  buildSummary();
  showScreen('screen-thanks');
  launchConfetti();
});

// ============================================================
// SCREEN 4 — THANK YOU
// ============================================================
function buildSummary(){
  const box = document.getElementById('summaryBox');
  const dateLabel = selectedDate.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const lines = [`<div class="sum-line"><b>Date:</b> ${dateLabel}</div>`];

  ['veg','nonveg','drinks'].forEach(cat => {
    if(selectedItems[cat].size){
      const label = cat === 'veg' ? 'Veg' : cat === 'nonveg' ? 'Non-Veg' : 'Drinks';
      lines.push(`<div class="sum-line"><b>${label}:</b> ${[...selectedItems[cat]].join(', ')}</div>`);
    }
  });

  box.innerHTML = lines.join('');
}

function launchConfetti(){
  const confetti = document.getElementById('confetti');
  confetti.innerHTML = '';
  const glyphs = ['🎉','💛','❤','✨','💕'];
  for(let i=0;i<26;i++){
    const s = document.createElement('span');
    s.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];
    s.style.left = Math.random()*100 + '%';
    s.style.animationDelay = (Math.random()*0.6) + 's';
    s.style.fontSize = (0.9 + Math.random()*0.9) + 'rem';
    confetti.appendChild(s);
  }
}

// ============================================================
// BACK TO HOME — full reset, returns to the envelope screen
// ============================================================
const btnHome = document.getElementById('btnHome');

btnHome.addEventListener('click', () => {
  // reset envelope
  envelope.classList.remove('open');

  // reset yes/no
  noDodgeCount = 0;
  noHint.textContent = dodgeMessages[0];
  btnYes.classList.remove('grow');
  btnNo.classList.remove('roaming');
  btnNo.style.left = '';
  btnNo.style.top = '';

  // reset calendar
  selectedDate = null;
  viewYear = today.getFullYear();
  viewMonth = today.getMonth();
  btnDateContinue.disabled = true;
  buildCalendar();

  // reset menu
  selectedItems.veg.clear();
  selectedItems.nonveg.clear();
  selectedItems.drinks.clear();
  document.querySelectorAll('.menu-item.selected').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="veg"]').classList.add('active');
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.add('hidden-panel'));
  document.getElementById('panel-veg').classList.remove('hidden-panel');
  refreshBookButton();

  showScreen('screen-envelope');
});

// initial calendar build (in case user lands mid-flow during dev)
buildCalendar();
