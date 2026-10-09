
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ContractObligation } from "./entities/contract-obligation.entity";
import { CreateObligationDto } from "./dto/create-obligation.dto";
import { UpdateObligationDto } from "./dto/update-obligation.dto";
import { Contract } from "../contracts/entities/contract.entity";

@Injectable()
export class ObligationsService {
  constructor(
    @InjectRepository(ContractObligation) private readonly repo: Repository<ContractObligation>,
    @InjectRepository(Contract) private readonly contractRepo: Repository<Contract>,
  ) {}

  async create(dto: CreateObligationDto, companyId: string) {
    const contract = await this.contractRepo.findOne({ where: { id: dto.contractId, companyId } });
    if (!contract) throw new NotFoundException(`Contrato ${dto.contractId} no encontrado`);

    const count = await this.repo.count({ where: { contractId: dto.contractId, companyId } });
    const obl = this.repo.create({
      ...dto,
      companyId,
      orden: dto.orden ?? count + 1,
    });
    return await this.repo.save(obl);
  }

  async findByContract(contractId: string, companyId: string) {
    return await this.repo.find({
      where: { contractId, companyId },
      order: { orden: "ASC" },
    });
  }

  async findOne(id: string, companyId: string) {
    const obl = await this.repo.findOne({ where: { id, companyId } });
    if (!obl) throw new NotFoundException(`Obligación ${id} no encontrada`);
    return obl;
  }

  async update(id: string, dto: UpdateObligationDto, companyId: string) {
    const obl = await this.findOne(id, companyId);
    Object.assign(obl, dto);
    return await this.repo.save(obl);
  }

  async remove(id: string, companyId: string) {
    const obl = await this.findOne(id, companyId);
    await this.repo.softRemove(obl);
    return { message: "Obligación eliminada" };
  }

  async reorder(contractId: string, orderIds: string[], companyId: string) {
    for (let i = 0; i < orderIds.length; i++) {
      await this.repo.update({ id: orderIds[i], contractId, companyId }, { orden: i + 1 });
    }
    return await this.findByContract(contractId, companyId);
  }
}
