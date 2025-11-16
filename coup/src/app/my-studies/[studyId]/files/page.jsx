// 내 스터디 파일 관리 페이지
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { studyFilesData } from '@/mocks/studyFiles';

export default function MyStudyFilesPage({ params }) {
  const router = useRouter();
  const { studyId } = params;
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(['루트']);
  const [activeFilter, setActiveFilter] = useState('전체');

  const data = studyFilesData[studyId] || studyFilesData[1];
  const { study, folders, files } = data;

  const tabs = [
    { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
    { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
    { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
    { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
    { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
    { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
    { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
    { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️' },
  ];

  const getFileIcon = (type) => {
    const icons = {
      pdf: '📄',
      image: '🖼️',
      spreadsheet: '📊',
      document: '📝',
      archive: '📦',
      video: '🎬',
      audio: '🎵',
      code: '💻',
    };
    return icons[type] || '📄';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  };

  const handleFileUpload = (files) => {
    console.log('Uploading files:', files);
    // TODO: 실제 업로드 로직
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((f) => f.id));
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.push('/my-studies')} className={styles.backButton}>
          ← 내 스터디 목록
        </button>

        <div className={styles.studyHeader}>
          <div className={styles.studyInfo}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <h1 className={styles.studyName}>{study.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`${styles.tab} ${tab.label === '파일' ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 파일 목록 */}
        <div className={styles.fileSection}>
          {/* 파일 헤더 */}
          <div className={styles.fileHeader}>
            <h2 className={styles.fileTitle}>📁 파일 관리</h2>
            <button
              className={styles.uploadButton}
              onClick={() => fileInputRef.current?.click()}
            >
              ⬆️ 파일 업로드
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
            />
          </div>

          {/* 필터 탭 */}
          <div className={styles.filterSection}>
            <div className={styles.filterTabs}>
              {['전체', '문서', '이미지', '압축', '기타'].map((filter) => (
                <button
                  key={filter}
                  className={`${styles.filterTab} ${
                    activeFilter === filter ? styles.active : ''
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="파일명, 업로더 검색..."
              className={styles.searchInput}
            />
          </div>

          {/* 경로 네비게이션 */}
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbLabel}>📂 경로:</span>
            {currentPath.map((path, index) => (
              <span key={index} className={styles.breadcrumbItem}>
                <button className={styles.breadcrumbLink}>{path}</button>
                {index < currentPath.length - 1 && (
                  <span className={styles.breadcrumbSeparator}>›</span>
                )}
              </span>
            ))}
          </div>

          {/* 드래그 앤 드롭 영역 */}
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.dropZoneContent}>
              <span className={styles.dropZoneIcon}>⬆️</span>
              <p className={styles.dropZoneText}>
                {isDragging ? '파일을 놓으세요' : '파일을 드래그하거나 클릭하세요'}
              </p>
              <p className={styles.dropZoneHint}>
                지원 형식: 모든 파일 (최대 50MB) · 한 번에 최대 10개
              </p>
            </div>
          </div>

          {/* 폴더 목록 */}
          {folders.length > 0 && (
            <div className={styles.folderSection}>
              <h3 className={styles.sectionLabel}>📂 폴더 ({folders.length})</h3>
              <div className={styles.folderGrid}>
                {folders.map((folder) => (
                  <div key={folder.id} className={styles.folderCard}>
                    <div className={styles.folderIcon}>📁</div>
                    <div className={styles.folderInfo}>
                      <h4 className={styles.folderName}>{folder.name}</h4>
                      <p className={styles.folderMeta}>
                        {folder.fileCount}개 · {folder.size}
                      </p>
                    </div>
                    <button className={styles.folderOpenBtn}>열기</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 파일 목록 */}
          <div className={styles.fileListSection}>
            <div className={styles.fileListHeader}>
              <h3 className={styles.sectionLabel}>📄 파일 ({files.length})</h3>
              <button className={styles.newFolderBtn}>+ 새 폴더</button>
            </div>

            {/* 테이블 헤더 */}
            <div className={styles.tableHeader}>
              <div className={styles.tableCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedFiles.length === files.length}
                  onChange={handleSelectAll}
                />
              </div>
              <div className={styles.tableName}>이름</div>
              <div className={styles.tableSize}>크기</div>
              <div className={styles.tableUploader}>업로더</div>
              <div className={styles.tableDate}>날짜</div>
              <div className={styles.tableActions}>액션</div>
            </div>

            {/* 파일 행 */}
            {files.map((file) => (
              <div key={file.id} className={styles.fileRow}>
                <div className={styles.fileCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleFileSelect(file.id)}
                  />
                </div>
                <div className={styles.fileName}>
                  <span className={styles.fileIcon}>{getFileIcon(file.type)}</span>
                  <div className={styles.fileNameText}>
                    <span className={styles.fileNameMain}>{file.name}</span>
                    <span className={styles.fileDownloads}>⬇ {file.downloads}회</span>
                  </div>
                </div>
                <div className={styles.fileSize}>{file.size}</div>
                <div className={styles.fileUploader}>
                  {file.uploader.name}({file.uploader.role})
                </div>
                <div className={styles.fileDate}>{file.uploadedAt}</div>
                <div className={styles.fileActions}>
                  <button className={styles.actionBtn}>다운로드</button>
                  <button className={styles.actionBtn}>공유</button>
                  {study.role !== 'MEMBER' && (
                    <button className={styles.actionBtn}>삭제</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 선택된 파일 액션 */}
          {selectedFiles.length > 0 && (
            <div className={styles.selectedActions}>
              <span className={styles.selectedCount}>
                선택된 파일 ({selectedFiles.length}개):
              </span>
              <button className={styles.bulkActionBtn}>일괄 다운로드</button>
              <button className={styles.bulkActionBtn}>이동</button>
              <button className={styles.bulkActionBtn}>삭제</button>
            </div>
          )}
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 저장 공간 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>💾 저장 공간</h3>
            <div className={styles.widgetContent}>
              <div className={styles.storageInfo}>
                <span className={styles.storageText}>128MB / 2GB</span>
                <span className={styles.storagePercent}>6%</span>
              </div>
              <div className={styles.storageBar}>
                <div className={styles.storageBarFill} style={{ width: '6%' }}></div>
              </div>
              <p className={styles.storageHint}>1.87GB 남음</p>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
            <div className={styles.widgetActions}>
              <button
                className={styles.widgetButton}
                onClick={() => fileInputRef.current?.click()}
              >
                📤 업로드
              </button>
              <button className={styles.widgetButton}>📁 새 폴더</button>
              <button className={styles.widgetButton}>🔗 공유 링크</button>
              <button className={styles.widgetButton}>📊 통계</button>
            </div>
          </div>

          {/* 통계 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 파일 통계</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>전체 파일:</span>
                <span className={styles.statValue}>48개</span>
              </div>
              <div className={styles.statRow}>
                <span>폴더:</span>
                <span>5개</span>
              </div>
              <div className={styles.statRow}>
                <span>이번 주 업로드:</span>
                <span className={styles.statValue}>8개</span>
              </div>
              <div className={styles.statRow}>
                <span>총 다운로드:</span>
                <span>243회</span>
              </div>
            </div>
          </div>

          {/* 최근 파일 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📁 최근 파일</h3>
            <div className={styles.widgetContent}>
              {files.slice(0, 3).map((file) => (
                <div key={file.id} className={styles.recentFile}>
                  <span className={styles.recentFileIcon}>{getFileIcon(file.type)}</span>
                  <div className={styles.recentFileInfo}>
                    <div className={styles.recentFileName}>{file.name}</div>
                    <div className={styles.recentFileTime}>{file.uploadedAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 파일 형식 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📎 파일 형식</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>PDF:</span>
                <span>18개</span>
              </div>
              <div className={styles.statRow}>
                <span>이미지:</span>
                <span>12개</span>
              </div>
              <div className={styles.statRow}>
                <span>문서:</span>
                <span>8개</span>
              </div>
              <div className={styles.statRow}>
                <span>압축:</span>
                <span>6개</span>
              </div>
              <div className={styles.statRow}>
                <span>기타:</span>
                <span>4개</span>
              </div>
            </div>
          </div>

          {/* 팁 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>💡 팁</h3>
            <div className={styles.widgetContent}>
              <p className={styles.tipText}>
                • 드래그&드롭으로 빠른 업로드
              </p>
              <p className={styles.tipText}>
                • 폴더로 파일 체계적 관리
              </p>
              <p className={styles.tipText}>
                • 공유 링크로 외부 공유 가능
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
