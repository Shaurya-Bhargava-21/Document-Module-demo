import Fastify, { type FastifyError } from "fastify";
import { AppDataSource } from "../app/persistence/data-source.js";
import { documentRoutes } from "./routes/documents.js";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import {
    jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import {connectRedis} from './redis.js'

const fastify = Fastify({
    logger:true
}).withTypeProvider<ZodTypeProvider>();

// Set the validator and serializer compilers
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.setErrorHandler((error:FastifyError, request, reply) => {
  const statusCode = error.statusCode ?? 500;
  reply.code(statusCode).send({
    statusCode,
    code: error.code ?? "INTERNAL_ERROR",
    error: error.message,
  });
});

await fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Document API",
      description: "Document management API",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

await fastify.register(fastifySwaggerUi, {
  routePrefix: "/docs", 
});

fastify.register(documentRoutes,{prefix:"/documents"})

async function start(){
    try{
        await AppDataSource.initialize();
        console.log("Database connected")
        
        await connectRedis();

        await fastify.listen({port:4000})
        console.log("server running on port 4000")
    }
    catch(err){
        fastify.log.error(err);
        process.exit(1)
    }
}

start()