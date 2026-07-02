import { instance } from "./axios";
import type { ApiResponse } from "./types";


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
    return instance.get<ApiResponse<StateResponse[]>>("/geo/states").then((r) => r.data.data);
}

export const getCitiesByState = (stateId: number) =>{
    return instance.get<ApiResponse<CityResponse[]>>(`/geo/${stateId}/cities`).then((r) => r.data.data);
}

export const getPostcodesByCity = (cityId: number) =>{
    return instance.get<ApiResponse<PostcodeResponse[]>>(`/geo/${cityId}/postcodes`).then((r) => r.data.data);
}