import Fastify from "fastify";
import { AppDataSource } from "../app/persistence/data-source.js";
import { documentRoutes } from "./routes/documents.js";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

const fastify = Fastify({
    logger:true
}).withTypeProvider<ZodTypeProvider>();

// Set the validator and serializer compilers
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);


fastify.register(documentRoutes,{prefix:"/documents"})

fastify.get('/health',async ()=>{
    return {status:"ok",timestamp :new Date().toISOString()}
})

async function start(){
    try{
        await AppDataSource.initialize();
        console.log("Database connected");

        await fastify.listen({port:4000})
        console.log("server running on port 4000")
    }
    catch(err){
        fastify.log.error(err);
        process.exit(1)
    }
}

start()