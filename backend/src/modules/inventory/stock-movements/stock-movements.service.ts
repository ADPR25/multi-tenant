import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, FindOptionsWhere, Repository } from "typeorm";
import { StockMovement, MovementType } from "./entities/stock-movement.entity";
import { Stock } from "../stocks/entities/stock.entity";
import { Product } from "../products/entities/product.entity";
import { Warehouse } from "../warehouses/entities/warehouse.entity";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateStockMovementDto, companyId: string) {
    if (dto.toWarehouseId && dto.toWarehouseId === dto.warehouseId) {
      throw new BadRequestException("No puedes transferir a la misma bodega");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId, companyId },
      });
      if (!product)
        throw new NotFoundException(`Producto ${dto.productId} no existe`);
      const warehouse = await queryRunner.manager.findOne(Warehouse, {
        where: { id: dto.warehouseId, companyId, isActive: true },
      });
      if (!warehouse)
        throw new NotFoundException(`Bodega ${dto.warehouseId} no existe`);

      if (dto.toWarehouseId) {
        const destWh = await queryRunner.manager.findOne(Warehouse, {
          where: { id: dto.toWarehouseId, companyId, isActive: true },
        });
        if (!destWh)
          throw new NotFoundException(
            `Bodega destino ${dto.toWarehouseId} no existe`,
          );
      }

      // LOCK PESIMISTA - evita race condition
      let stock = await queryRunner.manager.findOne(Stock, {
        where: {
          companyId,
          productId: dto.productId,
          warehouseId: dto.warehouseId,
        },
        lock: { mode: "pessimistic_write" },
      });

      if (!stock) {
        stock = queryRunner.manager.create(Stock, {
          companyId,
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          quantity: 0,
        });
        stock = await queryRunner.manager.save(stock);
      }

      const previousQuantity = Number(stock.quantity);
      let newQuantity = previousQuantity;

      if (
        dto.type === MovementType.IN ||
        dto.type === MovementType.TRANSFER_IN
      ) {
        newQuantity = previousQuantity + dto.quantity;
      } else if (
        dto.type === MovementType.OUT ||
        dto.type === MovementType.TRANSFER_OUT
      ) {
        if (previousQuantity < dto.quantity) {
          throw new BadRequestException(
            `Stock insuficiente. Disponible: ${previousQuantity}, solicitado: ${dto.quantity}`,
          );
        }
        newQuantity = previousQuantity - dto.quantity;
      } else if (dto.type === MovementType.ADJUSTMENT) {
        newQuantity = dto.quantity;
      }

      stock.quantity = newQuantity;
      await queryRunner.manager.save(stock);

      const movement = queryRunner.manager.create(StockMovement, {
        companyId,
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        type: dto.type,
        quantity: dto.quantity,
        previousQuantity,
        newQuantity,
        reason: dto.reason,
        referenceId: dto.referenceId,
        toWarehouseId: dto.toWarehouseId,
      });
      const savedMovement = await queryRunner.manager.save(movement);

      if (dto.type === MovementType.TRANSFER_OUT && dto.toWarehouseId) {
        // TRANSFER IN atómico
        let destStock = await queryRunner.manager.findOne(Stock, {
          where: {
            companyId,
            productId: dto.productId,
            warehouseId: dto.toWarehouseId,
          },
          lock: { mode: "pessimistic_write" },
        });
        if (!destStock) {
          destStock = queryRunner.manager.create(Stock, {
            companyId,
            productId: dto.productId,
            warehouseId: dto.toWarehouseId,
            quantity: 0,
          });
        }
        const prev = Number(destStock.quantity);
        destStock.quantity = prev + dto.quantity;
        await queryRunner.manager.save(destStock);

        const inMovement = queryRunner.manager.create(StockMovement, {
          companyId,
          productId: dto.productId,
          warehouseId: dto.toWarehouseId,
          type: MovementType.TRANSFER_IN,
          quantity: dto.quantity,
          previousQuantity: prev,
          newQuantity: destStock.quantity,
          reason: `Transferencia desde ${dto.warehouseId} - ${dto.reason}`,
          referenceId: dto.referenceId,
          toWarehouseId: dto.warehouseId,
        });
        await queryRunner.manager.save(inMovement);
      }

      await queryRunner.commitTransaction();
      return savedMovement;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    companyId: string,
    pagination: PaginationDto,
    productId?: string,
    warehouseId?: string,
  ) {
    const where: FindOptionsWhere<StockMovement> = { companyId };
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;

    const [data, total] = await this.movementRepo.findAndCount({
      where,
      relations: ["product", "warehouse"],
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const one = await this.movementRepo.findOne({
      where: { id, companyId },
      relations: ["product", "warehouse"],
    });
    if (!one) throw new NotFoundException(`Movement ${id} not found`);
    return one;
  }
}
