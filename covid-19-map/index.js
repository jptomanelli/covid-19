const geojsonUrl =
  "https://jpiss.s3.amazonaws.com/covid19/nys_counties.geojson";
const dataUrl = "https://jpiss.s3.amazonaws.com/covid19/data.json";

const size = 800;
const scale = s => (s / 400) * 2800;
const translateX = s => (s / 400) * 3855;
const translateY = s => (s / 400) * 2500;

const projection = d3
  .geoMercator()
  .scale(scale(size))
  .translate([translateX(size), translateY(size)])
  .center([-1, 0]);
const path = d3.geoPath().projection(projection);

function getData(url) {
  return fetch(url).then(res => res.json());
}

const geojsonQuery = getData(geojsonUrl);
const dataQuery = getData(dataUrl);

document.addEventListener("DOMContentLoaded", () => {
  const svg = d3
    .select("#root")
    .append("svg")
    .attr("width", size)
    .attr("height", size);

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "hidden tooltip");

  Promise.all([geojsonQuery, dataQuery]).then(([geojson, data]) => {

    const cleaned = geojson.features.reduce(
      (acc, { properties: { pop2010, name }}) => ({
        ...acc,
        [name]: {
          total: data[name] ? data[name].totalCases : 0,
          pop: pop2010,
          totalPerHundred: data[name]
            ? (data[name].totalCases / pop2010) * 100
            : 0
        }
      }),
      {}
    );
    const domain = Object.values(cleaned).map(d => d.total);

    const getColor = d3
      .scaleQuantile()
      .domain(domain)
      .range([
        "#fff",
        "#f1eef6",
        "#d0d1e6",
        "#a6bddb",
        "#74a9cf",
        "#2b8cbe",
        "#045a8d"
      ]);

    svg
      .selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("d", path)
      .attr("fill", d => {
        const county = d.properties.name;
        if (cleaned[county]) {
          return getColor(cleaned[county].total);
        }
        return '#eee';
      })
      .on("mousemove", d => {
        const mouse = d3.mouse(svg.node()).map(d => +d);
        const county = d.properties.name;
        tooltip
          .classed("hidden", false)
          .attr(
            "style",
            "left:" + (mouse[0] - 40) + "px; top:" + (mouse[1] - 100) + "px"
          )
          .html(`<p>${county}</p><p>Total Cases: ${cleaned[county].total}</p>`);
      })
      .on("mouseover", function(d) {
        d3.select(this).classed("active", true);
      })
      .on("mouseout", function(d) {
        tooltip.classed("hidden", true);
        d3.select(this).classed("active", false);
      });
  });
});
