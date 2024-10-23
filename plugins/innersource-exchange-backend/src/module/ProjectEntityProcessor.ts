import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import {
  Entity,
  getCompoundEntityRef,
  parseEntityRef,
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
} from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CatalogProcessor,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';
import { ProjectEntity } from 'backstage-plugin-innersource-exchange-common';
import { projectEntityValidator } from './lib/validator';

export class ProjectEntityProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;
  constructor(private readonly auth: AuthService, logger: LoggerService) {
    this.logger = logger.child({ name: this.getProcessorName() });
    this.logger.info('Project entity processor is running');
  }

  private async getPluginServiceToken(): Promise<string> {
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'innersource-exchange',
    });
    return token;
  }

  getProcessorName(): string {
    return 'ProjectEntityProcessor';
  }

  async readLocation?(location: LocationSpec): Promise<boolean> {
    if (location.target.match(/api\/innersource-exchange\/project/g)) {
      return true;
    }
    return false;
  }

  async validateEntityKind?(entity: Entity): Promise<boolean> {
    return projectEntityValidator.check(entity);
  }

  async postProcessEntity?(
    entity: Entity,
    location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    if (
      entity.kind === 'Location' &&
      location.target.match(/api\/innersource-exchange\/project/g)
    ) {
      const result = await fetch(location.target, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${await this.getPluginServiceToken()}`,
        },
      });
      const data = (await result.json()) as ProjectEntity;
      emit(processingResult.entity(location, data));
    }
    const selfRef = getCompoundEntityRef(entity);
    function doEmit(
      targets: string | string[] | undefined,
      context: { defaultKind?: string; defaultNamespace: string },
      outgoingRelation: string,
      incomingRelation: string,
    ): void {
      if (!targets) {
        return;
      }
      for (const target of [targets].flat()) {
        const targetRef = parseEntityRef(target, context);
        emit(
          processingResult.relation({
            source: selfRef,
            type: outgoingRelation,
            target: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
          }),
        );
        emit(
          processingResult.relation({
            source: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
            type: incomingRelation,
            target: selfRef,
          }),
        );
      }
    }

    if (entity.kind === 'Project') {
      const data = entity as ProjectEntity;

      doEmit(
        data.spec.owner,
        { defaultNamespace: 'default', defaultKind: 'User' },
        RELATION_OWNED_BY,
        RELATION_OWNER_OF,
      );

      doEmit(
        data.spec.collaborators,
        { defaultNamespace: 'default', defaultKind: 'User' },
        'collaborator',
        'collaborator',
      );

      doEmit(
        data.spec.skills,
        { defaultNamespace: 'default', defaultKind: 'Skill' },
        'skill',
        'skill',
      );
    }
    return entity;
  }
}
