/*
 * Copyright 2020 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CdConfigurationEntity } from '../configurations/entity'
import { CdConfigurationsRepository } from '../configurations/repository'
import { SpinnakerApiService } from '../../core/integrations/spinnaker/spinnaker-api.service'
import { MooveService } from '../../core/integrations/moove'
import { DeploymentsController } from './controller/deployments.controller'
import { DeploymentEntityV2 as DeploymentEntity } from './entity/deployment.entity'
import { Execution } from './entity/execution.entity'
import { PgBossWorker } from './jobs/pgboss.worker'
import { DeploymentCleanupHandler } from './use-cases/deployment-cleanup-handler'
import { DeploymentHandlerUseCase } from './use-cases/deployment-handler.usecase'
import { ReceiveNotificationUseCase } from './use-cases/receive-notification.usecase'
import { SpinnakerConnector } from '../../core/integrations/spinnaker/connector'
import { ComponentsRepositoryV2 } from './repository'
import { CreateDeploymentUseCase } from './use-cases/create-deployment.usecase'
import { CreateUndeploymentUseCase } from './use-cases/create-undeployment.usecase'
import { DeploymentRepositoryV2 } from './repository/deployment.repository'
import { ExecutionRepository } from './repository/execution.repository'
import { ExecutionsController } from './controller/executions.controller'
import { PaginatedExecutionsUseCase } from './use-cases/paginated-executions.usecase'
import { CdStrategyFactory } from '../../core/integrations/cd-strategy-factory'
import { OctopipeConnector } from '../../core/integrations/octopipe/connector'
import { OctopipeApi } from '../../core/integrations/octopipe/octopipe-api'
import { ConsoleLoggerService } from '../../core/logs/console/console-logger.service'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      DeploymentEntity,
      Execution,
      CdConfigurationEntity,
      CdConfigurationsRepository,
      ComponentsRepositoryV2,
      ExecutionRepository,
      DeploymentRepositoryV2
    ])
  ],
  controllers: [
    DeploymentsController,
    ExecutionsController
  ],
  providers: [
    PgBossWorker,
    CreateDeploymentUseCase,
    CreateUndeploymentUseCase,
    ReceiveNotificationUseCase,
    DeploymentHandlerUseCase,
    PaginatedExecutionsUseCase,
    MooveService,
    DeploymentCleanupHandler,
    ConsoleLoggerService,
    SpinnakerConnector,
    SpinnakerApiService,
    CdStrategyFactory,
    OctopipeConnector,
    OctopipeApi
  ],
  exports: [
  ]
})
export class DeploymentsModule { }
