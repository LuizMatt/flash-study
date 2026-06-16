import { Request, Response, NextFunction } from 'express';
import { validate } from '../../../src/middlewares/validate';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().int().min(0),
});

function makeReq(body: unknown): Partial<Request> {
  return { body } as Partial<Request>;
}

function makeRes(): { res: Partial<Response>; statusMock: jest.Mock; jsonMock: jest.Mock } {
  const jsonMock = jest.fn();
  const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  const res = { status: statusMock } as unknown as Partial<Response>;
  return { res, statusMock, jsonMock };
}

describe('validate middleware', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() when the body is valid', () => {
    const req = makeReq({ name: 'Alice', age: 25 });
    const { res } = makeRes();

    validate(schema)(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should replace req.body with the parsed data (coercion)', () => {
    const req = makeReq({ name: 'Bob', age: '30' }); // age as string
    const { res } = makeRes();

    validate(schema)(req as Request, res as Response, next);

    expect(req.body.age).toBe(30); // coerced to number
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should return 400 and not call next() when body is invalid', () => {
    const req = makeReq({ name: '', age: -1 });
    const { res, statusMock, jsonMock } = makeRes();

    validate(schema)(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      }),
    );
  });

  it('should include field-level details in the 400 response', () => {
    const req = makeReq({ age: 'not-a-number' }); // name missing, age invalid
    const { res, jsonMock } = makeRes();

    validate(schema)(req as Request, res as Response, next);

    const body = jsonMock.mock.calls[0][0];
    expect(body.error.details.length).toBeGreaterThan(0);
  });

  it('should validate query params when target is "query"', () => {
    const querySchema = z.object({ page: z.coerce.number().min(1) });
    const req = { query: { page: '2' } } as unknown as Request;
    const { res } = makeRes();

    validate(querySchema, 'query')(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as Request).query.page).toBe(2);
  });
});
