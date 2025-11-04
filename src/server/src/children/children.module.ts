import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { Child, ChildSchema } from './entities/child.entity';
import { Family, FamilySchema } from '../families/entities/family.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Child.name, schema: ChildSchema },
      { name: Family.name, schema: FamilySchema },
    ]),
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
