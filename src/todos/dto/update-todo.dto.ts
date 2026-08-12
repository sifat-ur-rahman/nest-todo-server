import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoDto } from './create-todo.dto';

// All fields become optional — PATCH-friendly, same idea as
// spreading req.body over an existing doc in Express, but validated.
export class UpdateTodoDto extends PartialType(CreateTodoDto) {}
