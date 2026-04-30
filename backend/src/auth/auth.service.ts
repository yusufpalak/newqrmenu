import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '../common/enums/role.enum';
import { IJwtPayload } from '../common/interfaces/jwt-payload.interface';

export interface IAuthResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    tenantId: string | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<IAuthResult> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.buildAuth(user);
  }

  async register(dto: RegisterDto): Promise<IAuthResult> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: hash,
      name: dto.name,
      role: dto.role ?? Role.USER,
      tenantId: dto.tenantId ?? null,
      isActive: true,
    });
    const saved = await this.userRepo.save(user);
    return this.buildAuth(saved);
  }

  async getMe(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { tenant: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...safeUser } = user;
    return safeUser as Omit<User, 'password'>;
  }

  private buildAuth(user: User): IAuthResult {
    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
