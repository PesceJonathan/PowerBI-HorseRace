import * as d3 from "d3";
import { Line } from "d3";
import { DataValue, HorseGraphData, HorseInformation, Scales, setUpSettings } from "./Types";
import { VisualSettings } from "./settings";


export class HorseRaceGraph {
    "use strict"
    private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private horseElements: d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>;
    private yAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private horseStartCircles: d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>;
    private horseEndCircles: d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>;
    private clipPath: d3.Selection<SVGRectElement, unknown, HTMLElement, any>;
    private offScreenElementsClipPath: d3.Selection<SVGRectElement, unknown, HTMLElement, any>;
    private xAxisClipPath: d3.Selection<SVGRectElement, unknown, HTMLElement, any>;
    private transitionElement: d3.Transition<HTMLElement, unknown, null, undefined>;
    private rankNumber: d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>;
    private horseName: d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>;
    private elementsWithOffScreenComponent: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private imagesElements: d3.Selection<SVGImageElement, HorseInformation, SVGGElement, unknown>;

    private scales: Scales;
    private line: Line<any>;
    private transitionDuration: number;
    private currentDomainElement: number;
    private delayStartTime: number;
    private domainLength: number;
    private domain: string[];
    private startAndEndCircleRadius: number;
    private elementClicked: string;
    private numberOfElementsOnScreenAtOnce: number;
    private adjustedAxis: boolean;
    private height: number;
    private textFont: string;
    private data: HorseGraphData;
    private fontFamily: string;
    private rankAsValue: boolean;
    private structuredData: HorseInformation[];
    private minOffSet: number;
    private maxOffSet: number;
    private redraw: () => void;

    /**
     * Function that will render the horse racer visual onto the SVG and will
     * begin it's transformation.
     * 
     * @param {d3.Selection<SVGGElement, unknown, HTMLElement, any>} svg SVG element for the horse racer component to be appended onto 
     * @param {HorseGraphData} data The data that the horse racer visual will be representing 
     * @param {number} width The width of the screen
     * @param {number} height The height of the screen
     */
    public render(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, data: HorseGraphData, displaySettings: setUpSettings, settings: VisualSettings, width: number, height: number) {
        //Set up the variables
        this.transitionDuration = settings.overall.transitionDuration;
        this.currentDomainElement = 1;
        this.delayStartTime = settings.overall.delayTime;
        this.domainLength = data.domain.length;
        this.domain = data.domain;
        this.startAndEndCircleRadius = settings.data.dataSize;
        this.elementClicked = "";
        this.numberOfElementsOnScreenAtOnce = settings.overall.numberOfElementsOnAxis;
        this.textFont = settings.data.fontSize + "px";
        this.fontFamily = settings.data.fontFamily;
        this.adjustedAxis = settings.overall.dynamicYAxis;
        this.data = data;
        this.height = height;
        this.rankAsValue = settings.overall.displayValuesOnAxis;
        this.maxOffSet = 1.02;
        this.minOffSet = 0.98;

        //Bind the transition sequence function to this
        this.transitionSequence = this.transitionSequence.bind(this);
        this.onExitOfElement = this.onExitOfElement.bind(this);
        this.onHoverOfElement = this.onHoverOfElement.bind(this);

        d3.select("#horseGraph").remove();

        //Set up the graph elements i.e. axis, line function, scales
        this.setUpGraph(svg, data, settings.overall.displayValuesOnAxis, width, height);

        //Set up the data
        this.structuredData = this.generateStructuredData(data, settings.overall.displayValuesOnAxis);

        //Append the elements in the starting position
        this.SetUpInitialElements(this.structuredData, displaySettings);

        //Begin the transition of all the elements
        this.transitionElement = d3.transition()
            .delay(this.delayStartTime)
            .duration(this.transitionDuration)
            .on("start", this.transitionSequence);

        this.redraw = () => { this.render(svg, data, displaySettings, settings, width, height) }
    }

    private generateStructuredData(data: HorseGraphData, ranksAsValues: boolean) {
        if (ranksAsValues) {
            return data.values.map((elem: DataValue) => {
                return {
                    values: d3.zip(data.domain, elem.rankedPosition.map(x => "" + x)),
                    name: elem.name,
                    colour: elem.colour,
                    image: elem.image
                } as HorseInformation;
            });
        }

        return data.values.map((elem: DataValue) => {
            return {
                values: d3.zip(data.domain, elem.values.map(x => "" + x)),
                name: elem.name,
                colour: elem.colour,
                image: elem.image
            } as HorseInformation;
        });
    }

