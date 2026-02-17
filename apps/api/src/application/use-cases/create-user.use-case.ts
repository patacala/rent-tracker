import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@domain/repositories';
import type { UserEntity } from '@domain/entities/user.entity';

export interface CreateUserInput {
  email: string;
  name?: string;
}

export interface CreateUserOutput {
  user: UserEntity;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const existing = await this.userRepository.findByEmail(input.email);

    if (existing) {
      throw new ConflictException(`User with email ${input.email} already exists`);
    }

    const user = await this.userRepository.create({
      email: input.email,
      name: input.name,
    });

    return { user };
  }
}
