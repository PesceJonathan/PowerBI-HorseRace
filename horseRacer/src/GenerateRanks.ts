import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

export interface HorseGraphData {
    domain: string[];
    numElements: number;
    values: DataValue[];
}

export interface DataValue {
    name: string,
    values: number[],
    rankedPosition: number[],
}

/*
export const data: HorseGraphData = {
    domain: ["Jan", "Feb", "March", "April", "May", "June", "July", "August"],
    numElements: 3,
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


//**
 * Generating ranks for each domain based on the DataValue values 

 * @param data 
 */
export const GenerateRanks = (data: HorseGraphData) => {
    var rank:number = 0;
    var smallest:number = 0;
    var index:number = 0;
    var values = data.values;

    for (var i:number = 0; i < data.domain.length; i++) { //Shift DateValue values
        rank = values.length;
        while (rank > 0) { //Rank each value in DataValue values
            smallest = Infinity;
            index = 0;
            for (var j:number = 0; j < values.length; j++) { //Shift HorseGraphData values
                if(values[j].values[i] < smallest && !values[j].rankedPosition[i]) {
                    smallest = values[j].values[i];
                    index = j;
                }
            }
        values[index].rankedPosition[i] = rank--;
        }
    }
    return values;
}