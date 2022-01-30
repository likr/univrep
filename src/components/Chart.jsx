import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

export default function Chart({ data: inputData }) {
  const displayCount = 5;
  const wrapperRef = useRef();
  const svgRef = useRef();
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [scrollOffset, setScrollOffset] = useState(
    displayCount - inputData.universities.length + 1
  );
  const [grabbing, setGrabbing] = useState(false);

  const chartHeight = 600;
  const margin = {
    top: 0,
    right: 10,
    bottom: 200,
    left: 10,
  };
  const contentWidth = screenSize.width - margin.right - margin.left;
  const contentHeight = screenSize.height - margin.top - margin.bottom;

  const data = useMemo(() => {
    const xScale = d3
      .scaleLinear()
      .domain([0, inputData.dates.length - 1])
      .range([0, contentWidth]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(inputData.universities, ({ count }) => d3.max(count))])
      .range([0, chartHeight]);

    const data = inputData.universities.map(({ name, count }, i) => {
      return {
        name,
        total: d3.sum(count),
        count: count.map((item, j) => {
          return {
            x: xScale(j),
            y: -yScale(item),
          };
        }),
      };
    });
    data.sort((a, b) => b.total - a.total);

    return data;
  }, [inputData, contentWidth, chartHeight]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setScreenSize({
        width: wrapperRef.current.offsetWidth,
        height: wrapperRef.current.offsetHeight,
      });
    });
    resizeObserver.observe(wrapperRef.current);
    setScreenSize({
      width: wrapperRef.current.offsetWidth,
      height: wrapperRef.current.offsetHeight,
    });
  }, []);

  useEffect(() => {
    const drag = d3
      .drag()
      .on("start", () => {
        setGrabbing(true);
      })
      .on("drag", (event) => {
        if (event.dy > 0) {
          setScrollOffset((scrollOffset) =>
            Math.min(displayCount, scrollOffset + 0.1)
          );
        } else if (event.dy < 0) {
          setScrollOffset((scrollOffset) =>
            Math.max(
              displayCount - inputData.universities.length + 1,
              scrollOffset - 0.1
            )
          );
        }
      })
      .on("end", () => {
        setGrabbing(false);
      });
    d3.select(svgRef.current).call(drag);
  }, [inputData, displayCount]);

  const chartYScale = d3
    .scaleLinear()
    .domain([-1, displayCount])
    .range([0, contentHeight]);
  const chartSizeScale = d3
    .scaleLinear()
    .domain([-1, displayCount])
    .range([0, 1]);

  return (
    <>
      <div ref={wrapperRef} className="wrapper">
        <svg
          ref={svgRef}
          className={grabbing ? "grabbing" : ""}
          width={contentWidth + margin.left + margin.right}
          height={contentHeight + margin.top + margin.bottom}
        >
          <g
            transform={`translate(${margin.left + contentWidth / 2},${
              margin.top
            })`}
          >
            <g>
              {[...Array(6)].map((_, i) => {
                return (
                  <line
                    key={i}
                    x1="0"
                    y1="0"
                    x2={(2 * contentWidth * i) / 5 - contentWidth}
                    y2={contentHeight * 2}
                    stroke="#444"
                  />
                );
              })}
            </g>
            <g>
              {data.map((university, i) => {
                const area = d3
                  .area()
                  .x((d) => d.x)
                  .y1((d) => d.y)
                  .y0(0)
                  .curve(d3.curveCardinal);
                return (
                  <g
                    key={university.name}
                    transform={`translate(0,${chartYScale(
                      i + scrollOffset
                    )})scale(${Math.max(
                      0,
                      chartSizeScale(i + scrollOffset)
                    )})translate(${-contentWidth / 2},0)`}
                    opacity={chartSizeScale(i + scrollOffset) > 1 ? 0.2 : 1}
                  >
                    <g>
                      <path
                        d={area(university.count)}
                        fill="red"
                        fillOpacity="0.3"
                        stroke="red"
                      />
                      <text
                        x={contentWidth / 2}
                        y="-5"
                        textAnchor="middle"
                        dominantBaseline="text-after-edge"
                        fill="#fff"
                        fontWeight="bold"
                        fontSize="20"
                      >
                        {i + 1}位 {university.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
            <g>
              {[...Array(5)].map((_, i) => {
                return (
                  <text
                    key={i}
                    x={
                      (contentWidth * i) / 5 -
                      contentWidth / 2 +
                      contentWidth / 10
                    }
                    y={contentHeight + 10}
                    textAnchor="middle"
                    dominantBaseline="text-before-edge"
                    fill="#ccc"
                    fontFamily="'Noto Serif JP', serif"
                    fontWeight="bold"
                  >
                    {2017 + i}
                  </text>
                );
              })}
            </g>
          </g>
        </svg>
      </div>
    </>
  );
}
