import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SignatureCode } from "./entities/signature-code.entity";
import { Contract } from "../contracts/entities/contract.entity";
import { ContractStatus } from "../contracts/enums/contract-status.enum";
import { ContractsService } from "../contracts/contracts.service";
import * as crypto from "crypto";

@Injectable()
export class SignaturesService {
  constructor(
    @InjectRepository(SignatureCode)
    private readonly codeRepo: Repository<SignatureCode>,
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    private readonly contractsService: ContractsService,
  ) {}

  private hash(text: string): string {
    return crypto.createHash("sha256").update(text).digest("hex");
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async getPublicContract(
    code: string,
  ): Promise<Contract & { alreadySigned?: boolean }> {
    const contract = await this.contractRepo.findOne({
      where: { code },
      relations: ["thirdParty", "supervisor"],
    });
    if (!contract) {
      throw new NotFoundException("Contract not found");
    }

    if (
      contract.status === ContractStatus.SIGNED ||
      contract.status === ContractStatus.OFFICIAL
    ) {
      return { ...contract, alreadySigned: true };
    }

    if (contract.status !== ContractStatus.READY_TO_SIGN) {
      throw new BadRequestException(
        "Contract not yet enabled for signing",
      );
    }

    return contract;
  }

  async requestCode(
    code: string,
    email: string,
    ip: string,
    _companyId?: string,
  ): Promise<{ message: string; devOtp: string; expiresAt: Date }> {
    const contract = await this.contractRepo.findOne({
      where: { code },
      relations: ["thirdParty"],
    });
    if (!contract) {
      throw new NotFoundException("Contract not found");
    }

    if (contract.status !== ContractStatus.READY_TO_SIGN) {
      throw new BadRequestException("Contract not enabled for signing");
    }

    const thirdPartyEmail = contract.thirdParty?.email;
    if (thirdPartyEmail) {
      if (thirdPartyEmail.toLowerCase() !== email.toLowerCase()) {
        throw new ForbiddenException(
          "Email does not match contractor",
        );
      }
    }

    await this.codeRepo.update(
      { contractId: contract.id, isUsed: false },
      { isUsed: true },
    );

    const otp = this.generateOTP();
    const entity = this.codeRepo.create({
      contractId: contract.id,
      companyId: contract.companyId,
      codeHash: this.hash(otp),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      requestIp: ip,
      attempts: 0,
    });
    await this.codeRepo.save(entity);

    return {
      message: "Code sent to email",
      devOtp: otp,
      expiresAt: entity.expiresAt,
    };
  }

  async verifyCode(
    code: string,
    otp: string,
    ip: string,
    signatureBase64?: string,
  ): Promise<{ message: string; contract: Contract }> {
    const contract = await this.contractRepo.findOne({
      where: { code },
      relations: ["thirdParty"],
    });
    if (!contract) {
      throw new NotFoundException("Contract not found");
    }

    const activeCode = await this.codeRepo.findOne({
      where: { contractId: contract.id, isUsed: false },
      order: { createdAt: "DESC" },
    });
    if (!activeCode) {
      throw new BadRequestException("No active code. Request a new one");
    }

    if (new Date() > activeCode.expiresAt) {
      activeCode.isUsed = true;
      await this.codeRepo.save(activeCode);
      throw new BadRequestException("Code expired");
    }

    if (activeCode.attempts >= 3) {
      activeCode.isUsed = true;
      await this.codeRepo.save(activeCode);
      throw new BadRequestException("Too many attempts");
    }

    if (activeCode.codeHash !== this.hash(otp)) {
      activeCode.attempts += 1;
      await this.codeRepo.save(activeCode);
      throw new BadRequestException("Invalid code");
    }

    activeCode.isVerified = true;
    activeCode.isUsed = true;
    activeCode.verifiedAt = new Date();
    await this.codeRepo.save(activeCode);

    const signed = await this.contractsService.markAsSigned(
      code,
      {
        signature: signatureBase64 ?? "otp_verified_signature",
        signatureHash: this.hash(code + otp + Date.now().toString()),
        signatureIp: ip,
        signatureMethod: "electronic_otp",
        signatureMetadata: { emailVerified: true, ip },
      },
      contract.companyId,
    );

    return { message: "Contract signed successfully", contract: signed };
  }
}