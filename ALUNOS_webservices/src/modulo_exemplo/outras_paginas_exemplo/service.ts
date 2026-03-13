import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class OutrosExemplosService {
    constructor(private prisma: PrismaService) {}

    
    
}