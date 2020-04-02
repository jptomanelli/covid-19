const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const scrapers = {
  scrapeSuffolkTowns: async endpoints => {
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

scrapers.scrapeSuffolkTowns([
  {
    date: "3/23/2020",
    endpoint:
      "https://www.suffolkcountyny.gov/Departments/Health-Services/Health-Bulletins/Novel-Coronavirus/covid-19-case-update-march-23-2020-230-pm"
  },
  {
    date: "3/24/2020",
    endpoint:
      "https://www.suffolkcountyny.gov/Departments/Health-Services/Health-Bulletins/Novel-Coronavirus/covid-19-case-update-march-24-2020-230-pm"
  },
  {
    date: "3/25/2020",
    endpoint:
      "https://www.suffolkcountyny.gov/Departments/Health-Services/Health-Bulletins/Novel-Coronavirus/covid-19-case-update-march-25-2020-230-pm"
  },
  {
    date: "3/26/2020",
    endpoint:
      "https://www.suffolkcountyny.gov/Departments/Health-Services/Health-Bulletins/Novel-Coronavirus/covid-19-case-update-march-26-2020-230-pm"
  },
  {
    date: "3/27/2020",
    endpoint:
      "https://www.suffolkcountyny.gov/Departments/Health-Services/Health-Bulletins/Novel-Coronavirus/covid-19-case-update-march-27-2020-230-pm"
  },
  {
    date: "3/28/2020",
    endpoint:
      "https://www.suffolkcountyny.gov/Departments/Health-Services/Health-Bulletins/Novel-Coronavirus/covid-19-case-update-march-28-2020-230-pm"
  },
  {
    date: "3/29/2020",
    endpoint:
      "https://www.suffolkcountyny.gov/Departments/Health-Services/Health-Bulletins/Novel-Coronavirus/covid-19-case-update-march-29-2020-230-pm"
  },
  {
    date: "3/30/2020",
    endpoint:
      "https://www.suffolkcountyny.gov/Departments/Health-Services/Health-Bulletins/Novel-Coronavirus/covid-19-case-update-march-30-2020-230-pm"
  },
  {
    date: "3/31/2020",
    endpoint:
      "https://www.suffolkcountyny.gov/Departments/Health-Services/Health-Bulletins/Novel-Coronavirus/covid-19-case-update-march-31-2020-230-pm"
  },
  {
    date: "4/1/2020",
    endpoint:
      "https://www.suffolkcountyny.gov/Departments/Health-Services/Health-Bulletins/Novel-Coronavirus/covid-19-case-update-april-1-2020-230-pm"
  }
]);
