import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { IUserRepository } from '@domain/repositories';
import { UserEntity } from '@domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toEntity(user) : null;
  }

  async create(params: { email: string; name?: string }): Promise<UserEntity> {
    const user = await this.prisma.user.create({ data: params });
    return this.toEntity(user);
  }

  async update(id: string, params: Partial<{ name: string }>): Promise<UserEntity> {
    const user = await this.prisma.user.update({ where: { id }, data: params });
    return this.toEntity(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toEntity(raw: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return UserEntity.create({
      id: raw.id,
      email: raw.email,
      name: raw.name ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
