import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';


@Injectable()
export class SeedService {

  //private readonly axios: AxiosInstance = axios; //creamos un adaptador generico axios.adapter e implementa una interface http-adapter

  constructor(
    @InjectModel( Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ){}

  async executeSeed(){

    await this.pokemonModel.deleteMany({});//elimina todos los pokemones de la tabla

    const data = await this.http.get<PokeResponse>('http://pokeapi.co/api/v2/pokemon?limit=650');
    
    //const insertPromiseArray = [];// primer metodo insercion multiple
    const pokemonToInsert: {name: string, nro: number}[] = [];

    data.results.forEach(({name,url}) =>{

      const segments = url.split('/');
      const nro = +segments[segments.length - 2];

      //const pokemon = await this.pokemonModel.create({name,nro});
      /*primer metodo insercion multiple
      // insertPromiseArray.push(
      //   this.pokemonModel.create({name,nro})
      // );
      */
      pokemonToInsert.push({name,nro});
    });
    //await Promise.all(insertPromiseArray);primer metodo insercion multiple
    
    await this.pokemonModel.insertMany(pokemonToInsert);//ej. [{name:bulbasaru,nro:1}]

    return 'Seed Executed';
  }

}
