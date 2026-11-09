import { IsString, IsUUID, Length } from 'class-validator';

export class ChatDto {
  @IsUUID()
  conversaId!: string;

  @IsString()
  @Length(1, 500)
  mensagem!: string;
}
