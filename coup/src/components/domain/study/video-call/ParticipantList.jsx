import Image from "next/image";
import styles from './ParticipantList.module.css';

export default function ParticipantList({ participants }) {
  return (
    <div className={styles.participantListContainer}>
      <h3 className={styles.listTitle}>참여자 ({participants.length})</h3>
      <div className={styles.participantsList}>
        {participants.map((participant) => (
          <div key={participant.id} className={styles.participantItem}>
            <Image
              src={participant.imageUrl || "/next.svg"}
              alt={participant.name}
              width={32}
              height={32}
              className={styles.participantImage}
            />
            <span className={styles.participantName}>{participant.name}</span>
            {/* TODO: Add mic/camera status icons and mute button for host */}
          </div>
        ))}
      </div>
    </div>
  );
}