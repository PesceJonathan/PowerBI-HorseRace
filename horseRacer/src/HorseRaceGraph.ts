import * as d3 from "d3";
import { Line } from "d3";
import { DataValue, HorseGraphData, HorseInformation, Scales } from "./Types";


export class HorseRaceGraph {
    "use strict"
    private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private scales: Scales;
    private line: Line<any>;
    private horseElements: d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>;
    private horseEndCircles:  d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>;
    private transitionDuration: number;
    private currentDomainElement: number;
    private delayStartTime: number;
    private transitionElement: d3.Transition<HTMLElement, unknown, null, undefined>;
    private domainLength: number;
    private clipPath: d3.Selection<SVGRectElement, unknown, HTMLElement, any>;
    private domain: string[];
    private startAndEndCircleRadius: number;
    private rankNumber: d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>;
    private horseName: d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>;

    /**
     * Function that will render the horse racer visual onto the SVG and will
     * begin it's transformation.
     * 
     * @param {d3.Selection<SVGGElement, unknown, HTMLElement, any>} svg SVG element for the horse racer component to be appended onto 
     * @param {HorseGraphData} data The data that the horse racer visual will be representing 
     * @param {number} width The width of the screen
     * @param {number} height The height of the screen
     */
    public render(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, data: HorseGraphData, width: number, height: number) {
        //Set up the variables
        this.transitionDuration = 2000;
        this.currentDomainElement = 1;
        this.delayStartTime = 300;
        this.domainLength = data.domain.length;
        this.domain = data.domain;
        this.startAndEndCircleRadius = 4;

        //Bind the transition sequence function to this
        this.transitionSequence = this.transitionSequence.bind(this);

        //Set up the graph elements i.e. axis, line function, scales
        this.setUpGraph(svg, data, width, height);

        //Set up the data
        let structuredData: HorseInformation[] = data.values.map((elem: DataValue) => {
            return {
                values: d3.zip(data.domain, elem.rankedPosition.map(x => "" + x)),
                name: elem.name,
                colour: elem.colour
            } as HorseInformation;
        });

        //Append the elements in the starting position
        this.SetUpInitialElements(structuredData);

        //Begin the transition of all the elements
        this.transitionElement = d3.transition()
                                .delay(this.delayStartTime)
                                .duration(this.transitionDuration)
                                .on("start", this.transitionSequence);
    }

