import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class VisualSettings extends DataViewObjectsParser {
    data: Data;
    overall: Overall;
}
export declare class Data {
    fontSize: number;
    dataSize: number;
    lineThickness: number;
    fontFamily: string;
    displayText: boolean;
    displayRank: boolean;
    aggregateValues: boolean;
}
export declare class Overall {
    displayValuesOnAxis: boolean;
    transitionDuration: number;
    delayTime: number;
    numberOfElementsOnAxis: number;
    dynamicYAxis: boolean;
}
