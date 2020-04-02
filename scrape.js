const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const validTowns = [
  "Islip",
  "Huntington",
  "Brookhaven",
  "Babylon",
  "Smithtown",
  "Southold",
  "Southampton",
  "Riverhead",
  "East Hampton",
  "Shelter Island",
  "Township not known"
];

module.exports = {
  scrapeSuffolkTowns: async endpoints => {
    const promises = endpoints.map(async ({ date, endpoint }) => {
      const res = await fetch(endpoint);
      const html = await res.text();
      const { document } = new JSDOM(html).window;
      const uls = document.querySelectorAll(".EDN_article_content ul");

      let data = [];
      for (let ul of uls) {
        const lis = [...ul.querySelectorAll("li")].map(li => li.innerHTML);
        if (lis[0] !== undefined && lis[0].includes("Suffolk County at this time")) {
          lis.shift();
          data = lis;
        } else if (lis[0] !== undefined && lis[0].includes("Islip")) {
          data = lis;
        }
      }
      //  match town and count
      const reg = /(^\w+\s?\w+\s?\w+)\s?--\s?(\d+)/g;
      data = data.map(text => {
        text.replace('&nbsp;', '').match(reg);
        return { date, town: RegExp.$1, cases: +RegExp.$2 };
      });

      return data;
    });

    const list = await Promise.all(promises);

    return list.flat();
  },

  scrapeNysCounties: async endpoint => {
    const res = await fetch(endpoint);
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
  }
};