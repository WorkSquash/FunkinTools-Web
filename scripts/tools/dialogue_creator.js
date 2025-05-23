document.addEventListener('DOMContentLoaded', () => {
  const characterSelect = document.getElementById('characterSelect');
  const expressionSelect = document.getElementById('expressionSelect');
  const boxStateSelect = document.getElementById('boxStateSelect');
  const soundInput = document.getElementById('soundInput');
  const speedInput = document.getElementById('speedInput');
  const dialogueText = document.getElementById('dialogueText');
  const addLineBtn = document.getElementById('addLineBtn');
  const generateBtn = document.getElementById('generateBtn');
  const dialoguePreview = document.getElementById('dialoguePreview');
  const jsonOutput = document.getElementById('jsonOutput');
  const luaOutput = document.getElementById('luaOutput');
  const downloadJsonBtn = document.getElementById('downloadJsonBtn');
  const downloadLuaBtn = document.getElementById('downloadLuaBtn');

  let dialogueLines = [];

  addLineBtn.addEventListener('click', () => {
    const character = characterSelect.value;
    const expression = expressionSelect.value;
    const boxState = boxStateSelect.value;
    const sound = soundInput.value.trim();
    const speed = parseFloat(speedInput.value);
    const text = dialogueText.value.trim();

    if (!text) {
      alert('Please enter dialogue text.');
      return;
    }

    const line = {
      sound: sound,
      speed: speed,
      portrait: character,
      boxState: boxState,
      expression: expression,
      text: text
    };

    dialogueLines.push(line);
    updateDialoguePreview();
    dialogueText.value = '';
  });

  function updateDialoguePreview() {
    dialoguePreview.innerHTML = '';
    dialogueLines.forEach((line, index) => {
      const li = document.createElement('li');
      li.textContent = `${line.portrait} (${line.expression}): ${line.text}`;
      dialoguePreview.appendChild(li);
    });
  }

  generateBtn.addEventListener('click', () => {
    if (dialogueLines.length === 0) {
      alert('Please add at least one dialogue line.');
      return;
    }

    const dialogueJSON = {
      dialogue: dialogueLines
    };

    jsonOutput.value = JSON.stringify(dialogueJSON, null, 2);

    const luaScript = `local doDialogue = true

function onStartCountdown()
  if doDialogue and not seenCutscene and isStoryMode then
    startDialogue('dialogue', 'breakfast')
    doDialogue = false
    return Function_Stop
  end
  return Function_Continue
end`;

    luaOutput.value = luaScript;
  });

  downloadJsonBtn.addEventListener('click', () => {
    if (!jsonOutput.value) {
      alert('Please generate the JSON first.');
      return;
    }
    downloadFile('dialogue.json', jsonOutput.value);
  });

  downloadLuaBtn.addEventListener('click', () => {
    if (!luaOutput.value) {
      alert('Please generate the Lua script first.');
      return;
    }
    downloadFile('dialogue.lua', luaOutput.value);
  });

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
});
