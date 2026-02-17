import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID!,
  brokers: [process.env.KAFKA_BROKER!],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({
  groupId: "document-processor",
});

export const connectKafka = async () => {
  await producer.connect();
  console.log("Kafka producer connected");
};