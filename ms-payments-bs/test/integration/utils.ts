import { HttpService } from '@nestjs/axios';
import { INestApplication } from '@nestjs/common';
import { AxiosResponse, AxiosHeaders } from 'axios';
import { Observable, of } from 'rxjs';
import request from 'supertest';
import { Server } from 'tls';

export const GQL_PATH = '/graphql';

export function mockHttpServiceResponse(
  httpServiceMock: HttpService,
  data: unknown,
  status: number,
  statusText?: string,
): jest.SpyInstance<Observable<AxiosResponse>, any[]> {
  return jest.spyOn(httpServiceMock, 'request').mockImplementation(
    (): Observable<AxiosResponse> =>
      of({
        data,
        status: typeof status === 'number' ? status : 200,
        statusText: statusText ?? '',
        headers: {},
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse),
  ) as jest.SpyInstance<Observable<AxiosResponse>, any[]>;
}

export function mockHttpServiceResponsePost(
  httpServiceMock: HttpService,
  data: unknown,
  status: number,
  statusText?: string,
): jest.SpyInstance<Observable<AxiosResponse>, any[]> {
  return jest.spyOn(httpServiceMock, 'post').mockImplementation(
    (): Observable<AxiosResponse> =>
      of({
        data,
        status: typeof status === 'number' ? status : 200,
        statusText: statusText ?? '',
        headers: {},
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse),
  ) as jest.SpyInstance<Observable<AxiosResponse>, any[]>;
}

export const doRequestToBff = (app: INestApplication, body: object) => {
  return request(app.getHttpServer() as unknown as Server)
    .post(GQL_PATH)
    .send(body);
};
