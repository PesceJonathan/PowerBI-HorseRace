import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var horseRacer12E3AC64AD4242BC8735CBDF9617D71F_DEBUG: IVisualPlugin = {
    name: 'horseRacer12E3AC64AD4242BC8735CBDF9617D71F_DEBUG',
    displayName: 'HorseRacer',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options?: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["horseRacer12E3AC64AD4242BC8735CBDF9617D71F_DEBUG"] = horseRacer12E3AC64AD4242BC8735CBDF9617D71F_DEBUG;
}

export default horseRacer12E3AC64AD4242BC8735CBDF9617D71F_DEBUG;