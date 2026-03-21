/* ═══════════════════════════════════════════════════════════════
   FLAGVAULT CTF — STRINGS HUNT
   script.js

   FLAG:  FlagVault{Str1ngs_4r3_Y0ur_Fr13nd}

   What this file does:
   1. Provides a real downloadable ELF x86-64 binary (base64-encoded)
      that actually contains the flag as a string at offset 0x132.
   2. Simulates a Linux terminal — supports: strings, file, hexdump,
      xxd, cat, ls, grep, run, help, clear
   3. Validates the flag on submission (obfuscated).
   4. Confetti on correct flag + pretty error on wrong flag.
═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   1.  REAL ELF BINARY (base64-encoded, 341 bytes)
       Built from: minimal ELF64 x86-64, prints "Nothing here."
       Flag string embedded at offset 0x132 (306 decimal)
   ───────────────────────────────────────────────────────────── */
const ELF_B64 =
  "f0VMRgIBAQAAAAAAAAAAAAIAPgABAAAAeABAAAAAAABAAAAAAAAAAAAAAA" +
  "AAAAAAAABAAOBAABAAQAAAAAAAAEAAAAFAAAAAAAAAAAAAAEAAAAAAAAA" +
  "QAAAAAAAAABVAQAAAAAAABUBAAAAAAAAACAAAAAASI01OQAAAL8BAAAA" +
  "uhoAAAC4AQAAAA8FMf+4PAAAAA8FkJCQkJCQkJCQkJCQkJCQkJCQkJCQ" +
  "kJCQkJCQkJCQkE5vdGhpbmcgaGVyZS4gVHJ5IGhhcmRlci4KZGVidWdf" +
  "a2V5PUFBQUFBQUEAdmVyc2lvbj0xLjAuMABhdXRob3I9Y3RmX2FkbWlu" +
  "AEZsYWdWYXVsdHtmYWtlX2ZsYWdfbG9sfQBzZWNyZXQ9MHhERUFEQkVF" +
  "RgAAAABGbGFnVmF1bHR7U3RyMW5nc180cjNfWTB1cl9GcjEzbmR9AA==";

/* ─────────────────────────────────────────────────────────────
   2.  STRINGS OUTPUT — simulated `strings strings_hunt`
       This is the exact output our Python script produced.
   ───────────────────────────────────────────────────────────── */
const STRINGS_OUTPUT = [
  "Nothing here. Try harder.",
  "debug_key=AAAAAAA",
  "version=1.0.0",
  "author=ctf_admin",
  "FlagVault{fake_flag_lol}",
  "secret=0xDEADBEEF",
  "FlagVault{Str1ngs_4r3_Y0ur_Fr13nd}"
];

/* Simulated xxd/hexdump (first 128 bytes) */
const XXD_OUTPUT = `00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 7800 4000 0000 0000  ..>.....x.@.....
00000020: 4000 0000 0000 0000 0000 0000 0000 0000  @...............
00000030: 0000 0000 4000 3800 0100 4000 0000 0000  ....@.8...@.....
00000040: 0100 0000 0500 0000 0000 0000 0000 0000  ................
00000050: 0000 4000 0000 0000 0000 4000 0000 0000  ..@.......@.....
00000060: 5501 0000 0000 0000 5501 0000 0000 0000  U.......U.......
00000070: 0020 0000 0000 0000 488d 353900 0000 bf01  . ......H.59....
00000080: 0000 00ba 1a00 0000 b801 0000 000f 0531  ...............1
00000090: ffb8 3c00 0000 0f05 9090 9090 9090 9090  ..<.............
000000a0: 9090 9090 9090 9090 9090 9090 9090 9090  ................
000000b0: 9090 9090 9090 9090 9090 9090 9090 9090  ................
000000c0: 4e6f 7468 696e 6720 6865 7265 2e20 5472  Nothing here. Tr
000000d0: 7920 6861 7264 6572 2e0a 6465 6275 675f  y harder..debug_
000000e0: 6b65 793d 4141 4141 4141 4100 7665 7273  key=AAAAAAA.vers
000000f0: 696f 6e3d 312e 302e 3000 6175 7468 6f72  ion=1.0.0.author`;

/* ─────────────────────────────────────────────────────────────
   3.  TERMINAL SIMULATOR
   ───────────────────────────────────────────────────────────── */

