document.addEventListener('DOMContentLoaded', () => {
  const fileInput       = document.getElementById('fileInput');
  const uploadFileBtn   = document.getElementById('uploadFileBtn');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const textInput       = document.getElementById('textInput');
  const convertBtn      = document.getElementById('convertBtn');
  const outTA           = document.getElementById('jsonOutput');
  const downloadBtn     = document.getElementById('downloadJsonBtn');

  uploadFileBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    fileNameDisplay.textContent = file.name;
    file.text().then(txt => textInput.value = txt);
  });

  convertBtn.addEventListener('click', () => {
    const raw = textInput.value.trim();
    if (!raw) {
      alert('Please paste or upload a lyrics file first.');
      return;
    }

    const name = fileInput.files[0]?.name || 'lyrics';
    let result;

    if (name.toLowerCase().endsWith('.lrc')) {
      result = processLrcContent(raw);
    } else if (name.toLowerCase().endsWith('.srt')) {
      result = processSrtContent(raw);
    } else if (name.toLowerCase().endsWith('.txt')) {
      result = processTxtContent(raw);
    } else {
      alert('Unsupported file type. Use .lrc, .srt or .txt');
      return;
    }

    const fullJson = { lyrics: result.captions };
    const jsonStr  = JSON.stringify(fullJson, null, 2);

    outTA.textContent = jsonStr;

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);

    downloadBtn.href = url;
    downloadBtn.download = `${(result.songTitle || name.replace(/\.[^.]+$/, '')).toLowerCase().replace(/\s+/g,'-')}-lyrics.json`;
    downloadBtn.classList.remove('disabled');
    downloadBtn.removeAttribute('aria-disabled');
  });
});

// ======= PARSERS & HELPERS =======
const DEFAULT_DISPLAY_DURATION = 3000;

function parseLrcLine(line) {
  const m = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
  if (!m) return null;
  const mins = parseInt(m[1],10),
        secs = parseFloat(m[2]),
        txt  = m[3].trim();
  return { time: mins*60000 + Math.round(secs*1000), text: txt };
}

function processLrcContent(content) {
  const lines = content.split(/\r?\n/);
  let songTitle = null, caps = [];

  lines.forEach(line => {
    const ti = line.match(/^\[ti:(.*?)\]$/i);
    if (ti) { songTitle = ti[1].trim(); return; }
    const p = parseLrcLine(line);
    if (p) caps.push({ ...p, topText:'', bottomText:'', displayDuration:DEFAULT_DISPLAY_DURATION });
  });

  caps.sort((a,b)=>a.time-b.time);
  return { songTitle, captions: caps };
}

function parseSrtTimestamp(ts) {
  const m = ts.match(/^(\d+):(\d+):(\d+),(\d+)$/);
  if (!m) return null;
  const [h,mn,s,ms] = m.slice(1).map(Number);
  return ((h*3600 + mn*60 + s)*1000) + ms;
}

function processSrtContent(content) {
  const lines = content.split(/\r?\n/), caps = [];
  let i=0;

  while(i<lines.length){
    if(!lines[i].trim()){ i++; continue; }
    i++; // idx line
    if(i>=lines.length) break;

    const arrow = lines[i++].match(/(.+)\s+-->\s+(.+)/);
    if(!arrow) continue;
    const start = parseSrtTimestamp(arrow[1].trim()),
          end   = parseSrtTimestamp(arrow[2].trim());
    const texts = [];
    while(i<lines.length && lines[i].trim()){
      texts.push(lines[i++].trim());
    }
    const txt = texts.join(' ');
    if(start!=null && txt){
      caps.push({
        time: start, text: txt,
        topText:'', bottomText:'',
        displayDuration: end ? (end - start) : DEFAULT_DISPLAY_DURATION
      });
    }
    i++;
  }

  caps.sort((a,b)=>a.time-b.time);
  return { songTitle: null, captions: caps };
}

function processTxtContent(content) {
  const lines = content.split(/\r?\n/), caps = [];
  let t=0;
  lines.forEach(line => {
    const txt = line.trim();
    if(!txt) return;
    caps.push({ time:t, text:txt, topText:'', bottomText:'', displayDuration:DEFAULT_DISPLAY_DURATION });
    t += DEFAULT_DISPLAY_DURATION;
  });
  return { songTitle: null, captions: caps };
}
