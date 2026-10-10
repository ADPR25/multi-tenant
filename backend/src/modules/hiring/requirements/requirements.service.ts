import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Requirement } from "./entities/requirement.entity";
import { CreateRequirementDto } from "./dto/create-requirement.dto";
import { Contract } from "../contracts/entities/contract.entity";

@Injectable()
export class RequirementsService {
  constructor(
    @InjectRepository(Requirement) private readonly repo: Repository<Requirement>,
    @InjectRepository(Contract) private readonly contractRepo: Repository<Contract>,
  ) {}
  
  async create(dto: CreateRequirementDto, companyId: string) {
    const contract = await this.contractRepo.findOne({ where: { id: dto.contractId, companyId } });
    if (!contract) throw new NotFoundException("Contract not found");
    const requirement = this.repo.create({ ...dto, companyId });
    return await this.repo.save(requirement);
  }

  async findByContract(contractId: string, companyId: string) {
    return await this.repo.find({ where: { contractId, companyId }, order: { createdAt: "ASC" } });
  }
  
  async toggleDelivered(id: string, companyId: string) {
    const requirement = await this.repo.findOne({ where: { id, companyId } });
    if (!requirement) throw new NotFoundException("Requirement not found");
    requirement.isDelivered = !requirement.isDelivered;
    return await this.repo.save(requirement);
  }

  async remove(id: string, companyId: string) {
    const requirement = await this.repo.findOne({ where: { id, companyId } });
    if (!requirement) throw new NotFoundException("Requirement not found");
    await this.repo.softRemove(requirement);
    return { message: "Deleted" };
  }
}