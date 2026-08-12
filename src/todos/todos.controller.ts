import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  // POST /api/v1/todos
  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTodoDto) {
    return this.todosService.create(userId, dto);
  }

  // GET /api/v1/todos  -> "get user todos"
  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.todosService.findAllForUser(userId);
  }

  // GET /api/v1/todos/:id
  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.todosService.findOneForUser(userId, id);
  }

  // PATCH /api/v1/todos/:id
  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    return this.todosService.update(userId, id, dto);
  }

  // DELETE /api/v1/todos/:id
  @Delete(':id')
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.todosService.remove(userId, id);
    return { message: 'Todo deleted' };
  }
}
