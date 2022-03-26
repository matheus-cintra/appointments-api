import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ValidateObjectId implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (ObjectId.isValid(value)) {
      if (String(new ObjectId(value)) === value) return value;
      throw new BadRequestException('Malformed ObjectId');
    }
    throw new BadRequestException('Malformed ObjectId');
  }
}
