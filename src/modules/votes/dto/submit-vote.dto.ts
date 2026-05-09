import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SubmitVoteDto {
  @IsUUID()
  questionId: string;

  @IsUUID()
  optionId: string;

  @IsOptional()
  demographics?: Record<string, unknown>;
}
