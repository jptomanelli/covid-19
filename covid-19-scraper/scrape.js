const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = async () => {
  const res = await fetch(process.env.ENDPOINT);
  const html = await res.text();
  const { document } = new JSDOM(html).window;
  const tableRows = document.querySelectorAll("table tbody tr");
  const data = {};

  tableRows.forEach((tr, i, arr) => {
    if (i === 0 || i === arr.length - 1) {
      return;
    }

    const [county, cases] = [...tr.querySelectorAll("td")].map(el => {
      if (el) {
        return el.innerHTML;
      }
      return null;
    });

    data[county] = {
      ...data[county],
      totalCases: +cases.replace(",", "")
    };
  });

  return data;
};
