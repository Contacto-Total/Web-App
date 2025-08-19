export interface PlantillaRequest {
    name: string;
    template: string;
    tipis: string[];
}

export interface PlantillaToUpdateRequest {
    id: number;
    name: string;
    template: string;
    tipis: string[];
}

export interface PlantillaResponse {
    id: number;
    name: string;
    template: string;
    tipis: string;
}

export interface GenerateMessagesRequest {
    name: string;
    tipis: string[];
}