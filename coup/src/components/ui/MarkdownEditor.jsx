import React, { useState } from 'react';
import { Textarea } from './textarea'; // Reusing our custom Textarea
import { Button } from './button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MarkdownEditor.module.css';

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Markdown 형식으로 내용을 입력하세요.",
  minHeight = "200px",
}) {
  const [view, setView] = useState('write'); // 'write' or 'preview'

  return (
    <div className={styles.markdownEditorContainer}>
      <div className={styles.toolbar}>
        <Button
          size="small"
          variant={view === 'write' ? 'primary' : 'outline'}
          onClick={() => setView('write')}
        >
          작성
        </Button>
        <Button
          size="small"
          variant={view === 'preview' ? 'primary' : 'outline'}
          onClick={() => setView('preview')}
        >
          미리보기
        </Button>
      </div>
      {view === 'write' ? (
        <Textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ minHeight: minHeight }}
          className={styles.editorTextarea}
        />
      ) : (
        <div className={styles.previewArea} style={{ minHeight: minHeight }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
