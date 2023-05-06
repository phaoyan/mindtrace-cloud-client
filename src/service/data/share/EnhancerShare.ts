import {Enhancer} from "../Enhancer";

export interface EnhancerShare{
    id: number,
    enhancerId: number,
    userId: number,
    rate: number,
    visits: number,
    likes: number,
    favorites: number,
    enhancer:Enhancer
}