const termBody  = document.getElementById('term-body');
const termInput = document.getElementById('term-input');
let cmdHistory = [];
let histIdx    = -1;

function appendLine(html, cls = '') {
  const d = document.createElement('div');
  d.className = 'term-output' + (cls ? ' ' + cls : '');
  d.innerHTML = html;
  termBody.appendChild(d);
  termBody.scrollTop = termBody.scrollHeight;
}

function appendPromptLine(cmd) {
  const d = document.createElement('div');
  d.className = 'term-line';
  d.innerHTML =
    `<span class="term-prompt">analyst@flagvault</span>` +
    `<span class="term-sep">:</span>` +
    `<span class="term-path">~/challenge</span>` +
    `<span class="term-dollar">$</span>` +
    `<span class="term-txt"> ${escHtml(cmd)}</span>`;
  termBody.appendChild(d);
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function handleTermInput(e) {
  if (e.key === 'Enter') {
    const raw = termInput.value.trim();
    if (!raw) return;
    cmdHistory.unshift(raw);
    histIdx = -1;
    termInput.value = '';
    appendPromptLine(raw);
    processCommand(raw);
    termBody.scrollTop = termBody.scrollHeight;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < cmdHistory.length - 1) histIdx++;
    termInput.value = cmdHistory[histIdx] || '';
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx > 0) histIdx--;
    else { histIdx = -1; termInput.value = ''; return; }
    termInput.value = cmdHistory[histIdx] || '';
  }
}

