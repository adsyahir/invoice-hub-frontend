import { instance } from "./axios";


export interface StateResponse{
    id: number;
    name: string;
}

export interface CityResponse{
    id: number;
    name: string;
}

export interface PostcodeResponse{
    id: number;
    code: string;
}

export const getAllStates = () =>{
    return instance.get<StateResponse[]>("/geo/states").then((r) => r.data);
}

export const getCitiesByState = (stateId: number) =>{
    return instance.get<CityResponse[]>(`/geo/${stateId}/cities`).then((r) => r.data);
}

export const getPostcodesByCity = (cityId: number) =>{
    return instance.get<PostcodeResponse[]>(`/geo/${cityId}/postcodes`).then((r) => r.data);
}