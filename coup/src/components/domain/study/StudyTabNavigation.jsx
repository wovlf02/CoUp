import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import Link from "next/link";
import styles from './StudyTabNavigation.module.css';

export default function StudyTabNavigation({ studyId, activeTab }) {
  return (
    <Tabs value={activeTab} className={styles.studyTabNavigation}>
      <TabsList>
        <Link href={`/studies/${studyId}`} passHref>
          <TabsTrigger value="overview">개요</TabsTrigger>
        </Link>
        <Link href={`/studies/${studyId}/chat`} passHref>
          <TabsTrigger value="chat">채팅</TabsTrigger>
        </Link>
        <Link href={`/studies/${studyId}/notices`} passHref>
          <TabsTrigger value="notices">공지</TabsTrigger>
        </Link>
        <Link href={`/studies/${studyId}/files`} passHref>
          <TabsTrigger value="files">파일</TabsTrigger>
        </Link>
        <Link href={`/studies/${studyId}/calendar`} passHref>
          <TabsTrigger value="calendar">캘린더</TabsTrigger>
        </Link>
        <Link href={`/studies/${studyId}/tasks`} passHref>
          <TabsTrigger value="tasks">할 일</TabsTrigger>
        </Link>
        <Link href={`/studies/${studyId}/video-call`} passHref>
          <TabsTrigger value="video-call">화상 스터디</TabsTrigger>
        </Link>
        <Link href={`/studies/${studyId}/settings`} passHref>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  );
}