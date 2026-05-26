import type { BaseRepository } from '../models/BaseRepository';
import type { DatabaseEntity } from '../types';

export abstract class BaseService<T extends DatabaseEntity, R extends BaseRepository<T>> {
  protected repository: R;

  constructor(repository: R) {
    this.repository = repository;
  }

  async getAll(limit: number = 100, offset: number = 0): Promise<T[]> {
    return this.repository.findAll(limit, offset);
  }

  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async getCount(): Promise<number> {
    return this.repository.count();
  }

  async validateId(id: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return entity;
  }

  abstract create(data: Omit<T, keyof DatabaseEntity>): Promise<T>;
  abstract update(id: string, data: Partial<Omit<T, keyof DatabaseEntity>>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}
