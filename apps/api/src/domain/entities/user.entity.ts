// ─── Domain Entity: User ────────────────────
// Pure domain object — no framework dependencies

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return new UserEntity(
      params.id,
      params.email,
      params.name,
      params.createdAt,
      params.updatedAt,
    );
  }

  isValidEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }
}
