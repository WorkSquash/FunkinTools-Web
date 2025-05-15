document.getElementById('convertBtn').addEventListener('click', processFiles);

function processFiles() {
    const files = document.getElementById('fileInput').files;
    const outputDiv = document.getElementById('output');
    const downloadBtn = document.getElementById('downloadBtn');
    let allOutputs = {};

    outputDiv.textContent = 'Processing...';
    downloadBtn.style.display = 'none';

    if (!files.length) {
        outputDiv.textContent = 'Please select one or more LRC files.';
        return;
    }

    Promise.all(Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                const result = processLRC(e.target.result);
                const outName = file.name.replace('.lrc', '-lyrics.json');
                allOutputs[outName] = result.jsonOutput;
                resolve();
            };
            reader.onerror = () => reject(`Error reading ${file.name}`);
            reader.readAsText(file);
        });
    }))
    .then(() => displayFirstOutput(allOutputs))
    .catch(err => outputDiv.textContent = `Error: ${err}`);
}

function displayFirstOutput(allOutputs) {
    const outputDiv = document.getElementById('output');
    const downloadBtn = document.getElementById('downloadBtn');
    const firstKey = Object.keys(allOutputs)[0];

    if (!firstKey) {
        outputDiv.textContent = 'No valid LRC files processed.';
        return;
    }

    const parsed = JSON.parse(allOutputs[firstKey]);
    outputDiv.textContent = JSON.stringify(parsed, null, 4);

    const jsonString = JSON.stringify({ lyrics: parsed.lyrics }, null, 4);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    downloadBtn.href = url;
    downloadBtn.download = firstKey;
    downloadBtn.style.display = 'block';
}

function processLRC(lrcContent) {
    const lines = lrcContent.split('\n');
    let captions = [];

    for (const line of lines) {
        const titleMatch = line.match(/\[ti:(.*?)\]/i);
        if (titleMatch) continue;

        const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
        if (match) {
            const minutes = +match[1];
            const seconds = +match[2];
            captions.push({
                time: Math.round(minutes * 60000 + seconds * 1000),
                text: match[3].trim(),
                topText: "",
                bottomText: "",
                displayDuration: 3000
            });
        }
    }

    captions.sort((a, b) => a.time - b.time);
    return { jsonOutput: JSON.stringify({ lyrics: captions }) };
}
