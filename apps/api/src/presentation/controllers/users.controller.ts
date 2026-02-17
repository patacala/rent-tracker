import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserUseCase } from '@application/use-cases/create-user.use-case';
import { CreateUserDto } from '@application/dto';
import type { ApiResponse as ApiRes, CreateUserResponse } from '@rent-tracker/types';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly createUser: CreateUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() dto: CreateUserDto): Promise<ApiRes<CreateUserResponse>> {
    const { user } = await this.createUser.execute(dto);
    return {
      success: true,
      data: { user },
      message: 'User created successfully',
    };
  }
}
