import { HorseGraphData } from "./Types";

export const dataTemp: HorseGraphData = {
    domain: ["Jan", "Feb", "March", "April", "May", "June", "July", "August"],
    numElements: 3,
    values: [
        {
            name: "Microsoft",
            values: [101.12, 107.15, 110.28, 104.43, 112.34, 115.78, 120.43, 118.23],
            rankedPosition: [2, 2, 1, 2, 3, 1, 1, 2],
            colour: "blue"
        },
        {
            name: "Amazon",
            values: [112.21, 111.12, 110.12, 111.12, 114.52, 113.21, 119.20, 122.14],
            rankedPosition: [1, 1, 2, 1, 1, 3, 2, 1],
            colour: "red"
        },
        {
            name: "Facebook",
            values: [22.24, 50.23, 80.12, 90.12, 113.23, 115.16, 112.13, 114.55],
            rankedPosition: [3, 3, 3, 3, 2, 2, 3, 3],
            colour: "green"
        }
    ]
}