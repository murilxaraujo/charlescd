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

import { stringify } from 'yaml'
import { Component, Deployment } from '../../../api/deployments/interfaces'
import { DeploymentUtils } from '../utils/deployment.utils'
import { AppConstants } from '../../../../v1/core/constants'
import { ArgocdAppEntries, ArgocdApplication, ArgocdCharlesValues, ArgocdHelm } from './interfaces/argocd-application.interface'
import { ArgocdDeploymentRequest, ArgocdUndeploymentRequest } from './interfaces/argocd-deployment.interface'
import { applicationNameStrategy, proxyNameStrategy } from './argocd-application-name-strategy'

export class ArgoCdRequestBuilder {

  public buildDeploymentRequest(
    deployment: Deployment,
    activeComponents: Component[],
  ): ArgocdDeploymentRequest {

    return {
      newDeploys: this.getDeploymentsArray(deployment, activeComponents),
      deleteDeploys: this.getUnusedDeploymentsArray(deployment, activeComponents),
      proxyDeployments: this.getProxyArgocdJson(deployment, activeComponents)
    }
  }

  public buildUndeploymentRequest(
    deployment: Deployment,
    activeComponents: Component[],
  ): ArgocdUndeploymentRequest {

    return {
      deleteApplications: this.getUndeploymentsArray(deployment),
      proxyUndeployments: this.getProxyUndeploymentsArray(deployment, activeComponents)
    }
  }

  private getDeploymentsArray(deployment: Deployment, activeComponents: Component[]): ArgocdApplication[] {
    if (!deployment?.components) {
      return []
    }
    const applications: ArgocdApplication[] = []
    deployment.components.forEach((component: Component): ArgocdApplication | undefined => {
      if (DeploymentUtils.getActiveSameCircleTagComponent(activeComponents, component, deployment.circleId)) {
        return
      }
      const helmValues: ArgocdCharlesValues = {
        image: {
          tag: component.imageUrl
        },
        tag: component.imageTag,
        component: component.name,
        deploymentName: `${component.name}-${component.imageTag}-${deployment.circleId?.substring(24)}`,
        circleId: deployment.circleId
      }
      const helm: ArgocdHelm = {
        valueFiles: [
          `${component.name}.yaml`
        ],
        values: stringify(helmValues)
      }
      const namespace = deployment.cdConfiguration.configurationData.namespace
      const argocdApplication = new ArgocdApplication(component, namespace, deployment.circleId, helm, applicationNameStrategy)
      applications.push(argocdApplication)
    })
    return applications
  }

  private getProxyArgocdJson(deployment: Deployment, activeComponents: Component[]): ArgocdApplication[] {
    // TODO: add prefix option
    const proxys: ArgocdApplication[] = []
    deployment.components?.forEach(component => {
      const appEntries = this.getAppEntries(component, activeComponents, deployment.circleId)
      const proxyValues = {
        componentName: component.name,
        hostname: component.hostValue ? [component.hostValue, component.name] : [component.name],
        virtualGateway: component.gatewayName ? [component.gatewayName] : [],
        appEntries: appEntries.circleProxy,
        defaultVersion: appEntries.defaultProxy
      }
      const helm: ArgocdHelm = {
        valueFiles: [
          'values.yaml'
        ],
        values: stringify(proxyValues),
      }

      const namespace = deployment.cdConfiguration.configurationData.namespace
      const argocdProxyApplication = new ArgocdApplication(component, namespace, deployment.circleId, helm, proxyNameStrategy)

      proxys.push(argocdProxyApplication)
    })
    return proxys
  }

