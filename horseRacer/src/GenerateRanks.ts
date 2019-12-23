import powerbi from "powerbi-visuals-api";
import { HorseGraphData } from "./Types";
/**
 * Generating ranks for each domain based on the DataValue values 
 * 
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