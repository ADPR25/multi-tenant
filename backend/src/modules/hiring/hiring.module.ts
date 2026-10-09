import { Module } from "@nestjs/common";
import { ContractsModule } from "./contracts/contracts.module";
import { ObligationsModule } from "./obligations/obligations.module";
import { SignaturesModule } from "./signatures/signatures.module";
import { RequirementsModule } from "./requirements/requirements.module";
import { AddendumsModule } from "./addendums/addendums.module";
import { RouterModule } from "@nestjs/core";

@Module({
  imports: [
    ContractsModule,
    ObligationsModule,
    SignaturesModule,
    RequirementsModule,
    AddendumsModule,
    RouterModule.register([
      { path: "hiring", module: ContractsModule },
      { path: "hiring", module: ObligationsModule },
      { path: "hiring", module: SignaturesModule },
      { path: "hiring", module: RequirementsModule },
      { path: "hiring", module: AddendumsModule },
    ]),
  ],
  exports: [
    ContractsModule,
    ObligationsModule,
    SignaturesModule,
    RequirementsModule,
    AddendumsModule,
  ],
})
export class HiringModule {}