  private getAppEntries(component: Component, activeComponents: Component[], circleId?: string | null): ArgocdAppEntries {
    const appEntries: ArgocdAppEntries = {
      circleProxy: [],
      defaultProxy: undefined,
    }
    const activeByName: Component[] = DeploymentUtils.getActiveComponentsByName(activeComponents, component.name)
    if (!circleId) {
      activeByName.forEach(component => appEntries.circleProxy.push({
        componentName: component.name,
        imageTag: component.imageTag,
        circleId: component.deployment?.circleId,
      }))
      appEntries.defaultProxy = {
        componentName: component.name,
        imageTag: component.imageTag,
        circleId: AppConstants.DEFAULT_CIRCLE_ID,
      }
    } else {
      appEntries.circleProxy.push({
        componentName: component.name,
        imageTag: component.imageTag,
        circleId: circleId,
      })
      activeByName.forEach(component => {
        const activeCircleId = component.deployment?.circleId
        if (activeCircleId && activeCircleId !== circleId) {
          appEntries.circleProxy.push({
            componentName: component.name,
            imageTag: component.imageTag,
            circleId: component.deployment?.circleId,
          })
        }
      })
      const defaultComponent: Component | undefined = activeByName.find(component => component.deployment && !component.deployment.circleId)
      if (defaultComponent) {
        appEntries.defaultProxy = {
          componentName: defaultComponent.name,
          imageTag: defaultComponent.imageTag,
          circleId: AppConstants.DEFAULT_CIRCLE_ID,
        }
      }
    }
    return appEntries
  }

  private getUndeployAppEntries(deployment: Deployment, activeComponents: Component[]): ArgocdAppEntries {
    const appEntries: ArgocdAppEntries = {
      circleProxy: [],
      defaultProxy: undefined,
    }
    if (!deployment.components?.length) {
      return appEntries
    }
    deployment.components?.map(component => {
      const activeByName: Component[] = DeploymentUtils.getActiveComponentsByName(activeComponents, component.name)

      activeByName.map(component => {
        const activeCircleId = component.deployment?.circleId
        if (activeCircleId && activeCircleId !== deployment.circleId) {
          appEntries.circleProxy.push({
            componentName: component.name,
            imageTag: component.imageTag,
            circleId: component.deployment?.circleId,
          })
        }
      })
      const defaultComponent: Component | undefined = activeByName.find(component => component.deployment && !component.deployment.circleId)
      if (defaultComponent) {
        appEntries.defaultProxy = {
          componentName: component.name,
          imageTag: component.imageTag,
          circleId: AppConstants.DEFAULT_CIRCLE_ID,
        }
      }

    })
    return appEntries
  }

  private getUndeploymentsArray(deployment: Deployment): string[] {
    if (!deployment?.components) {
      return []
    }
    return deployment.components.map(component => `${component.name}-${component.imageTag}-${component.deployment?.circleId}`)
  }

  private getProxyUndeploymentsArray(deployment: Deployment, activeComponents: Component[]): ArgocdApplication[] | undefined {
    // TODO: add prefix option
    return deployment.components?.map(component => {
      const appEntries = this.getUndeployAppEntries(deployment, activeComponents)
      const proxyValues = {
        componentName: component.name,
        hostname: component.hostValue ? [component.hostValue, component.name] : [component.name],
        virtualGateway: component.gatewayName ? [component.gatewayName] : [],
        appEntries: appEntries.circleProxy,
        defaultVersion: appEntries.defaultProxy
      }
      const helm: ArgocdHelm = {
        valueFiles: [
          'values.yaml'
        ],
        values: stringify(proxyValues),
      }
      const namespace = deployment.cdConfiguration.configurationData.namespace
      return new ArgocdApplication(component, namespace, deployment.circleId, helm, proxyNameStrategy)
    })
  }

  private getUnusedDeploymentsArray(deployment: Deployment, activeComponents: Component[]): string[] {
    if (!deployment?.components) {
      return []
    }
    const unusedDeployments: string[] = []
    deployment.components.forEach(component => {
      const unusedComponent: Component | undefined = DeploymentUtils.getUnusedComponent(activeComponents, component, deployment.circleId)
      if (unusedComponent) {
        unusedDeployments.push(`${unusedComponent.name}-${unusedComponent.imageTag}-${unusedComponent.deployment?.circleId}`)
      }
    })
    return unusedDeployments
  }

}