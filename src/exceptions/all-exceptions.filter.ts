// src/all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Error as MongooseError } from 'mongoose'; // Importe a classe de erro do Mongoose

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocorreu um erro interno do servidor.';
    let messages: string[] = [];

    // Captura erros do ValidationPipe
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Verifica se o erro do ValidationPipe tem múltiplos messages
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        messages = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
          : [exceptionResponse.message];
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof MongooseError.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Erro de validação de dados.';
      messages = Object.values(exception.errors).map((error: any) => error.message);
    } else {
      console.error(exception); // Loga o erro desconhecido para depuração
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: messages.length > 0 ? undefined : message,
      messages: messages.length > 0 ? messages : undefined,
    });
  }
}
