import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN, // Upstash Redis requires a token
});

export const publishMessage = async (channel, message) => {
  try {
    await redis.publish(channel, JSON.stringify(message));
    console.log(`Published to channel ${channel}:`, message);
  } catch (error) {
    console.error(`Error publishing to channel ${channel}:`, error);
  }
};

// Note: Subscribing directly in a serverless environment (like Next.js API routes)
// is generally not recommended for long-lived connections. This helper is more
// suitable for a dedicated signaling server or for testing purposes.
export const subscribeToChannel = async (channel, callback) => {
  // In a real-world Next.js app, you'd typically use a dedicated WebSocket server
  // (like the signaling server mentioned in the project vision) for Pub/Sub.
  // This is a simplified example for demonstration or specific server-side tasks.
  console.warn(
    'Subscribing to Redis channels directly in Next.js API routes is not recommended for long-lived connections.'
  );
  console.warn(
    'Consider using a dedicated signaling server for real-time Pub/Sub functionality.'
  );

  // This part would typically involve creating a new Redis client for subscription
  // as a single client cannot be used for both publishing and subscribing simultaneously
  // in a blocking manner. Upstash Redis client might handle this differently or
  // require a separate instance for subscription if it's a blocking operation.
  // For now, we'll just log a message.
  console.log(`Attempting to subscribe to channel: ${channel}`);
  // Example of how you might listen if Upstash Redis supported direct blocking subscribe
  // const subscriber = new Redis({ url: process.env.REDIS_URL, token: process.env.REDIS_TOKEN });
  // subscriber.subscribe(channel, (message) => {
  //   callback(JSON.parse(message));
  // });
};

export default redis;
