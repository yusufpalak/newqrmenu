import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  TranslationRequestEntityType,
  TranslationRequestStatus,
} from '../../common/enums/translation-request.enums';

export class CreateTranslationRequestDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  @IsNotEmpty()
  targetLocale!: string;

  @IsEnum(TranslationRequestEntityType)
  entityType!: TranslationRequestEntityType;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  price?: number;
}

export class UpdateTranslationRequestDto {
  @IsOptional()
  @IsEnum(TranslationRequestStatus)
  status?: TranslationRequestStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  price?: number;
}
