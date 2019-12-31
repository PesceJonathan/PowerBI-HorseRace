export interface HorseGraphData {
    domain: string[];
    numElements: number;
    values: DataValue[];
    image?: string;
}
export interface HorseInformation {
    values: string[][];
    colour: string;
    name: string;
    image: string | undefined;
}
export interface DataValue {
    name: string;
    values: number[];
    rankedPosition: number[];
    colour: string;
    image?: string;
}
export interface Point {
    x: number;
    y: number;
}
export interface Scales {
    xScale: d3.ScalePoint<string>;
    yScale: d3.ScaleLinear<number, number>;
}
export interface setUpSettings {
    displayImages: boolean;
    displayRank: boolean;
    displayName: boolean;
}
