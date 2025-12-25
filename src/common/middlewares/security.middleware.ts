import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

const helmetMiddleware = helmet();

export function securityMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	helmetMiddleware(req, res, next);
}
