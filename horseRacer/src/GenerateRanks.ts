export interface HorseGraphData {
    domain: string[];
    rankPositions: number;
    values: DataValue[];
}

export interface DataValue {
    name: string,
    values: number[],
    rankedPosition: number[],
}

export const data: HorseGraphData = {
    domain: ["Jan", "Feb", "March", "April", "May", "June", "July", "August"],
    rankPositions: 3,
    values: [
        {
            name: "Microsoft",
            values: [101.12, 107.15, 110.28, 104.43, 112.34, 115.78, 120.43, 118.23],
            rankedPosition: []
        },
        {
            name: "Amazon",
            values: [112.21, 111.12, 110.12, 111.12, 114.52, 113.21, 119.20, 122.14],
            rankedPosition: []
        },
        {
            name: "Facebook",
            values: [22.24, 50.23, 80.12, 90.12, 113.23, 115.16, 112.13, 114.55],
            rankedPosition: []
        }
    ]
}

export const GenerateRanks = () => {
    console.log("Hello World");
}