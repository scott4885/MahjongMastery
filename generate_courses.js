const fs = require('fs');
const path = require('path');

const courses = [
  {
    src: 'free_tile_guide.md',
    dest: 'courses/free-tile-guide.html',
    price: 'FREE',
    insertions: {
      'CHAPTER 3: TILE SIZE & READABILITY': `
<div class="practice-box">
  <h3>Practice Scenario: Tile Readability Check</h3>
  <p>You’re shopping online and can’t hold the tiles. Choose one set to test:</p>
  <ul>
    <li>Set A: Standard size, decorative fonts, muted colors</li>
    <li>Set B: Oversized, high-contrast numbers and suits</li>
  </ul>
  <p><strong>Answer:</strong> Set B. Readability beats decoration for beginners—especially if anyone is 55+ or plays in mixed lighting.</p>
</div>
      `.trim()
    }
  },
  {
    src: 'mahjong_101_guide.md',
    dest: 'courses/mahjong-101.html',
    price: '$37',
    insertions: {
      'CHAPTER 6: THE CHARLESTON (STEP-BY-STEP)': `
<div class="practice-box">
  <h3>Practice Scenario: Charleston Decision</h3>
  <p>You have: 2-2-2 Dots, 6-7-8 Bams, North, Red Dragon, Joker.</p>
  <p><strong>Question:</strong> Which three tiles do you pass on Pass 1 (Right)?</p>
  <p><strong>Answer:</strong> Pass North, Red Dragon, and 6 Bam. Keep the pung of 2 Dots and the 7-8 Bam run potential. Keep the joker.</p>
</div>
      `.trim()
    }
  },
  {
    src: 'winning_quick_guide.md',
    dest: 'courses/winning-quick.html',
    price: '$27',
    insertions: {
      'CHAPTER 7: HOW TO KNOW YOU\'RE ON THE WRONG HAND': `
<div class="practice-box">
  <h3>Practice Scenario: Pivot or Commit?</h3>
  <p>Turn 13. You have one completed pung, but your needed tiles have been discarded 3+ times.</p>
  <p><strong>Question:</strong> Do you pivot or commit?</p>
  <p><strong>Answer:</strong> Pivot. If the table is burning your tiles, your hand is dying—switch to a simpler, more available hand.</p>
</div>
      `.trim()
    }
  },
  {
    src: 'mahjong_201_guide.md',
    dest: 'courses/mahjong-201.html',
    price: '$67',
    insertions: {}
  },
  {
    src: 'mahjong_301_guide (1).md',
    dest: 'courses/mahjong-301.html',
    price: '$97',
    insertions: {}
  }
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineFormat(text) {
  let t = escapeHtml(text);
  // bold
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // inline code
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}

function splitRow(line) {
  const trimmed = line.trim();
  const raw = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  return raw.split('|').map(cell => cell.trim());
}

function isTableSeparator(line) {
  return /^\|?\s*[-:]+\s*(\|\s*[-:]+\s*)+\|?$/.test(line.trim());
}

function parseMarkdown(md, insertions = {}) {
  const lines = md.split(/\r?\n/);

  let title = 'Mahjong Mastery Course';
  let subtitle = '';
  let tagline = '';

  // Extract first H1, H2, H3 as cover content
  let idx = 0;
  while (idx < lines.length) {
    const line = lines[idx].trim();
    if (line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '').trim();
      lines[idx] = '';
      idx++;
      break;
    }
    idx++;
  }
  idx = 0;
  while (idx < lines.length) {
    const line = lines[idx].trim();
    if (line.startsWith('## ')) {
      subtitle = line.replace(/^##\s+/, '').trim();
      lines[idx] = '';
      idx++;
      break;
    }
    idx++;
  }
  idx = 0;
  while (idx < lines.length) {
    const line = lines[idx].trim();
    if (line.startsWith('### ')) {
      tagline = line.replace(/^###\s+/, '').trim();
      lines[idx] = '';
      idx++;
      break;
    }
    idx++;
  }

  let html = '';
  let toc = [];
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let inSection = false;
  let inPracticeBox = false;
  let practiceLevel = 0;

  const closeLists = () => {
    if (inUl) { html += '</ul>\n'; inUl = false; }
    if (inOl) { html += '</ol>\n'; inOl = false; }
  };

  const closePractice = () => {
    if (inPracticeBox) {
      html += '</div>\n';
      inPracticeBox = false;
      practiceLevel = 0;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (!inCode) {
        closeLists();
        closePractice();
        html += '<pre><code>';
        inCode = true;
      } else {
        html += '</code></pre>\n';
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      html += escapeHtml(line) + '\n';
      continue;
    }

    // Table detection
    const nextLine = (i + 1 < lines.length) ? lines[i + 1] : '';
    if (trimmed.includes('|') && isTableSeparator(nextLine)) {
      closeLists();
      closePractice();
      const headers = splitRow(trimmed);
      i += 1; // skip separator
      let rows = [];
      while (i + 1 < lines.length) {
        const rowLine = lines[i + 1];
        if (!rowLine.trim() || !rowLine.includes('|')) break;
        rows.push(splitRow(rowLine));
        i += 1;
      }
      html += '<div class="table-wrap"><table>\n<thead><tr>' + headers.map(h => `<th>${inlineFormat(h)}</th>`).join('') + '</tr></thead>\n<tbody>';
      rows.forEach(r => {
        html += '<tr>' + r.map(c => `<td>${inlineFormat(c)}</td>`).join('') + '</tr>';
      });
      html += '</tbody></table></div>\n';
      continue;
    }

    if (!trimmed) {
      closeLists();
      // do not close practice box here; allow multi-paragraph boxes
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      closeLists();

      if (inPracticeBox && level <= practiceLevel) {
        closePractice();
      }

      if (level === 2) {
        if (inSection) {
          closePractice();
          html += '</section>\n';
        }
        const slug = slugify(text);
        toc.push({ text, slug });
        html += `<section class="chapter" id="${slug}">\n`;
        html += `<h2><span class="tile-icon">🀄</span>${inlineFormat(text)}</h2>\n`;
        if (insertions[text]) {
          html += insertions[text] + '\n';
        }
        inSection = true;
        continue;
      }

      if (level >= 3) {
        const isScenario = /scenario|practice|quick test/i.test(text);
        if (isScenario) {
          closePractice();
          html += '<div class="practice-box">\n';
          inPracticeBox = true;
          practiceLevel = level;
        }
        html += `<h${level}><span class="tile-icon">🀄</span>${inlineFormat(text)}</h${level}>\n`;
        continue;
      }

      // h1 not expected in body
      html += `<h${level}>${inlineFormat(text)}</h${level}>\n`;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      closeLists();
      html += '<hr class="divider" />\n';
      continue;
    }

    // Lists
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

    if (ulMatch) {
      if (inOl) { html += '</ol>\n'; inOl = false; }
      if (!inUl) { html += '<ul>\n'; inUl = true; }
      let item = ulMatch[1];
      item = item.replace(/^\[ \]\s*/, '☐ ')
                 .replace(/^\[x\]\s*/i, '☑ ');
      html += `<li>${inlineFormat(item)}</li>\n`;
      continue;
    }

    if (olMatch) {
      if (inUl) { html += '</ul>\n'; inUl = false; }
      if (!inOl) { html += '<ol>\n'; inOl = true; }
      html += `<li>${inlineFormat(olMatch[2])}</li>\n`;
      continue;
    }

    // Key takeaways / pull quotes
    if (trimmed.startsWith('**')) {
      html += `<div class="key-takeaway">${inlineFormat(trimmed)}</div>\n`;
      continue;
    }

    // Paragraph
    html += `<p>${inlineFormat(trimmed)}</p>\n`;
  }

  closeLists();
  closePractice();
  if (inSection) html += '</section>\n';

  return { title, subtitle, tagline, toc, content: html };
}

function renderHtml({ title, subtitle, tagline, toc, content, price }) {
  const tocHtml = toc.map(item => `<li><a href="#${item.slug}">${inlineFormat(item.text)}</a></li>`).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} | Mahjong Mastery</title>
<style>
  :root {
    --cream: #FAF7F2;
    --rose: #D4A5A5;
    --sage: #A8B5A0;
    --ink: #2f2f2f;
    --accent: #7b5b5b;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Georgia", "Times New Roman", serif;
    color: var(--ink);
    background: var(--cream);
    line-height: 1.6;
  }
  .page {
    max-width: 860px;
    margin: 0 auto;
    padding: 64px 64px 96px;
    background: var(--cream);
  }
  .cover {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(160deg, #FAF7F2 0%, #F5ECE8 55%, #E9D8D6 100%);
    border-bottom: 8px solid var(--sage);
  }
  .cover .title {
    font-size: 52px;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .cover .subtitle {
    font-size: 24px;
    margin-bottom: 8px;
    color: var(--accent);
  }
  .cover .tagline {
    font-size: 18px;
    margin-bottom: 24px;
  }
  .cover .author {
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--sage);
  }
  .cover .price {
    margin-top: 12px;
    font-size: 16px;
    letter-spacing: 1px;
    color: var(--accent);
  }
  .tile-art {
    display: flex;
    gap: 24px;
    margin: 32px 0;
  }
  .tile-svg {
    width: 70px;
    height: 90px;
    border-radius: 10px;
    background: #fff;
    border: 2px solid var(--sage);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    padding: 8px;
  }
  h1, h2, h3, h4 {
    font-family: "Palatino Linotype", "Book Antiqua", serif;
    color: #3b2f2f;
  }
  h2 {
    font-size: 28px;
    margin-top: 40px;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--rose);
  }
  h3 {
    font-size: 20px;
    margin-top: 24px;
  }
  .tile-icon { margin-right: 8px; }
  .divider {
    border: none;
    border-top: 2px solid var(--sage);
    margin: 24px 0;
  }
  .toc {
    margin: 24px 0 48px;
    padding: 24px;
    background: #fff;
    border: 1px solid var(--rose);
    border-radius: 12px;
  }
  .toc h2 { margin-top: 0; }
  .toc ul { list-style: none; padding-left: 0; }
  .toc li { margin: 6px 0; }
  .toc a { color: var(--accent); text-decoration: none; }
  .toc a:hover { text-decoration: underline; }

  ul, ol { padding-left: 24px; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 8px 10px;
    text-align: left;
  }
  th { background: #f2ece8; }
  .table-wrap { margin: 16px 0; overflow-x: auto; }

  .key-takeaway {
    background: #f8e9e9;
    border-left: 4px solid var(--rose);
    padding: 12px 16px;
    margin: 16px 0;
    font-style: italic;
  }
  .practice-box {
    border: 2px solid var(--sage);
    background: #fff;
    padding: 16px 18px;
    margin: 18px 0;
    border-radius: 10px;
  }

  footer.footer {
    position: fixed;
    bottom: 16px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 12px;
    color: #666;
  }
  .page-number:before { content: counter(page); }

  @media print {
    body { background: #fff; color: #000; }
    .page { background: #fff; padding: 32px; }
    .cover { background: #fff; border: none; }
    .tile-art, .tile-svg { display: none !important; }
    a { color: #000; text-decoration: none; }
    .chapter { break-before: page; }
    .chapter:first-of-type { break-before: auto; }
    .toc { page-break-after: always; }
  }
</style>
</head>
<body>
  <section class="cover page">
    <div class="tile-art">
      <div class="tile-svg">${bambooSvg()}</div>
      <div class="tile-svg">${flowerSvg()}</div>
      <div class="tile-svg">${birdSvg()}</div>
    </div>
    <div class="title">${escapeHtml(title)}</div>
    <div class="subtitle">${escapeHtml(subtitle)}</div>
    ${tagline ? `<div class="tagline">${escapeHtml(tagline)}</div>` : ''}
    <div class="author">By Mahjong Mastery</div>
    ${price ? `<div class="price">${escapeHtml(price)}</div>` : ''}
  </section>

  <section class="page">
    <div class="toc">
      <h2>Table of Contents</h2>
      <ul>${tocHtml}</ul>
    </div>
    ${content}
  </section>

  <footer class="footer">© 2026 MahjongMastery • www.MahjongMastery.com • Page <span class="page-number"></span></footer>
</body>
</html>`;
}

function bambooSvg() {
  return `
<svg viewBox="0 0 80 110" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="8" width="64" height="94" rx="8" fill="#fefdfb" stroke="#A8B5A0" stroke-width="2"/>
  <rect x="24" y="18" width="10" height="70" rx="4" fill="#A8B5A0"/>
  <rect x="46" y="18" width="10" height="70" rx="4" fill="#A8B5A0"/>
  <circle cx="29" cy="40" r="3" fill="#D4A5A5"/>
  <circle cx="51" cy="60" r="3" fill="#D4A5A5"/>
</svg>`;
}

function flowerSvg() {
  return `
<svg viewBox="0 0 80 110" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="8" width="64" height="94" rx="8" fill="#fefdfb" stroke="#D4A5A5" stroke-width="2"/>
  <circle cx="40" cy="48" r="10" fill="#D4A5A5"/>
  <circle cx="30" cy="40" r="8" fill="#F2D0D0"/>
  <circle cx="50" cy="40" r="8" fill="#F2D0D0"/>
  <circle cx="30" cy="56" r="8" fill="#F2D0D0"/>
  <circle cx="50" cy="56" r="8" fill="#F2D0D0"/>
  <rect x="37" y="60" width="6" height="24" fill="#A8B5A0"/>
</svg>`;
}

function birdSvg() {
  return `
<svg viewBox="0 0 80 110" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="8" width="64" height="94" rx="8" fill="#fefdfb" stroke="#A8B5A0" stroke-width="2"/>
  <path d="M24 70 C34 50, 50 50, 58 68" fill="none" stroke="#A8B5A0" stroke-width="4"/>
  <circle cx="34" cy="54" r="6" fill="#D4A5A5"/>
  <circle cx="48" cy="54" r="6" fill="#D4A5A5"/>
  <circle cx="30" cy="54" r="2" fill="#3b2f2f"/>
</svg>`;
}

const baseDir = '/home/scott/.openclaw/workspace/MahjongMastery';

courses.forEach(course => {
  const srcPath = path.join(baseDir, 'content', course.src);
  const destPath = path.join(baseDir, course.dest);
  const md = fs.readFileSync(srcPath, 'utf8');
  const parsed = parseMarkdown(md, course.insertions);
  const html = renderHtml({
    title: parsed.title,
    subtitle: parsed.subtitle,
    tagline: parsed.tagline,
    toc: parsed.toc,
    content: parsed.content,
    price: course.price
  });
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, html, 'utf8');
  console.log('Generated', destPath);
});
