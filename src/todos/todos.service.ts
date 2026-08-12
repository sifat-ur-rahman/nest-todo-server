import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>,
  ) {}

  create(userId: string, dto: CreateTodoDto): Promise<TodoDocument> {
    return this.todoModel.create({ ...dto, user: userId });
  }

  // Only ever returns todos belonging to this user.
  findAllForUser(userId: string): Promise<TodoDocument[]> {
    return this.todoModel.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  async findOneForUser(userId: string, todoId: string): Promise<TodoDocument> {
    const todo = await this.findOwnedTodoOrThrow(userId, todoId);
    return todo;
  }

  async update(
    userId: string,
    todoId: string,
    dto: UpdateTodoDto,
  ): Promise<TodoDocument> {
    const todo = await this.findOwnedTodoOrThrow(userId, todoId);
    Object.assign(todo, dto);
    return todo.save();
  }

  async remove(userId: string, todoId: string): Promise<void> {
    const todo = await this.findOwnedTodoOrThrow(userId, todoId);
    await todo.deleteOne();
  }

  // Shared ownership check: 404 if it doesn't exist, 403 if it
  // exists but belongs to someone else (don't leak which via a 404
  // vs 403 distinction to unauthorized users if you want to be
  // extra strict — this version favors clearer errors for the owner).
  private async findOwnedTodoOrThrow(
    userId: string,
    todoId: string,
  ): Promise<TodoDocument> {
    if (!isValidObjectId(todoId)) {
      throw new NotFoundException('Todo not found');
    }

    const todo = await this.todoModel.findById(todoId).exec();
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    if (todo.user.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this todo');
    }
    return todo;
  }
}
