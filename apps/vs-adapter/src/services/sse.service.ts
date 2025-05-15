import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseService {
  private clients = new Map<string, Subject<any>>();

  addClient(clientId: string) {
    const subject = new Subject();
    this.clients.set(clientId, subject);
    return subject;
  }

  removeClient(clientId: string) {
    const subject = this.clients.get(clientId);
    if (subject) {
      subject.complete();
      this.clients.delete(clientId);
    }
  }

  sendToClient(clientId: string, data: any) {
    const subject = this.clients.get(clientId);
    if (subject) {
      subject.next(data);
    }
  }
}
