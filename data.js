const SUBJECT_CONFIG = {
  reading:       { label: 'Reading',            color: '#E85D4A', bg: '#FFF0EE', light: '#FFD6D1' },
  writing:       { label: 'Writing & Spelling',  color: '#2BBFB5', bg: '#E8F7F6', light: '#B2EAE7' },
  math:          { label: 'Math',               color: '#F5A623', bg: '#FFF9E6', light: '#FFE9A0' },
  science:       { label: 'Science',            color: '#2DA84A', bg: '#EDFAEF', light: '#B8EDBE' },
  social_studies:{ label: 'Social Studies',     color: '#7C4DCC', bg: '#F0EBFA', light: '#D4C2F5' },
};
const SUBJECT_ORDER = ['reading','writing','math','science','social_studies'];

const SAMPLE_CURRICULUM = [
  // ── READING ─────────────────────────────────────────────────────
  {
    id:'r001', subject:'reading', title:'The "SH" Digraph', type:'reading', week:'2026-W17',
    content:{
      sound:'SH', soundDescription:'When S and H are together they make the "sh" sound — like a secret!',
      words:['ship','shop','shell','fish','dish','wish','brush','flash'],
      sentences:['The fish is in the dish.','She sells shells by the shore.','The ship had a bright flash of light.','Can you brush the dog?','I wish I had a shell.']
    }
  },
  {
    id:'r002', subject:'reading', title:'The "CH" Digraph', type:'reading', week:'2026-W18',
    content:{
      sound:'CH', soundDescription:'CH makes the "ch" sound — like a little train: ch-ch-ch!',
      words:['chin','chip','chop','chat','bench','lunch','ranch','church'],
      sentences:['I had chips for lunch.','The child sat on the bench.','Can you chop the cheese?','We had a chat at the ranch.']
    }
  },
  {
    id:'r003', subject:'reading', title:'The "TH" Digraph', type:'reading', week:'2026-W19',
    content:{
      sound:'TH', soundDescription:'TH makes a special sound — put your tongue between your teeth and blow!',
      words:['the','this','that','them','bath','math','with','think'],
      sentences:['This is the path to the barn.','I think that is the right answer.','They went for a bath.','I am with them on the math.']
    }
  },
  // ── WRITING / SPELLING ──────────────────────────────────────────
  {
    id:'s001', subject:'writing', title:'Sight Words: Set 3', type:'spelling', week:'2026-W17',
    content:{ words:['the','and','you','that','was','for','are','with'] }
  },
  {
    id:'s002', subject:'writing', title:'Sight Words: Set 4', type:'spelling', week:'2026-W18',
    content:{ words:['his','they','at','be','this','have','from','or'] }
  },
  {
    id:'s003', subject:'writing', title:'Sight Words: Set 5', type:'spelling', week:'2026-W19',
    content:{ words:['one','had','by','word','but','not','what','all'] }
  },
  // ── MATH ────────────────────────────────────────────────────────
  {
    id:'mpv001', subject:'math', title:'Place Value: Ones, Tens & Hundreds', type:'math_place_value', week:'2026-W17',
    content:{
      intro:'Every digit in a number has a special place! The place tells us exactly how much that digit is worth.',
      examples:[
        { number:37,  show:['tens','ones'] },
        { number:253, show:['hundreds','tens','ones'] },
      ],
      quiz:[
        { number:56,  question:'What digit is in the ones place?',     answer:6,  choices:[5,6,0,1] },
        { number:83,  question:'What digit is in the tens place?',     answer:8,  choices:[3,8,0,4] },
        { number:247, question:'What digit is in the hundreds place?', answer:2,  choices:[4,7,2,0] },
        { number:165, question:'What is the value of the 6?',          answer:60, choices:[6,60,600,16] },
      ]
    }
  },
  {
    id:'m001', subject:'math', title:'Two-Digit Addition with Carrying', type:'math_stacked', week:'2026-W18',
    content:{
      intro:'When numbers in a column add up to 10 or more, we "carry" to the next column!',
      operation:'add',
      problems:[{num1:22,num2:18},{num1:35,num2:27},{num1:46,num2:15}]
    }
  },
  {
    id:'m002', subject:'math', title:'More Carrying Practice', type:'math_stacked', week:'2026-W19',
    content:{
      intro:'Let\'s keep practicing carrying! Remember — ones column first.',
      operation:'add',
      problems:[{num1:37,num2:44},{num1:58,num2:23},{num1:19,num2:63}]
    }
  },
  // ── SCIENCE ─────────────────────────────────────────────────────
  {
    id:'sc001', subject:'science', title:'Living vs. Non-Living Things', type:'interactive', week:'2026-W17',
    content:{
      videoId:'',   // paste a YouTube video ID here, e.g. 'HgJ0RB_Bexc'
      activity:{
        type:'fill_blank',
        sentences:[
          { text:'Plants and animals are ___ things.',                      answer:'living',     choices:['living','non-living','broken','heavy'] },
          { text:'A rock does not breathe, so it is a ___ thing.',          answer:'non-living', choices:['living','non-living','breathing','tiny'] },
          { text:'Living things need food, water, and ___ to survive.',     answer:'air',        choices:['air','toys','money','cars'] },
        ]
      },
      discussion:'Look around the room. Can you find 3 living things and 3 non-living things? What makes them different?'
    }
  },
  {
    id:'sc002', subject:'science', title:'Plants Need Sunlight & Water', type:'interactive', week:'2026-W18',
    content:{
      videoId:'',
      activity:{
        type:'order',
        prompt:'Put the plant life cycle in the right order!',
        items:['The flower blooms','A seed falls to the ground','Roots grow down, shoot grows up','Leaves appear on the plant'],
        correctOrder:[1,2,3,0]
      },
      discussion:'Find a plant in your home or yard. Can you point to its roots, stem, and leaves?'
    }
  },
  // ── SOCIAL STUDIES ──────────────────────────────────────────────
  {
    id:'ss001', subject:'social_studies', title:'My Family & Community', type:'interactive', week:'2026-W17',
    content:{
      videoId:'',
      activity:{
        type:'fill_blank',
        sentences:[
          { text:'A ___ is a group of people who live and work together.',      answer:'community', choices:['community','forest','weather','building'] },
          { text:'Firefighters and teachers are called community ___.',          answer:'helpers',   choices:['helpers','players','shoppers','builders'] },
          { text:'Your ___ is your first and most important community.',        answer:'family',    choices:['family','school','car','bedroom'] },
        ]
      },
      discussion:'Who are the community helpers in your neighborhood? What do they do to help people?'
    }
  },
  {
    id:'ss002', subject:'social_studies', title:'Maps & Where We Live', type:'interactive', week:'2026-W18',
    content:{
      videoId:'',
      activity:{
        type:'order',
        prompt:'What order do you make a map in?',
        items:['Add a title to your map','Draw the outline of your area','Draw symbols for roads and buildings','Add a key to explain the symbols'],
        correctOrder:[1,2,3,0]
      },
      discussion:'Can you draw a simple map of your bedroom? Where is the door? Your bed? Your window?'
    }
  },
];

