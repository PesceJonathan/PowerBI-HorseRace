import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import {GenerateRanks} from "./GenerateRanks";
import { DataValue } from "./Types";
import ISandboxExtendedColorPalette =  powerbi.extensibility.ISandboxExtendedColorPalette;

/**
 * Retrieving data from dataView 
 * First for loop retrieves the domain 
 * Second for loop retrieves the name and creates a new horse to store name, values and ranked position
 * Third for loop retrieves the values which will be stored in each new horse
 * A HorseGraphData object is created to store the information retrieved 
 * That object will be sent to retrieve a rank and returned 
 * @param dataView 
 */
export const DataProcessor = function(dataView: DataView, colorPalette: ISandboxExtendedColorPalette) {
    let domain = [];
    for (var i = 0; i < dataView.categorical.categories[0].values.length; i++) {
        domain.push(dataView.categorical.categories[0].values[i]);
    }
    let horses: DataValue[] = [];

    for (var i = 0; i < dataView.categorical.values.length; i++) {
        let values: number[] = [];
        for (var j = 0; j < dataView.categorical.values[i].values.length; j++) {
            values.push(dataView.categorical.values[i].values[j] as number); 
        }

        let name: string = dataView.categorical.values[i].source.groupName as string;

        let horse: DataValue = {
            name: name,
            colour: colorPalette.getColor(name).value,
            values: values,
            rankedPosition: [] as number[]
        }
        horses.push(horse);
    }

    let data = {
        domain: domain,
        numElements: dataView.categorical.values.length,
        values: horses
    };

    data.values = GenerateRanks(data);
    return data;
}