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
}

export async function sendOrderEvent(payload) {
  await producer.send({
    topic: "orders",
    messages: [{ value: JSON.stringify(payload) }],
  });
}
