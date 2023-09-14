import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { error } from 'console';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name=createPokemonDto.name.toLocaleLowerCase();
    try{

    const pokemon = await this.pokemonModel.create(createPokemonDto);
    return pokemon;

    }catch(error){
      this.handleExceptions ( error );
    }


  }

  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto;
    return this.pokemonModel.find()
    .limit( limit )
    .skip( offset )
    .sort({nro:1})
    .select('-__v')
  }

  async findOne( term: string ) {//term:termino de busqueda
    let pokemon: Pokemon;
    if(!isNaN( +term )){
      pokemon = await this.pokemonModel.findOne({ nro:term });
    }
    //MOngoId
    if(!pokemon && isValidObjectId ( term)){
      pokemon = await this.pokemonModel.findById(term);
    }
    //Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name:term.toLocaleLowerCase().trim()})
    }

    if(!pokemon)
      throw new NotFoundException(`Pokemon con id, nombre o nro "${ term }" not found`)

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    

    try{

      await pokemon.updateOne( updatePokemonDto);

      return {...pokemon.toJSON(),...updatePokemonDto};
  
      }catch(error){
        this.handleExceptions ( error );
      }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne()
    //const result = await this.pokemonModel.findByIdAndDelete ( id)
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id})
    if(deletedCount === 0)
      throw new BadRequestException(`Pokemon con id "${ id }" not found`);
    
    return;
  }

  private handleExceptions( error: any ){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon ya existe en la bd ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`No puede crear Pokemon - check server logs`);
  } 
  
}
