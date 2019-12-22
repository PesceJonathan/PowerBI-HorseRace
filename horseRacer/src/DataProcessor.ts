import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import {GenerateRanks, DataValue} from "./GenerateRanks";


export const DataProcessor = function(dataView: DataView) {
    let domain = [];
    for (var i = 0; i < dataView.categorical.categories[0].values.length; i++) {
        domain.push(dataView.categorical.categories[0].values[i]);
    }

    let ranks: number[] = [];
    let horses: DataValue[] = [];

    for (var i = 0; i < dataView.categorical.values.length; i++) {
        let values: number[] = [];
        for (var j = 0; j < dataView.categorical.values[i].values.length; j++) {
            values.push(dataView.categorical.values[i].values[j] as number); 
        }

        let horse: DataValue = {
            name: dataView.categorical.values[i].source.groupName as string,
            values: values,
            rankedPosition: ranks
        }
        horses.push(horse);
    }

    let data = {
        domain: domain,
        numElements: dataView.categorical.values.length,
        values: horses
    }

    return GenerateRanks(data);
}