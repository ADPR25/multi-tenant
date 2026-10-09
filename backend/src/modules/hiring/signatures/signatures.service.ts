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
    codigo: string,
  ): Promise<Contract & { yaFirmado?: boolean }> {
    const contract = await this.contractRepo.findOne({
      where: { codigo },
      relations: ["thirdParty", "supervisor"],
    });
    if (!contract) {
      throw new NotFoundException("Contrato no encontrado");
    }

    if (
      contract.estado === ContractStatus.FIRMADO ||
      contract.estado === ContractStatus.OFICIAL
    ) {
      return { ...contract, yaFirmado: true };
    }

    if (contract.estado !== ContractStatus.LISTO_FIRMA) {
      throw new BadRequestException(
        "Contrato aún no está habilitado para firma",
      );
    }

    return contract;
  }

  async requestCode(
    codigo: string,
    email: string,
    ip: string,
    _companyId?: string,
  ): Promise<{ message: string; dev_otp: string; expiraEn: Date }> {
    const contract = await this.contractRepo.findOne({
      where: { codigo },
      relations: ["thirdParty"],
    });
    if (!contract) {
      throw new NotFoundException("Contrato no encontrado");
    }

    if (contract.estado !== ContractStatus.LISTO_FIRMA) {
      throw new BadRequestException("Contrato no habilitado para firma");
    }

    // Validar email del tercero si existe
    const terceroEmail = contract.thirdParty?.email;
    if (terceroEmail) {
      if (terceroEmail.toLowerCase() !== email.toLowerCase()) {
        throw new ForbiddenException(
          "El correo no coincide con el contratista",
        );
      }
    }

    // invalidar anteriores
    await this.codeRepo.update(
      { contractId: contract.id, usado: false },
      { usado: true },
    );

    const otp = this.generateOTP();
    const entity = this.codeRepo.create({
      contractId: contract.id,
      companyId: contract.companyId,
      codigoHash: this.hash(otp),
      expiraEn: new Date(Date.now() + 10 * 60 * 1000),
      ipSolicitud: ip,
      intentos: 0,
    });
    await this.codeRepo.save(entity);

    // Aquí integras tu MailService. Por ahora retornamos OTP para dev (quitar en prod)
    return {
      message: "Código enviado al correo",
      dev_otp: otp,
      expiraEn: entity.expiraEn,
    };
  }

  async verifyCode(
    codigo: string,
    otp: string,
    ip: string,
    firmaBase64?: string,
  ): Promise<{ message: string; contract: Contract }> {
    const contract = await this.contractRepo.findOne({
      where: { codigo },
      relations: ["thirdParty"],
    });
    if (!contract) {
      throw new NotFoundException("Contrato no encontrado");
    }

    const activeCode = await this.codeRepo.findOne({
      where: { contractId: contract.id, usado: false },
      order: { createdAt: "DESC" },
    });
    if (!activeCode) {
      throw new BadRequestException("No hay código activo. Solicite uno nuevo");
    }

    if (new Date() > activeCode.expiraEn) {
      activeCode.usado = true;
      await this.codeRepo.save(activeCode);
      throw new BadRequestException("Código expirado");
    }

    if (activeCode.intentos >= 3) {
      activeCode.usado = true;
      await this.codeRepo.save(activeCode);
      throw new BadRequestException("Demasiados intentos");
    }

    if (activeCode.codigoHash !== this.hash(otp)) {
      activeCode.intentos += 1;
      await this.codeRepo.save(activeCode);
      throw new BadRequestException("Código incorrecto");
    }

    activeCode.verificado = true;
    activeCode.usado = true;
    activeCode.verificadoEn = new Date();
    await this.codeRepo.save(activeCode);

    const firmado = await this.contractsService.markAsSigned(
      codigo,
      {
        firma: firmaBase64 ?? "firma_otp_verificada",
        firmaHash: this.hash(codigo + otp + Date.now().toString()),
        firmaIp: ip,
        firmaMetodo: "electronica_otp",
        firmaMetadata: { emailVerificado: true, ip },
      },
      contract.companyId,
    );

    return { message: "Contrato firmado con éxito", contract: firmado };
  }
}
