// src/main.ts

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: "http://localhost:5173", // Asegúrate de que esta URL sea la de tu frontend
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Si necesitas enviar cookies o headers de autenticación
  });

  // Iniciar el servidor
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
