// 対応表
const notes = [
    // C (0)
    { abc: "C", letter: "C", acc: 0, pc: 0 },

    // C#/Db (1)
    { abc: "^C", letter: "C", acc: +1, pc: 1 },
    { abc: "_D", letter: "D", acc: -1, pc: 1 },

    // D (2)
    { abc: "D", letter: "D", acc: 0, pc: 2 },

    // D#/Eb (3)
    { abc: "^D", letter: "D", acc: +1, pc: 3 },
    { abc: "_E", letter: "E", acc: -1, pc: 3 },

    // E (4)
    { abc: "E", letter: "E", acc: 0, pc: 4 },

    // F (5)
    { abc: "F", letter: "F", acc: 0, pc: 5 },

    // F#/Gb (6)
    { abc: "^F", letter: "F", acc: +1, pc: 6 },
    { abc: "_G", letter: "G", acc: -1, pc: 6 },

    // G (7)
    { abc: "G", letter: "G", acc: 0, pc: 7 },

    // G#/Ab (8)
    { abc: "^G", letter: "G", acc: +1, pc: 8 },
    { abc: "_A", letter: "A", acc: -1, pc: 8 },

    // A (9)
    { abc: "A", letter: "A", acc: 0, pc: 9 },

    // A#/Bb (10)
    { abc: "^A", letter: "A", acc: +1, pc: 10 },
    { abc: "_B", letter: "B", acc: -1, pc: 10 },

    // B (11)
    { abc: "B", letter: "B", acc: 0, pc: 11 },
];

const letters = ["C", "D", "E", "F", "G", "A", "B"];

function degreeBetween(a, b) {
    const indexA = letters.indexOf(a.letter);
    const indexB = letters.indexOf(b.letter);
    const diff = (indexB - indexA + 7) % 7;
    return diff + 1;
}

function semitoneBetween(a, b) {
    return (b.pc - a.pc + 12) % 12;
}

const baseSemitoneList = {
    1: 0,
    2: 2,
    3: 4,
    4: 5,
    5: 7,
    6: 9,
    7: 11,
}

function getQuality(degree, semis) {
    const base = baseSemitoneList[degree];
    const delta = semis - base;

    const perfectType = (degree === 1 || degree === 4 || degree === 5);

    if (perfectType) {
        if (delta === 0) return '完全';
        if (delta === 1) return '増';
        if (delta === -1) return '減';
        if (delta === 2) return '重増';
        if (delta === -2) return '重減';
    } else {
        if (delta === 0) return '長';
        if (delta === -1) return '短';
        if (delta === 1) return '増';
        if (delta === -2) return '減';
        if (delta === 2) return '重増';
        if (delta === -3) return '重減';
    }

    return '不明'
}

function intervalName(a, b) {
    const deg = degreeBetween(a, b);
    const sem = semitoneBetween(a, b);
    const qual = getQuality(deg, sem);
    return `${qual}${deg}度`
}

// 度数変換用
function invertQuality(qual) {
  if (qual === "長") return "短";
  if (qual === "短") return "長";
  if (qual === "増") return "減";
  if (qual === "減") return "増";
  if (qual === "完全") return "完全";
  return qual;
}

function invertInterval(qual, deg) {
    const newDeg = 9 - deg;
    const newQual = invertQuality(qual);
    return {qual: newQual, deg: newDeg};
}

function createChord() {
    let a, b, deg, sem, qual;

    do  {
        a = notes[Math.floor(Math.random() * notes.length)];
        b = notes[Math.floor(Math.random() * notes.length)];
        deg = degreeBetween(a, b);
        sem = semitoneBetween(a, b);
        qual = getQuality(deg, sem);
    } while (a.pc > b.pc || a === b || qual === '不明' || qual === '重増' || qual === '重減' || deg === 1 || deg === 7)

    const chord = `[${a.abc}${b.abc}]4`;

    let newQual = qual;
    let newDeg = deg;

    if (deg === 4) {
        const inverted = invertInterval(qual, deg);
        newQual = inverted.qual;
        newDeg = inverted.deg;
    }

    const interval = `${newQual}${newDeg}度`;
    return {chord, interval};
}


let result = null;
let visualObj = null;
let synthControl = null;

function getScore(r) {
  return `X:1
T:
M:4/4
L:1/4
K:C
${r.chord}|`;
}


function renderQuestion() {
  result = createChord();

  const answer = document.getElementById("answer");
  answer.textContent = result.interval;
  answer.classList.add("hidden");

  document.getElementById("score").innerHTML = "";
  visualObj = ABCJS.renderAbc("score", getScore(result))[0];

  document.getElementById("audio").innerHTML = "";

  synthControl = new ABCJS.synth.SynthController();
  synthControl.load("#audio", null, {
    displayPlay: false,
    displayStop: false,
    displayProgress: false
  });

  synthControl.setTune(visualObj, false).catch(console.error);
}

document.getElementById("playBtn").addEventListener("click", () => {
  synthControl.play();
});

document.getElementById("nextBtn").addEventListener("click", () => {
  try { synthControl.stop(); } catch(e) {}
  renderQuestion();
});

document.getElementById("answerBtn").addEventListener("click", () => {
  document.getElementById("answer").classList.remove("hidden");
});

renderQuestion();






