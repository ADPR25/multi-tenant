
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Addendum } from "./entities/addendum.entity";
import { CreateAddendumDto } from "./dto/create-addendum.dto";
import { Contract } from "../contracts/entities/contract.entity";

@Injectable()
export class AddendumsService {
  constructor(
    @InjectRepository(Addendum) private readonly repo: Repository<Addendum>,
    @InjectRepository(Contract) private readonly contractRepo: Repository<Contract>,
  ) { }
  
  async create(dto: CreateAddendumDto, companyId: string) {
    const contract = await this.contractRepo.findOne({ where: { id: dto.contractId, companyId } });
    if (!contract) throw new NotFoundException("Contrato no encontrado");
    const add = this.repo.create({ ...dto, companyId });
    return await this.repo.save(add);
  }

  findByContract(contractId: string, companyId: string) {
    return this.repo.find({ where: { contractId, companyId }, order: { createdAt: "DESC" } });
  }

  async remove(id: string, companyId: string) {
    const a = await this.repo.findOne({ where: { id, companyId } });
    if (!a) throw new NotFoundException("Addendum no encontrado");
    await this.repo.softRemove(a);
    return { message: "Eliminado" };
  }
}