    /**
     * The function that will move all the elements based on the transition phase it is at
     */
    private transitionSequence() {
        if (this.adjustedAxis) {
            let oldYScale = this.scales.yScale;

            this.updateYScale(this.currentDomainElement, this.rankAsValue);
            this.updateYAxis();

            //Set up the line function
            this.line = d3.line<any>().x(d => this.scales.xScale(d[0])).y(d => this.scales.yScale(+d[1]));

            let tempLine = d3.line<any>().x(d => this.scales.xScale(d[0])
            ).y(d => {
                    if (this.domain.indexOf(d[0]) < this.currentDomainElement)
                        return oldYScale(+d[1]);

                    return this.scales.yScale(+d[1])}
            );

            this.horseElements.selectAll(".line")
                .attr("d", (d: HorseInformation) => tempLine(d.values));

            this.horseElements.selectAll(".line")
                .transition()
                .ease(d3.easeLinear)
                .duration(this.transitionDuration)
                .attr("d", (d: HorseInformation) => this.line(d.values));

                this.horseElements.selectAll(".followLine")
                .attr("d", (d: HorseInformation) => tempLine(this.getCurrentAndNextValue(d.values)));
        
                this.horseElements.selectAll(".followLine")
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(this.transitionDuration)
                    .attr("d", (d: HorseInformation) => this.line(this.getCurrentAndNextValue(d.values)));

        } else {
            this.horseElements.selectAll(".followLine")
            .attr("d", (d: HorseInformation) => this.line(this.getCurrentAndNextValue(d.values)));
    
            this.horseElements.selectAll(".followLine")
                .transition()
                .ease(d3.easeLinear)
                .duration(this.transitionDuration)
                .attr("d", (d: HorseInformation) => this.line(this.getCurrentAndNextValue(d.values)));
        }

        this.horseStartCircles
            .transition()
            .ease(d3.easeLinear)
            .duration(this.transitionDuration)
            .attr("cy", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[0][1])));

        if (this.imagesElements) {
            this.imagesElements
                .transition()
                .ease(d3.easeLinear)
                .duration(this.transitionDuration)
                .attr("x", (d: HorseInformation) => this.scales.xScale(d.values[this.currentDomainElement][0]))
                .attrTween("y", (d: HorseInformation) => this.getTweenFunction(d));
        } else {
            if (this.horseEndCircles) {
                this.horseEndCircles
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(this.transitionDuration)
                    .attr("cx", (d: HorseInformation) => this.scales.xScale(d.values[this.currentDomainElement][0]))
                    .attrTween("cy", (d: HorseInformation) => this.getTweenFunction(d));
            }

            if (this.rankNumber) {
                this.rankNumber
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(this.transitionDuration)
                    .text((d: HorseInformation) => Math.round(parseInt(d.values[this.currentDomainElement][1]))) //Round if it values being displayed
                    .attr("x", (d: HorseInformation) => this.scales.xScale(d.values[this.currentDomainElement][0]))
                    .attrTween("y", (d: HorseInformation) => this.getTweenFunction(d));
            }
        }

        this.clipPath
            .transition()
            .ease(d3.easeLinear)
            .duration(this.transitionDuration)
            .attr("width", this.scales.xScale(this.domain[this.currentDomainElement]));

        if (this.horseName) {
            this.horseName
                .transition()
                .ease(d3.easeLinear)
                .duration(this.transitionDuration)
                .attr("x", (d: HorseInformation) => this.scales.xScale(d.values[this.currentDomainElement][0]))
                .attrTween("y", (d: HorseInformation) => this.getTweenFunction(d));
        }

        this.currentDomainElement++;

        //Check if we need to move the screen to adjust for elements going off screen
        if (this.numberOfElementsOnScreenAtOnce <= this.currentDomainElement) {
            this.elementsWithOffScreenComponent.transition()
                .ease(d3.easeLinear)
                .duration(this.transitionDuration)
                .attr("transform", "translate(" + (-1 * this.scales.xScale(this.domain[this.currentDomainElement - this.numberOfElementsOnScreenAtOnce])) + ", 0)");

            //Move the clip path to follow
            this.offScreenElementsClipPath.transition()
                .duration(this.transitionDuration)
                .ease(d3.easeLinear)
                .attr("x", this.scales.xScale(this.domain[this.currentDomainElement - this.numberOfElementsOnScreenAtOnce]));
            
            this.xAxisClipPath.transition()
                .duration(this.transitionDuration)
                .ease(d3.easeLinear)
                .attr("x", this.scales.xScale(this.domain[this.currentDomainElement - this.numberOfElementsOnScreenAtOnce]));
        } 

        if (this.currentDomainElement < this.domainLength) {
            this.transitionElement = this.transitionElement.transition().on("start", this.transitionSequence);
        } else {
            setTimeout(this.redraw, this.transitionDuration + 5000);
        }

    }

    private getTweenFunction(d: HorseInformation) {
            var line: SVGPathElement = this.horseElements.filter((innerD) => (d.name === innerD.name)).node().getElementsByClassName("followLine")[0] as SVGPathElement;

            return (t) => { 
                return line.getPointAtLength(t * line.getTotalLength()).y + "";
             };
    }

    /**
     * Set up all the horse elements in their starting positions
     * 
     * @param data The data used to place the horse elements in their starting position
     */
    private SetUpInitialElements(data: HorseInformation[], displaySettings: setUpSettings) {
        this.horseElements = this.elementsWithOffScreenComponent.append("g").attr("clip-path", "url(#clipPathForMovableElements)")
            .selectAll(".horseElement")
            .data(data)
            .enter()
            .append("g")
            .classed("horseElement", true);


        //Append the paths
        this.horseElements
            .append("path")
            .attr("class", "line")
            .attr("d", (d: HorseInformation) => this.line(d.values))
            .style("stroke", (d: HorseInformation) => d.colour)
            .style("stroke-width", 5)
            .style("fill", "none")
            .attr("clip-path", "url(#clipPathElement)")
            .on("mouseover", (d: HorseInformation) => this.onHoverOfElement(d.name))
            .on("mouseout", this.onExitOfElement)
            .on("click", (d: HorseInformation) => this.onClick(d.name));

            this.horseElements
                .append("path")
                .attr("class", "followLine")
                .attr("d", (d: HorseInformation) => this.line(this.getCurrentAndNextValue(d.values)))
                .style("visibility", "hidden");
            

        //Append the circles to the starting positions
        let startRadius = this.startAndEndCircleRadius;
        if (startRadius >= 7) {
            startRadius = 7;
        }

        this.horseStartCircles = this.appendHorseDots(0, this.horseElements, startRadius);

        if (displaySettings.displayImages) {
            this.imagesElements = this.horseElements.append('image')
                .attr('xlink:href', (d: HorseInformation) => d.image)
                .attr('width', this.startAndEndCircleRadius * 4)
                .attr('height', this.startAndEndCircleRadius * 4)
                .attr("transform", "translate(0, " + this.startAndEndCircleRadius * -2 + ")")
                .attr("x", (d: HorseInformation) => this.scales.xScale(d.values[0][0]))
                .attr("y", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[0][1])))
                .on("mouseover", (d: HorseInformation) => this.onHoverOfElement(d.name))
                .on("mouseout", this.onExitOfElement)
                .on("click", (d: HorseInformation) => this.onClick(d.name));
        } else {
            this.horseEndCircles = this.appendHorseDots(0, this.horseElements, this.startAndEndCircleRadius * 3);
        }

        if (displaySettings.displayRank && !displaySettings.displayImages) {
            //Append the rank into the circle
            this.rankNumber = this.horseElements.append("text")
                .text((d: HorseInformation) => Math.round(parseInt(d.values[0][1])))
                .attr("x", (d: HorseInformation) => this.scales.xScale(d.values[0][0]))
                .attr("y", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[0][1])))
                .attr("font-weight", "bold")
                .attr("fill", "white")
                .attr("dy", parseInt(this.textFont.substr(0, this.textFont.length - 2)) * 0.25)
                .attr("text-anchor", "middle")
                .style("font-family", this.fontFamily)
                .style("font-size", this.textFont)
                .on("mouseover", (d: HorseInformation) => this.onHoverOfElement(d.name))
                .on("mouseout", this.onExitOfElement)
                .on("click", (d: HorseInformation) => this.onClick(d.name));
        }

        if (displaySettings.displayName) {
            this.horseName = this.horseElements.append("text")
                .text((d: HorseInformation) => d.name)
                .attr("transform", "translate(" + this.startAndEndCircleRadius * 4 + ", 0)")
                .attr("x", (d: HorseInformation) => this.scales.xScale(d.values[0][0]))
                .attr("y", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[0][1])))
                .attr("font-weight", "bold")
                .attr("fill", (d: HorseInformation) => d.colour)
                .attr("dy", parseInt(this.textFont.substr(0, this.textFont.length - 2)) / 2)
                .style("font-size", this.textFont)
                .style("font-family", this.fontFamily)
                .on("mouseover", (d: HorseInformation) => this.onHoverOfElement(d.name))
                .on("mouseout", this.onExitOfElement)
                .on("click", (d: HorseInformation) => this.onClick(d.name));
        }

        //Set up the clip path to hide all lines at the start and the span the entire height of the graph
        this.clipPath = this.svg.append("clipPath")
            .attr("id", "clipPathElement")
            .append("rect")
            .attr("x", this.scales.xScale(data[0].values[0][0]))
            .attr("y", -this.scales.yScale(data.length) * 0.15)
            .attr("height", this.scales.yScale(data.length) * 1.3)
            .attr("width", 0);
    }

    private getCurrentAndNextValue(values: string[][]) {
        let neededValues: string[][] = [];
        neededValues.push(values[this.currentDomainElement - 1]);
        neededValues.push(values[this.currentDomainElement]);

        return neededValues;
    }

    /**
     * Append circles into the given selection
     * 
     * @param {number} xPos Starting xPos of the 
     * @param {d3.Selection} horseElements The selection on which to append the cirlces too
     * @param {number} radius The radius size of the circles
     */
    private appendHorseDots(xPos: number, horseElements: d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown>, radius: number): d3.Selection<SVGGElement, HorseInformation, SVGGElement, unknown> {
        return horseElements.append("circle")
            .attr("cx", (d: HorseInformation) => this.scales.xScale(d.values[xPos][0]))
            .attr("cy", (d: HorseInformation) => this.scales.yScale(parseInt(d.values[xPos][1])))
            .attr("r", radius)
            .attr("fill", (d: HorseInformation) => d.colour)
            .attr("stroke", "black")
            .on("mouseover", (d: HorseInformation) => this.onHoverOfElement(d.name))
            .on("mouseout", this.onExitOfElement)
            .on("click", (d: HorseInformation) => this.onClick(d.name));
    }

    /**
     * Event handler dealing with the onhover event, being to change the opacity of all lines
     * except for the one being hovered (only works when no item is clicked)
     * 
     * @param name Name of the element that was clicked
     */
    private onHoverOfElement(name: string) {
        if (this.elementClicked === "")
            this.changeOpacity(name);
    }

    /**
     * Event handler dealing with the exit of the hovering of an element, chaning all of the 
     * opacities of the lines back to normal.
     */
    private onExitOfElement() {
        if (this.elementClicked === "")
            this.horseElements.style("opacity", 1);
    }

    /**
     * Event handler that will select and deselect an element when it has been clicked
     * 
     * @param name Name of the element that was clicked
     */
    private onClick(name: string) {
        if (this.elementClicked === name) {
            this.elementClicked = "";
            this.horseElements.style("opacity", 1);
        } else {
            this.elementClicked = name;
            this.changeOpacity(name);
        }
    }

    private changeOpacity(name: string) {
        this.horseElements.style("opacity", 0.2);
        this.horseElements.filter((d) => (d.name === name)).style("opacity", 1);
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
    private setUpGraph(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, data: HorseGraphData, rankAsValues: boolean, width: number, height: number) {
        const margin = { top: 20, right: 100, bottom: 20, left: 50 };

        this.svg = svg.attr("height", height + margin.top + margin.bottom)
            .attr("width", width + margin.right + margin.left)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("id", "horseGraph");

        this.height = height - margin.top - margin.bottom;
        this.scales = this.createScale(data, rankAsValues, width - margin.left - margin.right, height - margin.top - margin.bottom);
        this.generateAxis(this.svg, this.scales, data.values.length);

        //Add the clippath element for the movable elements
        if (rankAsValues) {
            this.offScreenElementsClipPath = this.elementsWithOffScreenComponent.append("clipPath")
            .attr("id", "clipPathForMovableElements")
            .append("rect")
            .attr("x", -margin.left)
            .attr("width", width + margin.left)
            .attr("y", -margin.top)
            .attr("height", height + margin.top);
        } else {
            this.offScreenElementsClipPath = this.elementsWithOffScreenComponent.append("clipPath")
            .attr("id", "clipPathForMovableElements")
            .append("rect")
            .attr("x", -margin.left)
            .attr("width", width + margin.left)
            .attr("y", 0)
            .attr("height", height + margin.top);
        }

            
        this.xAxisClipPath = this.elementsWithOffScreenComponent
            .append("clipPath")
            .attr("id", "xAxisClipPathElement")
            .append("rect")
            .attr("x", -margin.left)
            .attr("width", width + margin.left)
            .attr("y", -margin.top)
            .attr("height", height + margin.top);
        
        this.svg
            .append("clipPath")
            .attr("id", "yAxisClipPathElement")
            .append("rect")
            .attr("x", -margin.left)
            .attr("width", width + margin.left)
            .attr("y", -5)
            .attr("height", height + margin.top);

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
    private createScale(data: HorseGraphData, rankAsValues: boolean, width: number, height: number): Scales {
        //Calculate an adjusted width for when only a certain number of elements should be on screen
        let adjustedWidth = (data.domain.length / this.numberOfElementsOnScreenAtOnce) * width;

        //We assume for now that the x-axis will be based on dates (since it is a horse race)
        var xScale = d3.scalePoint().domain(data.domain)
            .range([0, adjustedWidth]);

        //Create the y scale, which will for now be based on ranks (linear numbers)
        var yScale;
        if (rankAsValues) {
            yScale = d3.scaleLinear().domain([0.5, data.values.length + 0.5])
                .range([0, height]);
        } else {

            if (this.adjustedAxis) {
                yScale = d3.scaleLinear()
                    .domain([d3.max(this.data.values, (d: DataValue) => d.values[0] * this.maxOffSet), d3.min(this.data.values, (d: DataValue) => d.values[0]) * this.minOffSet])
                    .range([0, this.height]);
            } else {
                yScale = d3.scaleLinear().domain(this.getMinAndMax(data, this.maxOffSet, this.minOffSet))
                    .range([0, height]);
            }
        }
        return {
            xScale: xScale,
            yScale: yScale
        };
    }

    /**
     * Retrieves the min and the max value of the data set and returns them as an
     * array with the first value being the max and the second being the min
     */
    private getMinAndMax(data: HorseGraphData, maxOffSet: number, minOffSet: number): number[] {
        let min = d3.min(data.values, (d: DataValue) => d3.min(d.values));
        let max = d3.max(data.values, (d: DataValue) => d3.max(d.values));

        return [max * maxOffSet, min * minOffSet];
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

        //Append the y-axis first so that it appears behind the line elements
        this.yAxis = svg.append("g")
            .attr("class", "yAxis")
            .style("color", colour)
            .call(d3.axisLeft(scales.yScale).ticks(numberOfElemets - 1))
            .attr("clip-path", "url(#yAxisClipPathElement)");

        //Now generate the elements off screen group, so all the lines will appear above the x-axis (will be under x-axis in DOM)
        this.elementsWithOffScreenComponent = this.svg.append("g");

        this.elementsWithOffScreenComponent.append("g")
            .attr("class", "xAxis")
            .style("color", colour)
            .call(d3.axisTop(scales.xScale))
            .attr("clip-path", "url(#xAxisClipPathElement)");

    }

    private updateYAxis() {
        this.yAxis.transition()
            .ease(d3.easeLinear)
            .duration(this.transitionDuration)
            .call(d3.axisLeft(this.scales.yScale).ticks(10));
    }

    private updateYScale(elementAtTheDomain: number, rankAsValue: boolean) {
        let max = d3.max(this.structuredData, (d: HorseInformation) => +d.values[elementAtTheDomain][1]);
        let min = d3.min(this.structuredData, (d: HorseInformation) => +d.values[elementAtTheDomain][1]);
        let maxMin;

        if (rankAsValue) {
            maxMin = [min - 0.5, max + 0.5];
        } else {
            maxMin = [max *  this.maxOffSet, min * this.minOffSet];
        }

        this.scales.yScale = d3.scaleLinear()
            .domain(maxMin)
            .range([0, this.height]);
    }
}