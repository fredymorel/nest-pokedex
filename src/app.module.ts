import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PokemonModule } from './pokemon/pokemon.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './config/env.config';
import { JoinValidationSchema } from './config/joi.validation';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoinValidationSchema,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),
    //MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),
    MongooseModule.forRoot(process.env.MONGODB,{
      dbName:'pokemondb'
    }),
    PokemonModule,
    CommonModule,
    SeedModule 
  ],
})
export class AppModule {}
