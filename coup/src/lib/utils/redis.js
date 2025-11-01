// C:/Project/CoUp/coup/src/lib/utils/redis.js

import { Redis } from '@upstash/redis'; // Upstash Redis 클라이언트를 사용한다고 가정

// 환경 변수에서 Redis URL을 가져옵니다.
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error('REDIS_URL is not defined in environment variables');
}

// Redis 클라이언트 인스턴스를 생성합니다.
// Upstash Redis를 사용하는 경우, Redis.fromEnv()를 사용할 수 있습니다.
// 다른 Redis 클라이언트 라이브러리를 사용하는 경우 해당 라이브러리의 초기화 방식을 따릅니다.
export const redis = new Redis({
  url: REDIS_URL,
  token: process.env.REDIS_TOKEN, // Upstash Redis의 경우 토큰이 필요할 수 있습니다.
});

// Pub/Sub 헬퍼 함수 (예시)
export const publishMessage = async (channel, message) => {
  try {
    await redis.publish(channel, JSON.stringify(message));
    console.log(`Message published to channel ${channel}:`, message);
  } catch (error) {
    console.error(`Failed to publish message to channel ${channel}:`, error);
    throw error;
  }
};

export const subscribeToChannel = async (channel, callback) => {
  // Redis Pub/Sub 구독은 일반적으로 별도의 클라이언트 인스턴스에서 처리됩니다.
  // Next.js 환경에서는 서버리스 함수나 별도의 백엔드 서비스에서 구독을 처리하는 것이 일반적입니다.
  // 여기서는 간단한 예시를 제공합니다. 실제 구현에서는 더 견고한 접근 방식이 필요합니다.
  const subscriber = new Redis({
    url: REDIS_URL,
    token: process.env.REDIS_TOKEN,
  });

  subscriber.subscribe(channel, (message) => {
    try {
      callback(JSON.parse(message));
    } catch (error) {
      console.error(`Failed to parse message from channel ${channel}:`, error);
    }
  });

  console.log(`Subscribed to channel ${channel}`);
  return subscriber; // 구독 해지를 위해 subscriber 인스턴스를 반환할 수 있습니다.
};

// Redis 연결 테스트 함수
export const testRedisConnection = async () => {
  try {
    await redis.ping();
    console.log('Redis connection successful!');
    return true;
  } catch (error) {
    console.error('Redis connection failed:', error);
    return false;
  }
};