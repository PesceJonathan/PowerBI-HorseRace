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
export const DataProcessor = function(dataView: DataView, colorPalette: ISandboxExtendedColorPalette, isAggregate: boolean) {
    let domain = [];
    for (var i = 0; i < dataView.categorical.categories[0].values.length; i++) {
        domain.push(dataView.categorical.categories[0].values[i]);
    }
    let horses: DataValue[] = [];

    for (var i = 0; i < dataView.categorical.values.length; i++) {
        let values: number[] = [];
        
        let image: string = undefined;

        if (dataView.categorical.values[i].source.roles.images) {
            image = dataView.categorical.values[i].values[0] as string;
            i++;
        }

        for (var j = 0; j < dataView.categorical.values[i].values.length; j++) {
            if (isAggregate && j !== 0) {
                values.push(values[j-1] + (dataView.categorical.values[i].values[j] as number));
            } else {
                values.push(dataView.categorical.values[i].values[j] as number); 
            }
        }

        let name: string = dataView.categorical.values[i].source.groupName as string;

        let horse: DataValue = {
            name: name,
            colour: colorPalette.getColor(name).value,
            values: values,
            rankedPosition: [] as number[],
            image: image
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