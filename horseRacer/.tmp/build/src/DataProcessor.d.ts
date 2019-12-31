import powerbi from "powerbi-visuals-api";
import { DataValue } from "./Types";
import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;
/**
 * Retrieving data from dataView
 * First for loop retrieves the domain
 * Second for loop retrieves the name and creates a new horse to store name, values and ranked position
 * Third for loop retrieves the values which will be stored in each new horse
 * A HorseGraphData object is created to store the information retrieved
 * That object will be sent to retrieve a rank and returned
 * @param dataView
 */
export declare const DataProcessor: (dataView: powerbi.DataView, colorPalette: ISandboxExtendedColorPalette, isAggregate: boolean, optionIndex: string) => {
    domain: any[];
    numElements: number;
    values: DataValue[];
};
