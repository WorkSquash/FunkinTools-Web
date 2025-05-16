document.addEventListener('DOMContentLoaded', () => {
  const fileInput       = document.getElementById('lrcFile');
  const uploadLrcBtn    = document.getElementById('uploadLrcBtn');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const textInput       = document.getElementById('lrcInput');
  const convertBtn      = document.getElementById('convertBtn');
  const outTA           = document.getElementById('jsonOutput');
  const downloadBtn     = document.getElementById('downloadJsonBtn');

  // When the upload button is clicked, trigger the hidden file input
  uploadLrcBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // When a file is selected
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      textInput.value = e.target.result;
    };
    reader.readAsText(file);

    // Show file name
    fileNameDisplay.textContent = file.name;
  });

  // Convert button logic
  convertBtn.addEventListener('click', () => {
    const lrcText = textInput.value.trim();
    if (!lrcText) {
      alert('Please paste or upload an LRC file first.');
      return;
    }

    const parsed = parseLRC(lrcText);
    const jsonStr = JSON.stringify({ lyrics: parsed }, null, 2);

    outTA.value = jsonStr;

    // prepare download link
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);

    downloadBtn.href = url;
    downloadBtn.download = 'lyrics.json';
    downloadBtn.classList.remove('disabled');
    downloadBtn.removeAttribute('aria-disabled');
  });
});

/**
 * parseLRC(text:string) => Array<{time:number,text:string}>
 * Extracts [mm:ss.xx] tags, converts to ms, strips tags.
 */
function parseLRC(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  const re = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

  for (let line of lines) {
    const tags = [];
    let m;
    while ((m = re.exec(line)) !== null) {
      const mins = +m[1];
      const secs = +m[2];
      const ms   = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) : 0;
      tags.push(mins * 60_000 + secs * 1000 + ms);
    }

    const lyric = line.replace(re, '').trim();
    tags.forEach(t => entries.push({ time: t, text: lyric }));
  }

  return entries.sort((a, b) => a.time - b.time);
}