function getWeekString(date){
  const d=new Date(date); d.setHours(0,0,0,0);
  d.setDate(d.getDate()+3-(d.getDay()+6)%7);
  const w1=new Date(d.getFullYear(),0,4);
  const wn=1+Math.round(((d-w1)/86400000-3+(w1.getDay()+6)%7)/7);
  return `${d.getFullYear()}-W${String(wn).padStart(2,'0')}`;
}
function formatWeekLabel(ws){
  if(!ws)return'';
  const[year,wp]=ws.split('-W'); const wn=parseInt(wp);
  const jan4=new Date(parseInt(year),0,4);
  const mon=new Date(jan4); mon.setDate(jan4.getDate()-((jan4.getDay()+6)%7)+(wn-1)*7);
  const sun=new Date(mon); sun.setDate(mon.getDate()+6);
  const f=d=>d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  return`${f(mon)} – ${f(sun)}`;
}
function parseCSVLine(line){
  const r=[];let c='',q=false;
  for(let ch of line){if(ch==='"'){q=!q;}else if(ch===','&&!q){r.push(c.trim());c='';}else{c+=ch;}}
  r.push(c.trim());return r;
}
function parseCSVCurriculum(csv){
  const lines=csv.trim().split(/\r?\n/); if(lines.length<2)return[];
  const headers=parseCSVLine(lines[0]).map(h=>h.trim().toLowerCase());
  return lines.slice(1).map((line,idx)=>{
    if(!line.trim())return null;
    const vals=parseCSVLine(line); const obj={};
    headers.forEach((h,i)=>{obj[h]=vals[i]||'';});
    try{return{id:obj.id||`csv_${Date.now()}_${idx}`,subject:obj.subject||'reading',title:obj.title||'Untitled',type:obj.type||'general',week:obj.week||getWeekString(new Date()),content:obj.content?JSON.parse(obj.content):{}};}
    catch(e){return null;}
  }).filter(Boolean);
}
Object.assign(window,{SUBJECT_CONFIG,SUBJECT_ORDER,SAMPLE_CURRICULUM,getWeekString,formatWeekLabel,parseCSVCurriculum});
