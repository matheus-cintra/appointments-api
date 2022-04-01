import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Producer } from 'sqs-producer';

const producerNotification = Producer.create({
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/769357066027/appointments',
  region: 'us-east-1',
});

const producerEmail = Producer.create({
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/769357066027/email',
  region: 'us-east-1',
});

@Injectable()
export class SqsService {
  async notificate(data: any) {
    await producerNotification.send([
      {
        id: randomUUID(),
        body: JSON.stringify(data),
      },
    ]);

    return;
  }

  async sendEmail(data: any) {
    await producerEmail.send([
      {
        id: randomUUID(),
        body: JSON.stringify(data),
      },
    ]);

    return;
  }
}
