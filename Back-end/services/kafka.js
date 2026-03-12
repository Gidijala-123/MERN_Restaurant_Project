import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "tasty-kitchen",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "tasty-kitchen-group" });

export async function initKafka() {
  await producer.connect();
  await consumer.connect();
  await subscribeToOrderTopic();
  console.log("[Kafka] Producer and Consumer initialized");
}

// Subscribe to order events and process them
export async function subscribeToOrderTopic() {
  await consumer.subscribe({ topic: "orders", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const orderData = JSON.parse(message.value.toString());
        console.log(`[Kafka] Order event received:`, orderData);

        // Process order event (e.g., update database, send notifications)
        // This is where you'd integrate with your order processing logic
        // Example: await saveOrderToDatabase(orderData);
        // Example: await sendOrderConfirmationEmail(orderData);
      } catch (error) {
        console.error("[Kafka] Error processing order event:", error);
      }
    },
  });

  console.log("[Kafka] Listening for order events on topic: orders");
}

export async function sendOrderEvent(orderData) {
  try {
    await producer.send({
      topic: "orders",
      messages: [
        {
          key: orderData.orderId || String(Date.now()),
          value: JSON.stringify({
            ...orderData,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`[Kafka] Order event sent for order ${orderData.orderId}`);
  } catch (error) {
    console.error("[Kafka] Error sending order event:", error);
    throw error;
  }
}

export async function disconnectKafka() {
  await producer.disconnect();
  await consumer.disconnect();
  console.log("[Kafka] Disconnected");
}
