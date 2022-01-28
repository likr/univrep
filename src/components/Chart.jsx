import { useMemo } from "react";
import * as d3 from "d3";

export default function Chart({ data: inputData }) {
  const contentWidth = 500;
  const contentHeight = 1000;
  const chartHeight = 50;
  const margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100,
  };
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

    const chartYScale = d3
      .scaleLinear()
      .domain([0, inputData.universities.length - 1])
      .range([0, contentHeight]);
    data.sort((a, b) => b.total - a.total);
    data.map((item, i) => {
      item.offset = chartYScale(i);
    });

    return data;
  }, [inputData]);
  return (
    <svg
      width={contentWidth + margin.left + margin.right}
      height={contentHeight + margin.top + margin.bottom}
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.map((university) => {
          const area = d3
            .area()
            .x((d) => d.x)
            .y1((d) => d.y)
            .y0(0);
          return (
            <g
              key={university.name}
              transform={`translate(0,${university.offset})`}
            >
              <path
                d={area(university.count)}
                fill="red"
                fillOpacity="0.3"
                stroke="red"
              />
              <text
                x="-5"
                textAnchor="end"
                dominantBaseline="central"
                fill="#fff"
                fontWeight="bold"
                fontSize="10"
              >
                {university.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
