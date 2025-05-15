import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private client: RedisClientType;

  async keys(pattern: string) {
    const keys = await this.client.keys(pattern);
    return keys;
  }

  async get(key: string) {
    const value = await this.client.get(key);
    return value;
  }

  async set(key: string, value: string | number, ttl?: number) {
    await this.client.set(key, value);
    if (ttl) {
      await this.client.expire(key, ttl);
    }
  }
}
