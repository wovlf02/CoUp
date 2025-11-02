import styles from './VideoGrid.module.css';

export default function VideoGrid({ participants }) {
  return (
    <div className={styles.videoGridContainer}>
      {participants.map((participant) => (
        <div key={participant.id} className={styles.videoTile}>
          {/* Placeholder for video stream */}
          <p>{participant.name}</p>
          {/* TODO: Integrate actual video streams */}
        </div>
      ))}
    </div>
  );
}