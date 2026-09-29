// M&A Handbook Core Application Logic

(function() {
  const chapters = window.HANDBOOK_CHAPTERS || [];
  let currentChapterIndex = 0;
  let isNoteDrawerOpen = false;
  let activeTab = 'edit'; // 'edit' or 'preview'
  let searchResults = [];

  // DOM Elements
  const elements = {
    chapterList: document.getElementById('chapter-list'),
    chapterTitle: document.getElementById('chapter-title'),
    chapterDesc: document.getElementById('chapter-desc'),
    chapterMeta: document.getElementById('chapter-meta'),
    contentArea: document.getElementById('content-area'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    prevBtn: document.getElementById('prev-chapter-btn'),
    nextBtn: document.getElementById('next-chapter-btn'),
    markCompleteBtn: document.getElementById('mark-complete-btn'),
    noteTextarea: document.getElementById('note-textarea'),
    notePreview: document.getElementById('note-preview'),
    noteStatus: document.getElementById('note-status'),
    noteDrawer: document.getElementById('note-drawer'),
    noteCharCount: document.getElementById('note-char-count'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIcon: document.getElementById('theme-icon'),
    fontSizeSelect: document.getElementById('font-size-select'),
    searchModal: document.getElementById('search-modal'),
    searchInput: document.getElementById('search-input'),
    searchResultsContainer: document.getElementById('search-results'),
    selectionTooltip: document.getElementById('selection-tooltip'),
    tocContainer: document.getElementById('toc-container'),
    mobileMenu: document.getElementById('sidebar')
  };

  // 1. Initialize Settings
  function initSettings() {
    // Theme
    const savedTheme = localStorage.getItem('ma_handbook_theme') || 'parchment';
    setTheme(savedTheme);

    // Font size
    const savedFontSize = localStorage.getItem('ma_handbook_fontsize') || 'normal';
    setFontSize(savedFontSize);

    // Initial Chapter from Hash or Default
    const hash = window.location.hash.replace('#', '');
    const foundIndex = chapters.findIndex(c => c.id === hash);
    if (foundIndex >= 0) {
      currentChapterIndex = foundIndex;
    }
  }

  // Set Theme
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ma_handbook_theme', theme);
    if (elements.themeIcon) {
      if (theme === 'dark') {
        elements.themeIcon.textContent = '🌙';
      } else if (theme === 'parchment') {
        elements.themeIcon.textContent = '📜';
      } else {
        elements.themeIcon.textContent = '☀️';
      }
    }
  }

  // Set Font Size
  function setFontSize(size) {
    localStorage.setItem('ma_handbook_fontsize', size);
    if (elements.contentArea) {
      elements.contentArea.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
      if (size === 'small') elements.contentArea.classList.add('text-sm');
      else if (size === 'large') elements.contentArea.classList.add('text-lg');
      else if (size === 'xlarge') elements.contentArea.classList.add('text-xl');
      else elements.contentArea.classList.add('text-base');
    }
  }

  // 2. Render Sidebar
  function renderSidebar() {
    if (!elements.chapterList) return;
    elements.chapterList.innerHTML = '';

    const completed = getCompletedChapters();

    chapters.forEach((ch, idx) => {
      const isCurrent = idx === currentChapterIndex;
      const isDone = completed.includes(ch.id);

      const li = document.createElement('li');
      li.className = `group flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
        isCurrent
          ? 'bg-blue-900/10 text-blue-950 font-semibold dark:bg-sky-500/20 dark:text-sky-300'
          : 'hover:bg-slate-500/10 text-slate-700 dark:text-slate-300'
      }`;

      li.innerHTML = `
        <input type="checkbox" ${isDone ? 'checked' : ''} 
          class="chapter-checkbox mt-1 h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-600 cursor-pointer"
          data-id="${ch.id}" title="标记为已完成">
        <div class="flex-1 min-w-0" data-index="${idx}">
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            <span>第 ${idx.toString().padStart(2, '0')} 单元</span>
            <span>约 ${ch.readingTime} 分钟</span>
          </div>
          <div class="text-sm leading-snug truncate ${isDone ? 'line-through opacity-70' : ''}">${ch.title}</div>
        </div>
      `;

      // Checkbox event
      const checkbox = li.querySelector('.chapter-checkbox');
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleChapterComplete(ch.id, checkbox.checked);
      });

      // Chapter click
      li.querySelector('[data-index]').addEventListener('click', () => {
        loadChapter(idx);
        // Mobile auto-close
        if (window.innerWidth < 768 && elements.mobileMenu) {
          elements.mobileMenu.classList.add('-translate-x-full');
        }
      });

      elements.chapterList.appendChild(li);
    });

    updateProgress();
  }

  // Completed State Helpers
  function getCompletedChapters() {
    try {
      return JSON.parse(localStorage.getItem('ma_handbook_completed') || '[]');
    } catch {
      return [];
    }
  }

  function toggleChapterComplete(id, isDone) {
    let completed = getCompletedChapters();
    if (isDone && !completed.includes(id)) {
      completed.push(id);
    } else if (!isDone) {
      completed = completed.filter(item => item !== id);
    }
    localStorage.setItem('ma_handbook_completed', JSON.stringify(completed));
    renderSidebar();
    updateCompleteButton();
  }

  function updateProgress() {
    const completed = getCompletedChapters();
    const percent = Math.round((completed.length / chapters.length) * 100);
    if (elements.progressBar) elements.progressBar.style.width = `${percent}%`;
    if (elements.progressText) {
      elements.progressText.textContent = `已学 ${completed.length}/${chapters.length} 课 (${percent}%)`;
    }
  }

  function updateCompleteButton() {
    if (!elements.markCompleteBtn) return;
    const current = chapters[currentChapterIndex];
    const completed = getCompletedChapters();
    const isDone = completed.includes(current.id);
    if (isDone) {
      elements.markCompleteBtn.innerHTML = '✓ 本课已完成';
      elements.markCompleteBtn.classList.replace('bg-blue-800', 'bg-emerald-700');
    } else {
      elements.markCompleteBtn.innerHTML = '标记本课已完成并继续';
      elements.markCompleteBtn.classList.replace('bg-emerald-700', 'bg-blue-800');
    }
  }

  // 3. Load & Render Chapter
  function loadChapter(index) {
    if (index < 0 || index >= chapters.length) return;
    currentChapterIndex = index;
    const ch = chapters[index];
    window.location.hash = ch.id;

    // Header info
    if (elements.chapterTitle) elements.chapterTitle.textContent = ch.title;
    if (elements.chapterDesc) elements.chapterDesc.textContent = ch.desc;
    if (elements.chapterMeta) {
      elements.chapterMeta.innerHTML = `
        <span class="inline-flex items-center gap-1">⏱️ 预计阅读 ${ch.readingTime} 分钟</span>
        <span class="inline-flex items-center gap-1">📊 全文约 ${ch.charCount} 字</span>
        <span class="inline-flex items-center gap-1">📁 ${ch.filename}</span>
      `;
    }

    // Markdown parse & render
    if (elements.contentArea && window.marked) {
      // Configure marked
      window.marked.setOptions({
        gfm: true,
        breaks: true,
        highlight: function(code, lang) {
          if (lang === 'mermaid') {
            return `<div class="mermaid">${code}</div>`;
          }
          if (window.Prism && window.Prism.languages[lang]) {
            return window.Prism.highlight(code, window.Prism.languages[lang], lang);
          }
          return code;
        }
      });

      // Custom renderer for mermaid
      const renderer = new marked.Renderer();
      const defaultCode = renderer.code.bind(renderer);
      renderer.code = function(code, lang, escaped) {
        if (lang === 'mermaid') {
          return `<div class="mermaid">${code}</div>`;
        }
        return defaultCode(code, lang, escaped);
      };

      elements.contentArea.innerHTML = marked.parse(ch.content, { renderer });

      // Initialize Mermaid
      if (window.mermaid) {
        try {
          window.mermaid.run({
            nodes: document.querySelectorAll('.mermaid')
          });
        } catch (e) {
          console.warn('Mermaid render error:', e);
        }
      }

      // Syntax Highlight
      if (window.Prism) {
        window.Prism.highlightAllUnder(elements.contentArea);
      }
    }

    // Render TOC
    renderTOC();

    // Nav buttons
    if (elements.prevBtn) {
      elements.prevBtn.disabled = index === 0;
      elements.prevBtn.style.opacity = index === 0 ? '0.4' : '1';
    }
    if (elements.nextBtn) {
      elements.nextBtn.disabled = index === chapters.length - 1;
      elements.nextBtn.style.opacity = index === chapters.length - 1 ? '0.4' : '1';
    }

    // Update Note Drawer
    loadNoteForCurrentChapter();
    renderSidebar();
    updateCompleteButton();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 4. In-page Table of Contents
  function renderTOC() {
    if (!elements.tocContainer || !elements.contentArea) return;
    elements.tocContainer.innerHTML = '';

    const headings = elements.contentArea.querySelectorAll('h2, h3');
    if (headings.length === 0) {
      elements.tocContainer.parentElement.style.display = 'none';
      return;
    }
    elements.tocContainer.parentElement.style.display = 'block';

    const ul = document.createElement('ul');
    ul.className = 'space-y-1.5 text-xs text-slate-600 dark:text-slate-400';

    headings.forEach((heading, hIdx) => {
      const id = `heading-${hIdx}`;
      heading.id = id;
      const li = document.createElement('li');
      const isH3 = heading.tagName.toLowerCase() === 'h3';
      li.className = `${isH3 ? 'pl-3' : 'font-medium'} truncate`;

      const a = document.createElement('a');
      a.href = `#${id}`;
      a.className = 'hover:text-blue-800 dark:hover:text-sky-400 block transition-colors truncate';
      a.textContent = heading.textContent;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth' });
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    elements.tocContainer.appendChild(ul);
  }

  // 5. Notes System (LocalStorage)
  function getNoteKey(chId) {
    return `ma_handbook_note_${chId}`;
  }

  function loadNoteForCurrentChapter() {
    const ch = chapters[currentChapterIndex];
    if (!ch || !elements.noteTextarea) return;

    const savedNote = localStorage.getItem(getNoteKey(ch.id)) || '';
    elements.noteTextarea.value = savedNote;
    updateNoteCharCount();
    renderNotePreview();
    if (elements.noteStatus) elements.noteStatus.textContent = savedNote ? '✓ 已同步本地' : '尚未记录笔记';
  }

  let saveTimeout = null;
  function saveCurrentNote() {
    const ch = chapters[currentChapterIndex];
    if (!ch || !elements.noteTextarea) return;

    const note = elements.noteTextarea.value;
    localStorage.setItem(getNoteKey(ch.id), note);

    if (elements.noteStatus) {
      elements.noteStatus.textContent = '💾 正在保存...';
    }

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if (elements.noteStatus) {
        elements.noteStatus.textContent = '✓ 已自动保存到本地';
      }
    }, 400);

    updateNoteCharCount();
    renderNotePreview();
  }

  function updateNoteCharCount() {
    if (!elements.noteCharCount || !elements.noteTextarea) return;
    elements.noteCharCount.textContent = `${elements.noteTextarea.value.length} 字`;
  }

  function renderNotePreview() {
    if (!elements.notePreview || !elements.noteTextarea) return;
    if (window.marked) {
      elements.notePreview.innerHTML = marked.parse(elements.noteTextarea.value || '*暂无笔记内容，请在左侧编辑*');
    }
  }

  // Quick Insert Template
  function insertNoteSnippet(snippet) {
    if (!elements.noteTextarea) return;
    const pos = elements.noteTextarea.selectionStart;
    const val = elements.noteTextarea.value;
    elements.noteTextarea.value = val.substring(0, pos) + '\n' + snippet + '\n' + val.substring(pos);
    elements.noteTextarea.focus();
    saveCurrentNote();
  }

  // Export All Notes to Markdown
  function exportAllNotesMarkdown() {
    let combinedMd = `# 外资律所并购与资本市场学习手册 · 学习笔记汇总\n\n`;
    combinedMd += `> 导出时间：${new Date().toLocaleString()}\n`;
    combinedMd += `> 整理者：管贝嘉 (Beijia Guan)\n\n---\n\n`;

    let hasAnyNotes = false;

    chapters.forEach((ch, idx) => {
      const note = localStorage.getItem(getNoteKey(ch.id));
      if (note && note.trim().length > 0) {
        hasAnyNotes = true;
        combinedMd += `## 第 ${idx} 单元：${ch.title}\n\n`;
        combinedMd += `${note.trim()}\n\n---\n\n`;
      }
    });

    if (!hasAnyNotes) {
      alert('提示：您目前尚未在任何章节中记录笔记。在任意章节右侧或底部笔记栏输入内容后即可导出！');
      return;
    }

    downloadFile(combinedMd, '外资律所并购手册_学习笔记汇总.md', 'text/markdown;charset=utf-8');
  }

  // Export JSON Backup
  function exportNotesJSON() {
    const backup = {
      timestamp: new Date().toISOString(),
      completed: getCompletedChapters(),
      notes: {}
    };

    chapters.forEach(ch => {
      const note = localStorage.getItem(getNoteKey(ch.id));
      if (note) backup.notes[ch.id] = note;
    });

    downloadFile(JSON.stringify(backup, null, 2), 'ma_handbook_notes_backup.json', 'application/json');
  }

  // Import JSON Backup
  function importNotesJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.notes) {
            Object.keys(data.notes).forEach(k => {
              localStorage.setItem(getNoteKey(k), data.notes[k]);
            });
          }
          if (data.completed) {
            localStorage.setItem('ma_handbook_completed', JSON.stringify(data.completed));
          }
          alert('🎉 笔记与进度备份已成功恢复！');
          loadNoteForCurrentChapter();
          renderSidebar();
        } catch (err) {
          alert('导入失败：文件格式不符合 JSON 规范');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 6. Text Selection Floating Tooltip (一键摘录到笔记)
  function initTextSelection() {
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text.length > 3 && elements.contentArea.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (elements.selectionTooltip) {
          elements.selectionTooltip.style.display = 'block';
          elements.selectionTooltip.style.top = `${window.scrollY + rect.top - 42}px`;
          elements.selectionTooltip.style.left = `${window.scrollX + rect.left + rect.width / 2 - 60}px`;
          elements.selectionTooltip.onclick = () => {
            clipTextToNote(text);
            elements.selectionTooltip.style.display = 'none';
            selection.removeAllRanges();
          };
        }
      } else {
        if (elements.selectionTooltip) elements.selectionTooltip.style.display = 'none';
      }
    });
  }

  function clipTextToNote(text) {
    // Open drawer if closed
    if (!isNoteDrawerOpen) {
      toggleNoteDrawer(true);
    }
    const snippet = `> 📌 摘录：${text.replace(/\n+/g, ' ')}\n\n`;
    insertNoteSnippet(snippet);

    // Visual feedback
    if (elements.noteStatus) {
      elements.noteStatus.textContent = '📌 选中文本已摘录到笔记！';
    }
  }

  function toggleNoteDrawer(open) {
    isNoteDrawerOpen = typeof open === 'boolean' ? open : !isNoteDrawerOpen;
    if (elements.noteDrawer) {
      if (isNoteDrawerOpen) {
        elements.noteDrawer.classList.remove('translate-x-full');
      } else {
        elements.noteDrawer.classList.add('translate-x-full');
      }
    }
  }

  // 7. Global Search Modal (Ctrl/Cmd + K)
  function initSearch() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearchModal(true);
      }
      if (e.key === 'Escape') {
        toggleSearchModal(false);
      }
    });

    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        executeSearch(e.target.value.trim());
      });
    }
  }

  function toggleSearchModal(open) {
    if (!elements.searchModal) return;
    if (open) {
      elements.searchModal.classList.remove('hidden');
      elements.searchModal.classList.add('flex');
      if (elements.searchInput) {
        elements.searchInput.value = '';
        elements.searchInput.focus();
      }
      executeSearch('');
    } else {
      elements.searchModal.classList.add('hidden');
      elements.searchModal.classList.remove('flex');
    }
  }

  function executeSearch(query) {
    if (!elements.searchResultsContainer) return;
    elements.searchResultsContainer.innerHTML = '';

    if (!query) {
      elements.searchResultsContainer.innerHTML = `
        <div class="text-center py-8 text-slate-400 text-sm">
          输入关键词搜索 14 门课程的法律要点、法条与英文术语（如 “出资责任”、“质押”、“MAE”、“Clifford Chance”）
        </div>
      `;
      return;
    }

    const matches = [];
    const lowerQuery = query.toLowerCase();

    chapters.forEach((ch, idx) => {
      const content = ch.content;
      const lowerContent = content.toLowerCase();
      let pos = lowerContent.indexOf(lowerQuery);

      if (pos >= 0) {
        const start = Math.max(0, pos - 40);
        const end = Math.min(content.length, pos + 90);
        let snippet = content.substring(start, end).replace(/\n+/g, ' ');
        // Highlight keyword
        const regex = new RegExp(`(${query})`, 'gi');
        snippet = snippet.replace(regex, '<mark class="bg-yellow-200 text-slate-900 rounded px-0.5">$1</mark>');

        matches.push({
          chapterIndex: idx,
          chapterTitle: ch.title,
          snippet: snippet
        });
      }
    });

    if (matches.length === 0) {
      elements.searchResultsContainer.innerHTML = `
        <div class="text-center py-8 text-slate-400 text-sm">
          未检索到与 “<span class="text-slate-700 dark:text-slate-200 font-medium">${query}</span>” 相关的要点
        </div>
      `;
      return;
    }

    matches.forEach(m => {
      const item = document.createElement('div');
      item.className = 'p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors';
      item.innerHTML = `
        <div class="text-xs font-semibold text-blue-800 dark:text-sky-400 mb-1">${m.chapterTitle}</div>
        <div class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">...${m.snippet}...</div>
      `;
      item.addEventListener('click', () => {
        toggleSearchModal(false);
        loadChapter(m.chapterIndex);
      });
      elements.searchResultsContainer.appendChild(item);
    });
  }

  // 8. Event Bindings
  function bindEvents() {
    // Navigation
    if (elements.prevBtn) {
      elements.prevBtn.addEventListener('click', () => loadChapter(currentChapterIndex - 1));
    }
    if (elements.nextBtn) {
      elements.nextBtn.addEventListener('click', () => loadChapter(currentChapterIndex + 1));
    }
    if (elements.markCompleteBtn) {
      elements.markCompleteBtn.addEventListener('click', () => {
        const curId = chapters[currentChapterIndex].id;
        toggleChapterComplete(curId, true);
        if (currentChapterIndex < chapters.length - 1) {
          loadChapter(currentChapterIndex + 1);
        }
      });
    }

    // Notes
    if (elements.noteTextarea) {
      elements.noteTextarea.addEventListener('input', saveCurrentNote);
    }

    // Snippets
    document.querySelectorAll('[data-snippet]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-snippet');
        let text = '';
        if (type === 'points') text = `### 🎯 核心考点与规则速记\n- [ ] `;
        else if (type === 'law') text = `### 📜 关联现行法规与规定\n- 《》第 条：`;
        else if (type === 'en') text = `### 💼 专业英文/Clause 句式\n- **Clause:** \n- **Application:** `;
        else if (type === 'interview') text = `### ❓ 面试口述预演答题卡\n1. **Issue:** \n2. **Rule:** \n3. **Application:** \n4. **Conclusion:** `;
        insertNoteSnippet(text);
      });
    });

    // Note Tabs
    const tabEdit = document.getElementById('tab-edit-note');
    const tabPreview = document.getElementById('tab-preview-note');
    if (tabEdit && tabPreview) {
      tabEdit.addEventListener('click', () => {
        tabEdit.classList.add('border-blue-700', 'text-blue-700', 'font-semibold');
        tabPreview.classList.remove('border-blue-700', 'text-blue-700', 'font-semibold');
        elements.noteTextarea.classList.remove('hidden');
        elements.notePreview.classList.add('hidden');
      });
      tabPreview.addEventListener('click', () => {
        tabPreview.classList.add('border-blue-700', 'text-blue-700', 'font-semibold');
        tabEdit.classList.remove('border-blue-700', 'text-blue-700', 'font-semibold');
        elements.noteTextarea.classList.add('hidden');
        elements.notePreview.classList.remove('hidden');
        renderNotePreview();
      });
    }

    // Note Drawer toggles
    document.querySelectorAll('.toggle-note-drawer').forEach(btn => {
      btn.addEventListener('click', () => toggleNoteDrawer());
    });

    // Export / Import
    const btnExportMd = document.getElementById('btn-export-notes-md');
    if (btnExportMd) btnExportMd.addEventListener('click', exportAllNotesMarkdown);

    const btnExportJson = document.getElementById('btn-export-notes-json');
    if (btnExportJson) btnExportJson.addEventListener('click', exportNotesJSON);

    const btnImportJson = document.getElementById('btn-import-notes-json');
    if (btnImportJson) btnImportJson.addEventListener('click', importNotesJSON);

    // Theme Switch
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', () => {
        const current = localStorage.getItem('ma_handbook_theme') || 'parchment';
        const next = current === 'parchment' ? 'light' : current === 'light' ? 'dark' : 'parchment';
        setTheme(next);
      });
    }

    // Font size
    if (elements.fontSizeSelect) {
      elements.fontSizeSelect.addEventListener('change', (e) => {
        setFontSize(e.target.value);
      });
    }

    // Search triggers
    document.querySelectorAll('.open-search-modal').forEach(el => {
      el.addEventListener('click', () => toggleSearchModal(true));
    });
    const closeSearch = document.getElementById('close-search-modal');
    if (closeSearch) {
      closeSearch.addEventListener('click', () => toggleSearchModal(false));
    }

    // Mobile sidebar toggle
    const toggleMobileSidebar = document.getElementById('toggle-mobile-sidebar');
    if (toggleMobileSidebar && elements.mobileMenu) {
      toggleMobileSidebar.addEventListener('click', () => {
        elements.mobileMenu.classList.toggle('-translate-x-full');
      });
    }
  }

  // Init App
  function init() {
    initSettings();
    renderSidebar();
    loadChapter(currentChapterIndex);
    initTextSelection();
    initSearch();
    bindEvents();
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global helpers
  window.MAHandbookApp = {
    loadChapter,
    toggleNoteDrawer,
    exportAllNotesMarkdown
  };
})();
