import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  findAll(): Promise<Currency[]> {
    return this.currencyRepo.find({ order: { code: 'ASC' } });
  }

  async findOne(id: string): Promise<Currency> {
    const c = await this.currencyRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Currency not found');
    return c;
  }

  async create(dto: CreateCurrencyDto): Promise<Currency> {
    const exists = await this.currencyRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new ConflictException('Currency code already exists');
    return this.currencyRepo.save(this.currencyRepo.create(dto));
  }

  async update(id: string, dto: UpdateCurrencyDto): Promise<Currency> {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.currencyRepo.save(c);
  }

  async remove(id: string): Promise<{ success: true }> {
    await this.findOne(id);
    await this.currencyRepo.delete(id);
    return { success: true };
  }
}
