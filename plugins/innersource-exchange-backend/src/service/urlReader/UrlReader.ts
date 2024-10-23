import {
  ReaderFactory,
  ReadUrlResponseFactory,
} from '@backstage/backend-defaults/urlReader';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
  UrlReaderService,
  UrlReaderServiceReadTreeResponse,
  UrlReaderServiceReadUrlOptions,
  UrlReaderServiceReadUrlResponse,
  UrlReaderServiceSearchResponse,
} from '@backstage/backend-plugin-api';
import { NotFoundError, NotModifiedError } from '@backstage/errors';
import fetch, { Response } from 'node-fetch';

export class ExchangeUrlReader implements UrlReaderService {
  private static auth: AuthService;
  private static baseUrl: string;

  public static async getFactory(
    auth: AuthService,
    discoveryApi: DiscoveryService,
  ) {
    this.auth = auth;
    this.baseUrl = await discoveryApi.getBaseUrl('innersource-exchange');
    return ExchangeUrlReader.factory;
  }

  public static readonly factory: ReaderFactory = options => {
    const { logger } = options;
    return [
      {
        reader: new ExchangeUrlReader(logger),
        predicate: (url: URL) => {
          const urlPattern =
            /^https?:\/\/[^\/]+\/api\/innersource-exchange\/[^\/]+$/;
          return (
            url.toString().includes(ExchangeUrlReader.baseUrl) ||
            urlPattern.test(url.toString())
          );
        },
      },
    ];
  };

  private logger: LoggerService;
  constructor(logger: LoggerService) {
    this.logger = logger.child({ name: 'ExchangeUrlReader' });
  }

  async read(url: string): Promise<Buffer> {
    const response = await this.readUrl(url);
    return response.buffer();
  }

  async readUrl(
    url: string,
    _options?: UrlReaderServiceReadUrlOptions,
  ): Promise<UrlReaderServiceReadUrlResponse> {
    this.logger.info(`Reading ${url}`);
    let response: Response;
    try {
      const { token } = await ExchangeUrlReader.auth.getPluginRequestToken({
        onBehalfOf: await ExchangeUrlReader.auth.getOwnServiceCredentials(),
        targetPluginId: 'innersource-exchange',
      });
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      throw new Error(`Unable to read ${url}, ${e}`);
    }

    if (response.status === 304) {
      throw new NotModifiedError();
    }

    if (response.ok && response.body) {
      const res = await response.json();
      return ReadUrlResponseFactory.fromNodeJSReadable(response.body, {
        lastModifiedAt: res.metadata.createdOn,
      });
    }

    const message = `could not read ${url}, ${response.status} ${response.statusText}`;
    if (response.status === 404) {
      throw new NotFoundError(message);
    }
    throw new Error(message);
  }

  async search(): Promise<UrlReaderServiceSearchResponse> {
    throw new Error('Not Implemented');
  }

  async readTree(): Promise<UrlReaderServiceReadTreeResponse> {
    throw new Error('Not Implemented');
  }
}
