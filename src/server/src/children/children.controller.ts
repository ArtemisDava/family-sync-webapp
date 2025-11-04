import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  //only admin can access
  @Get()
  findAll() {
    return this.childrenService.findAll();
  }

  // only parent/guardian or admin can access everything below
  @Post()
  create(@Body() createChildDto: CreateChildDto) {
    return this.childrenService.create(createChildDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChildDto: UpdateChildDto) {
    return this.childrenService.update(id, updateChildDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.childrenService.remove(id);
  }

  // NICE TO HAVE

  // @Get(':id/age')
  // getAge(@Param('id') id: string) {
  //   return this.childrenService.getAge(id);
  // }

  // @Get('family/:familyId')
  // findByFamily(@Param('familyId') familyId: string) {
  //   return this.childrenService.findByFamily(familyId);
  // }
}
