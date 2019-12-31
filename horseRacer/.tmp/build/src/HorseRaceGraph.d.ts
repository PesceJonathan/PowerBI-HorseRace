import * as d3 from "d3";
import { HorseGraphData, setUpSettings } from "./Types";
import { VisualSettings } from "./settings";
export declare class HorseRaceGraph {
    "use strict": any;
    private svg;
    private horseElements;
    private yAxis;
    private horseStartCircles;
    private horseEndCircles;
    private clipPath;
    private offScreenElementsClipPath;
    private xAxisClipPath;
    private transitionElement;
    private rankNumber;
    private horseName;
    private elementsWithOffScreenComponent;
    private imagesElements;
    private scales;
    private line;
    private transitionDuration;
    private currentDomainElement;
    private delayStartTime;
    private domainLength;
    private domain;
    private startAndEndCircleRadius;
    private elementClicked;
    private numberOfElementsOnScreenAtOnce;
    private adjustedAxis;
    private height;
    private textFont;
    private data;
    private fontFamily;
    private rankAsValue;
    private structuredData;
    private minOffSet;
    private maxOffSet;
    private redraw;
    /**
     * Function that will render the horse racer visual onto the SVG and will
     * begin it's transformation.
     *
     * @param {d3.Selection<SVGGElement, unknown, HTMLElement, any>} svg SVG element for the horse racer component to be appended onto
     * @param {HorseGraphData} data The data that the horse racer visual will be representing
     * @param {number} width The width of the screen
     * @param {number} height The height of the screen
     */
    render(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, data: HorseGraphData, displaySettings: setUpSettings, settings: VisualSettings, width: number, height: number): void;
    private generateStructuredData;
    /**
     * The function that will move all the elements based on the transition phase it is at
     */
    private transitionSequence;
    private getTweenFunction;
    /**
     * Set up all the horse elements in their starting positions
     *
     * @param data The data used to place the horse elements in their starting position
     */
    private SetUpInitialElements;
    private getCurrentAndNextValue;
    /**
     * Append circles into the given selection
     *
     * @param {number} xPos Starting xPos of the
     * @param {d3.Selection} horseElements The selection on which to append the cirlces too
     * @param {number} radius The radius size of the circles
     */
    private appendHorseDots;
    /**
     * Event handler dealing with the onhover event, being to change the opacity of all lines
     * except for the one being hovered (only works when no item is clicked)
     *
     * @param name Name of the element that was clicked
     */
    private onHoverOfElement;
    /**
     * Event handler dealing with the exit of the hovering of an element, chaning all of the
     * opacities of the lines back to normal.
     */
    private onExitOfElement;
    /**
     * Event handler that will select and deselect an element when it has been clicked
     *
     * @param name Name of the element that was clicked
     */
    private onClick;
    private changeOpacity;
    /**
     * The function will set up the graph before the lines are to be drawn. This means it will take care
     * of creating the scales of the graph, creating the axis and displaying them on screen.
     *
     * @param svg
     * @param data
     * @param width
     * @param height
     */
    private setUpGraph;
    /**
     * Given the data, width and height of the svg, the function will generate a Scales datatype, containing
     * a scale for the x-axis and one for the y-axis.
     *
     * @param data Data that the graph will be representing
     * @param width The width of the svg element
     * @param height The height of the svg element
     */
    private createScale;
    /**
     * Retrieves the min and the max value of the data set and returns them as an
     * array with the first value being the max and the second being the min
     */
    private getMinAndMax;
    /**
     * Draws the axis to the screen, using the scales that are given.
     *
     * @param svg SVG that the scales are to be added to
     * @param scales The scales that are used for the axis
     * @param numberOfElemets The number of elements in the Y-Axis
     */
    private generateAxis;
    private updateYAxis;
    private updateYScale;
}
