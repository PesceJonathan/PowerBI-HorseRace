import { Color, color } from "d3";

export interface HorseGraphData {
    domain: string[];
    numElements: number;
    values: DataValue[];
}

export interface HorseInformation {
    values: string[][];
    colour: string;
    name: string;
    img?: string;
}

export interface DataValue {
    name: string,
    values: number[],
    rankedPosition: number[],
    colour: string
}

export interface Point {
    x: number,
    y: number
}

export interface Scales {
    xScale: d3.ScalePoint<string>,
    yScale: d3.ScaleLinear<number, number>
}

export interface setUpSettings {
    displayImages: boolean,
    displayRank: boolean
}