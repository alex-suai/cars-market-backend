import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Delete,
    ParseIntPipe,
    Patch,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { Employee } from './entities/employee.entity';

@Controller('employees')
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    async findAll(@Query('profession') profession?: string): Promise<Employee[]> {
        if (profession) {
            return this.employeesService.findWithFilters({ profession });
        }
        return this.employeesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Employee> {
        return this.employeesService.findOne(id);
    }

    @Post()
    async create(@Body() dto: CreateEmployeeDto): Promise<Employee> {
        return this.employeesService.create(dto);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEmployeeDto,
    ): Promise<Employee> {
        return this.employeesService.update(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.employeesService.remove(id);
    }
}
  