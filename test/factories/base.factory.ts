import { PrismaService } from 'nestjs-prisma';

/**
 * T = The Entity Type (e.g., User)
 * I = The Create Input Type (e.g., Prisma.UserCreateInput)
 */
export abstract class BaseFactory<T, I> {
  protected abstract get model(): any;

  constructor(protected prisma: PrismaService) {}

  abstract definition(): I;

  make(overrides: Partial<I> = {}): I {
    return {
      ...this.definition(),
      ...overrides,
    };
  }

  makeMany(count: number, overrides: Partial<I> = {}): I[] {
    return Array.from({ length: count }).map(() => this.make(overrides));
  }

  async create(overrides: Partial<I> = {}): Promise<T> {
    const data = this.make(overrides);
    return this.model.create({ data });
  }

  async createMany(count: number, overrides: Partial<I> = {}): Promise<T[]> {
    const data = this.makeMany(count, overrides);
    return this.model.createMany({ data });
  }
}
