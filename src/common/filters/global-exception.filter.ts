import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';

import type { Request, Response } from 'express';

interface ErrorResponse {
	timestamp: string;
	path: string;
	[key: string]: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		if (response.headersSent) {
			console.warn('Response already sent, skipping exception handling');
			return;
		}

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		const message = 'Internal server error';

		let responseJson: ErrorResponse = {
			timestamp: new Date().toISOString(),
			path: request.url,
			message,
		};

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === 'object') {
				responseJson = { ...responseJson, ...exceptionResponse };
			} else if (typeof exceptionResponse === 'string') {
				responseJson.message = exceptionResponse;
			}
		}

		console.log(exception);

		response.status(status).json(responseJson);
	}
}
