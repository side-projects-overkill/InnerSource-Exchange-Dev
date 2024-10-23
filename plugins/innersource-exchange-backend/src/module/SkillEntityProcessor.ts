import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import {
  Entity,
  getCompoundEntityRef,
  parseEntityRef,
} from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CatalogProcessor,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';
import { SkillEntity } from 'backstage-plugin-innersource-exchange-common';
import { skillEntityValidator } from './lib/validator';

export class SkillEntityProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;
  constructor(private readonly auth: AuthService, logger: LoggerService) {
    this.logger = logger.child({ name: this.getProcessorName() });
    this.logger.info('Skills entity processor is running')
  }

  private async getPluginServiceToken(): Promise<string> {
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'innersource-exchange',
    });
    return token;
  }

  getProcessorName(): string {
    return 'SkillEntityProcessor';
  }

  async readLocation?(location: LocationSpec): Promise<boolean> {
    if (location.target.match(/api\/innersource-exchange\/skill/g)) return true;
    return false;
  }

  async validateEntityKind?(entity: Entity): Promise<boolean> {
    return skillEntityValidator.check(entity);
  }

  async postProcessEntity?(
    entity: Entity,
    location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    if (
      entity.kind === 'Location' &&
      location.target.match(/api\/innersource-exchange\/skill/g)
    ) {
      const result = await fetch(location.target, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${await this.getPluginServiceToken()}`,
        },
      });
      const data = (await result.json()) as SkillEntity;
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
    if (entity.kind === 'Skill') {
      const data = entity as SkillEntity;
      doEmit(
        data.spec.users,
        { defaultNamespace: 'default', defaultKind: 'User' },
        'skill',
        'skill',
      );
    }
    return entity;
  }
}
