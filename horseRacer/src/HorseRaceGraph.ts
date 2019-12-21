import { DataValue, HorseGraphData, dataTemp} from "./tempData"; 
import * as d3 from "d3";
import { Line } from "d3";


export class HorseRaceGraph {
    "use strict"
    private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private scales: Scales;
    private line: Line<any>;

    public render(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, data: HorseGraphData, width: number, height: number) {
        this.setUpGraph(svg, dataTemp, width, height);
        this.drawPaths(dataTemp);
        this.drawInitialDots(dataTemp, this.scales, 0);
        this.moveTheDots(data, this.scales, 1);
    }

    private drawInitialDots(data: HorseGraphData, scales: Scales, domainNumber: number) {
        var initialDots = this.svg.selectAll(".dots").data(data.values).attr("class", "dots");
        
        initialDots.enter()
            .append("circle")
            .classed("dots", true)
            .attr("r", 10)
            .attr("cx", scales.xScale(data.domain[domainNumber]))
            .attr("cy", (d,i) => scales.yScale(d.rankedPosition[domainNumber]))
            .attr("fill", (d,i) => d.colour)
            .attr("stroke", "black");
    }

    private moveTheDots(data: HorseGraphData, scales: Scales, domainNumber: number) {
        debugger;
        let initialDots = this.svg.selectAll(".dots").data(data.values).attr("class", "dots");

        let promise: Promise<void> = initialDots.transition()
        .duration(1000)
        .attr("cx", scales.xScale(data.domain[domainNumber]))
        .attr("cy", (d,i) => scales.yScale(d.rankedPosition[domainNumber]))
        .end();

        if (data.domain.values.length <= domainNumber) 
            promise.then(() => this.moveTheDots(data, scales, domainNumber++));
    }

    private drawPaths(data: HorseGraphData) {
        let paths = this.svg.selectAll(".line")
        //@ts-ignore
            .data(data.values.map(d => d3.zip(data.domain, d.rankedPosition)))
            .attr("class", "line");

        paths.enter()
            .append("path")
            .attr("class","line")
            .attr("d", this.line)
            .attr("stroke", "red")
            .attr("fill", "none");
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
        const margin = { top: 20, right: 20, bottom: 20, left: 50 };

        this.svg = svg.attr("height", height)
            .attr("width", width)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.right + ")");

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
        var yScale = d3.scaleLinear().domain([data.values.length, 1])
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
            .call(d3.axisLeft(scales.yScale).ticks(numberOfElemets));

        svg.append("g")
            .attr("class", "xAxis")
            .style("color", colour)
            .call(d3.axisTop(scales.xScale));
    }
}


interface Scales {
    xScale: d3.ScalePoint<string>,
    yScale: d3.ScaleLinear<number, number>
}