    /**
     * The function that will move all the elements based on the transition phase it is at
     */
    private transitionSequence() {
        this.horseEndCircles
            .transition()
            .ease(d3.easeLinear)
            .duration(this.transitionDuration)
            .attr("cx", (d: HorseInformation) => this.scales.xScale(d.values[this.currentDomainElement][0]))
            .attr("cy", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[this.currentDomainElement][1])));


        this.clipPath
            .transition()
            .ease(d3.easeLinear)
            .duration(this.transitionDuration)
            .attr("width", this.scales.xScale(this.domain[this.currentDomainElement]));

        this.rankNumber
            .transition()
            .ease(d3.easeLinear)
            .duration(this.transitionDuration)
            .text((d: HorseInformation) => d.values[this.currentDomainElement][1])
            .attr("x", (d: HorseInformation) => this.scales.xScale(d.values[this.currentDomainElement][0]))
            .attr("y", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[this.currentDomainElement][1])));

        this.horseName 
            .transition()
            .ease(d3.easeLinear)
            .duration(this.transitionDuration)
            .attr("x", (d: HorseInformation) => this.scales.xScale(d.values[this.currentDomainElement][0]))
            .attr("y", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[this.currentDomainElement][1])));
        
        this.currentDomainElement++;

        if (this.currentDomainElement < this.domainLength) 
            this.transitionElement = this.transitionElement.transition().on("start", this.transitionSequence);
    }

    /**
     * Set up all the horse elements in their starting positions
     * 
     * @param data The data used to place the horse elements in their starting position
     */
    private SetUpInitialElements(data: HorseInformation[]) {
        this.horseElements = this.svg.selectAll(".horseElement")
            .data(data)
            .enter()
            .append("g")
            .classed("horseElement", true); 

        //Append the paths
        this.horseElements
            .append("path")
            .attr("class", "line")
            .attr("d", (d: HorseInformation) => this.line(d.values))
            .style("stroke", (d : HorseInformation) => d.colour)
            .style("fill", "none")
            .attr("clip-path", "url(#clipPathElement)");
        

        //Append the circles to the starting positions
        this.appendHorseDots(0, this.horseElements, this.startAndEndCircleRadius);
        this.horseEndCircles = this.appendHorseDots(0, this.horseElements, this.startAndEndCircleRadius * 3);

        //Append the rank into the circle
        this.rankNumber = this.horseElements.append("text")
            .text((d: HorseInformation) => d.values[0][1])
            .attr("x", (d: HorseInformation) => this.scales.xScale(d.values[0][0]))
            .attr("y", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[0][1])))
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .attr("dy", "0.3em")
            .attr("text-anchor", "middle");

        this.horseName = this.horseElements.append("text")
            .text((d: HorseInformation) => d.name)
            .attr("transform", "translate(" + this.startAndEndCircleRadius * 4 + ", 0)")
            .attr("x", (d: HorseInformation) => this.scales.xScale(d.values[0][0]))
            .attr("y", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[0][1])))
            .attr("font-weight", "bold")
            .attr("fill", (d: HorseInformation) => d.colour)
            .attr("dy", "0.3em");

        //Set up the clip path to hide all lines at the start and the span the entire height of the graph
        this.clipPath = this.svg.append("clipPath")
                            .attr("id", "clipPathElement")
                            .append("rect")
                            .attr("x", this.scales.xScale(data[0].values[0][0]))
                            .attr("y", -10)
                            .attr("height", this.scales.yScale(data.length) + 10)
                            .attr("width", 0);
    }

    /**
     * Append circles into the given selection
     * 
     * @param {number} xPos Starting xPos of the 
     * @param {d3.Selection} horseElements The selection on which to append the cirlces too
     * @param {number} radius The radius size of the circles
     */
    private appendHorseDots(xPos: number, horseElements: d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>, radius: number): d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>{
        return horseElements.append("circle")
                .attr("cx", (d: HorseInformation) => this.scales.xScale(d.values[xPos][0]))
                .attr("cy", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[xPos][1])))
                .attr("r", radius)
                .attr("fill", (d: HorseInformation) => d.colour)
                .attr("stroke", "black");
    }

    /** 
     * The function will set up the graph before the lines are to be drawn. This means it will take care
     * of creating the scales of the graph, creating the axis and displaying them on screen.
     * 
     * @param svg 
     * @param data 
     * @param width 
     * @param height 
     */
    private setUpGraph(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, data: HorseGraphData, width: number, height: number) {
        const margin = { top: 20, right: 100, bottom: 20, left: 50 };

        this.svg = svg.attr("height", height + margin.top + margin.bottom)
            .attr("width", width + margin.right + margin.left)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.scales = this.createScale(data, width - margin.left - margin.right, height - margin.top - margin.bottom);
        this.generateAxis(this.svg, this.scales, data.rankPositions);
        
        //Set up the line function
        this.line = d3.line<any>().x(d => this.scales.xScale(d[0])).y(d => this.scales.yScale(+d[1]));
    }


    /**
     * Given the data, width and height of the svg, the function will generate a Scales datatype, containing
     * a scale for the x-axis and one for the y-axis.
     * 
     * @param data Data that the graph will be representing
     * @param width The width of the svg element
     * @param height The height of the svg element
     */
    private createScale(data: HorseGraphData, width: number, height: number): Scales {
        //We assume for now that the x-axis will be based on dates (since it is a horse race)
        var xScale = d3.scalePoint().domain(data.domain)
            .range([0, width]);

        //Create the y scale, which will for now be based on ranks (linear numbers)
        var yScale = d3.scaleLinear().domain([1, data.values.length])
            .range([0, height]).nice();

        return {
            xScale: xScale,
            yScale: yScale
        };
    }

    /**
     * Draws the axis to the screen, using the scales that are given.
     * 
     * @param svg SVG that the scales are to be added to
     * @param scales The scales that are used for the axis
     * @param numberOfElemets The number of elements in the Y-Axis
     */
    private generateAxis(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, scales: Scales, numberOfElemets: number) {
        let colour = "black";

        svg.append("g")
            .attr("class", "yAxis")
            .style("color", colour)
            .call(d3.axisLeft(scales.yScale).ticks(numberOfElemets - 1));

        svg.append("g")
            .attr("class", "xAxis")
            .style("color", colour)
            .call(d3.axisTop(scales.xScale));
    }

    private getIntegerTicks(element) {
        if (Math.floor(element) === element)
            return element;
        
        return;
    }
}