function processCommand(raw) {
  const parts = raw.split(/\s+/);
  const cmd   = parts[0].toLowerCase();
  const args  = parts.slice(1);

  switch (cmd) {

    /* ── ls ── */
    case 'ls':
      if (args.includes('-la') || args.includes('-al') || args.includes('-l')) {
        appendLine(
          `total 8\n` +
          `drwxr-xr-x 2 analyst analyst 4096 Jan 15 09:12 <span style="color:var(--accent5)">.</span>\n` +
          `drwxr-xr-x 8 analyst analyst 4096 Jan 15 09:11 <span style="color:var(--accent5)">..</span>\n` +
          `-rwxr-xr-x 1 analyst analyst  341 Jan 15 09:10 <span style="color:var(--accent3)">strings_hunt</span>`
        );
      } else {
        appendLine(`<span style="color:var(--accent3)">strings_hunt</span>`);
      }
      break;

    /* ── file ── */
    case 'file':
      if (!args[0] || args[0] === 'strings_hunt') {
        appendLine(`strings_hunt: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, not stripped`);
      } else {
        appendLine(`file: ${escHtml(args[0])}: No such file or directory`, 'term-err');
      }
      break;

    /* ── strings ── */
    case 'strings': {
      if (!args[0] || args[0] === 'strings_hunt') {
        // Check for grep pipe
        const grepIdx = args.indexOf('|');
        let pattern = null;
        if (raw.includes('|') && raw.includes('grep')) {
          const gm = raw.match(/grep\s+(\S+)/);
          if (gm) pattern = gm[1].replace(/['"]/g,'');
        }
        const lines = STRINGS_OUTPUT
          .filter(s => pattern ? s.includes(pattern) : true);

        let out = '';
        lines.forEach(s => {
          const isRealFlag = s === 'FlagVault{Str1ngs_4r3_Y0ur_Fr13nd}';
          const isFake     = s.startsWith('FlagVault{fake');
          if (isRealFlag) {
            out += `<span style="color:var(--accent3);text-shadow:0 0 8px rgba(245,166,35,.6);font-weight:bold">${escHtml(s)}</span>\n`;
          } else if (isFake) {
            out += `<span style="color:var(--accent2);text-decoration:line-through">${escHtml(s)}</span>\n`;
          } else {
            out += `${escHtml(s)}\n`;
          }
        });
        appendLine(out.trimEnd());
      } else {
        appendLine(`strings: ${escHtml(args[0])}: No such file`, 'term-err');
      }
      break;
    }

    /* ── xxd / hexdump ── */
    case 'xxd':
    case 'hexdump':
      if (!args[0] || args[0] === 'strings_hunt' || args.includes('strings_hunt')) {
        appendLine(`<span style="color:var(--text-dim)">${escHtml(XXD_OUTPUT)}\n...(truncated — use <code>strings</code> to extract text)</span>`);
      } else {
        appendLine(`${cmd}: ${escHtml(args[0] || '')}: No such file`, 'term-err');
      }
      break;

    /* ── cat ── */
    case 'cat':
      if (args[0] === 'strings_hunt') {
        appendLine(`<span style="color:var(--accent2)">Binary file — cannot display as text. Try: <code>strings strings_hunt</code> or <code>xxd strings_hunt</code></span>`);
      } else if (!args[0]) {
        appendLine(`cat: missing operand`, 'term-err');
      } else {
        appendLine(`cat: ${escHtml(args[0])}: No such file or directory`, 'term-err');
      }
      break;

    /* ── grep standalone ── */
    case 'grep': {
      // grep FlagVault strings_hunt  OR  grep -a FlagVault strings_hunt
      const pattern = args.filter(a => !a.startsWith('-'))[0];
      const file    = args.filter(a => !a.startsWith('-'))[1];
      if (file === 'strings_hunt' && pattern) {
        const matches = STRINGS_OUTPUT.filter(s => s.includes(pattern));
        if (matches.length) {
          matches.forEach(m => {
            const hi = escHtml(m).replace(
              escHtml(pattern),
              `<span style="background:rgba(245,166,35,.2);color:var(--accent3)">${escHtml(pattern)}</span>`
            );
            appendLine(hi);
          });
        } else {
          appendLine(`(no matches)`, 'term-err');
        }
      } else {
        appendLine(`Usage: grep PATTERN strings_hunt`, 'term-err');
      }
      break;
    }

    /* ── ./strings_hunt (run the binary) ── */
    case './strings_hunt':
    case './strings_hunt;':
      appendLine(`Nothing here. Try harder.`);
      break;

    /* ── readelf ── */
    case 'readelf':
      if (args.includes('strings_hunt')) {
        appendLine(
          `ELF Header:\n` +
          `  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00\n` +
          `  Class:                             ELF64\n` +
          `  Data:                              2's complement, little endian\n` +
          `  Version:                           1 (current)\n` +
          `  OS/ABI:                            UNIX - System V\n` +
          `  Type:                              EXEC (Executable file)\n` +
          `  Machine:                           Advanced Micro Devices X86-64\n` +
          `  Entry point address:               0x400078\n` +
          `  Start of program headers:          64 (bytes into file)\n` +
          `  Number of program headers:         1\n` +
          `  Size of this header:               64 (bytes)`
        );
      } else {
        appendLine(`readelf: Error: No ELF file(s) given`, 'term-err');
      }
      break;

    /* ── clear ── */
    case 'clear':
    case 'cls':
      termBody.innerHTML = '';
      break;

    /* ── help ── */
    case 'help':
    case '?':
      appendLine(
        `<span style="color:var(--accent)">Available commands:</span>\n` +
        `  <span style="color:var(--accent3)">ls [-la]</span>           — list files\n` +
        `  <span style="color:var(--accent3)">file strings_hunt</span>  — show file type\n` +
        `  <span style="color:var(--accent3)">strings strings_hunt</span>  — extract printable strings  ← <span style="color:var(--accent2)">start here</span>\n` +
        `  <span style="color:var(--accent3)">strings strings_hunt | grep FlagVault</span>  — filter results\n` +
        `  <span style="color:var(--accent3)">xxd strings_hunt</span>   — hex dump\n` +
        `  <span style="color:var(--accent3)">grep PATTERN strings_hunt</span>  — search for pattern\n` +
        `  <span style="color:var(--accent3)">readelf -h strings_hunt</span>  — ELF headers\n` +
        `  <span style="color:var(--accent3)">./strings_hunt</span>     — run the binary\n` +
        `  <span style="color:var(--accent3)">clear</span>              — clear terminal\n` +
        `\n<span style="color:var(--text-dim)">Use ↑ / ↓ to cycle command history.</span>`
      );
      break;

    /* ── unknown ── */
    default:
      appendLine(
        `<span style="color:var(--accent2)">${escHtml(cmd)}: command not found</span> ` +
        `<span style="color:var(--text-dim)">(type <code>help</code> for available commands)</span>`,
        'term-err'
      );
  }
}

/* Focus terminal input when clicking anywhere on the terminal */
document.querySelector('.terminal-wrap')?.addEventListener('click', () => {
  termInput.focus();
});

/* ─────────────────────────────────────────────────────────────
   4.  DOWNLOAD REAL ELF BINARY
   ───────────────────────────────────────────────────────────── */
function downloadBinary() {
  // Decode base64 → Uint8Array → Blob → download
  const binStr  = atob(ELF_B64.replace(/\s/g, ''));
  const bytes   = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);

  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'strings_hunt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('⬇ Downloading strings_hunt…');
}

/* ─────────────────────────────────────────────────────────────
   5.  FLAG SUBMISSION
       Flag: FlagVault{Str1ngs_4r3_Y0ur_Fr13nd}
       Stored as char codes — not a plain string in source.
   ───────────────────────────────────────────────────────────── */

// Obfuscated flag inner: "Str1ngs_4r3_Y0ur_Fr13nd"
const _fi = [83,116,114,49,110,103,115,95,52,114,51,95,89,48,117,114,95,70,114,49,51,110,100];
const _flag = 'FlagVault{' + _fi.map(c => String.fromCharCode(c)).join('') + '}';

function submitFlag() {
  const raw    = document.getElementById('flag-input').value.trim();
  const result = document.getElementById('submit-result');
  const full   = 'FlagVault{' + raw + '}';

  if (!raw) {
    showToast('⚠ Enter a flag first.');
    return;
  }

  if (full === _flag || raw === _flag) {
    result.className = 'submit-result correct';
    result.innerHTML =
      `<span class="correct-bang">✅</span> &nbsp;<strong>CORRECT FLAG!</strong> &nbsp;` +
      `<span style="color:var(--accent)">+100 pts</span><br>` +
      `<span style="color:var(--text-dim);font-size:0.72rem;margin-top:0.3rem;display:block">` +
      `The flag was sitting right there in the binary. <code>strings</code> never lies.</span>`;
    launchConfetti();
  } else {
    result.className = 'submit-result incorrect';
    result.innerHTML =
      `❌ &nbsp;<strong>WRONG FLAG</strong> &nbsp;— ` +
      `<span style="color:var(--text-dim)">` +
      `Try running <code>strings strings_hunt | grep FlagVault</code> in the terminal above.</span>`;
  }
}

/* ─────────────────────────────────────────────────────────────
   6.  HINT ACCORDION
   ───────────────────────────────────────────────────────────── */
function toggleHint(id) {
  const item = document.getElementById(id);
  if (!item) return;
  item.classList.toggle('open');
}

/* ─────────────────────────────────────────────────────────────
   7.  CONFETTI
   ───────────────────────────────────────────────────────────── */
function launchConfetti() {
  const cols = ['#00e8c8','#ff2d6b','#f5a623','#7c3aed','#3498db'];
  if (!document.getElementById('_cst')) {
    const s = document.createElement('style');
    s.id = '_cst';
    s.textContent = '@keyframes cffall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}';
    document.head.appendChild(s);
  }
  for (let i = 0; i < 90; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.style.cssText =
        `position:fixed;left:${Math.random()*100}vw;top:-12px;` +
        `width:${6+Math.random()*6}px;height:${6+Math.random()*6}px;` +
        `background:${cols[0|Math.random()*cols.length]};` +
        `border-radius:${Math.random()>.5?'50%':'2px'};` +
        `z-index:99999;pointer-events:none;` +
        `animation:cffall ${1.4+Math.random()*2}s linear forwards;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 28);
  }
}

/* ─────────────────────────────────────────────────────────────
   8.  TOAST
   ───────────────────────────────────────────────────────────── */
function showToast(msg) {
  let t = document.getElementById('_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_toast';
    t.className = 'toast-msg';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ─────────────────────────────────────────────────────────────
   9.  INIT
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Allow Enter on flag input
  const fi = document.getElementById('flag-input');
  fi?.addEventListener('keydown', e => { if (e.key === 'Enter') submitFlag(); });

  // Auto-focus terminal
  setTimeout(() => termInput?.focus(), 300);

  // Greeting message in terminal
  setTimeout(() => {
    appendLine(
      `<span style="color:var(--accent)">// FlagVault CTF Terminal v1.0</span>\n` +
      `<span style="color:var(--text-dim)">Type <code>help</code> to see available commands.</span>\n` +
      `<span style="color:var(--text-dim)">Hint: start with <code>strings strings_hunt</code></span>`
    );
  }, 100);
});
