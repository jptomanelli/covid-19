const { upload } = require("./s3");
const { scrapeNysCounties, scrapeSuffolkTowns } = require("./scrape");

exports.handler = ({ scraper }) => {
  if (scraper === 'nysCounties') {
    scrapeNysCounties(process.env.NYS_ENDPOINT).then(data => {
      upload("covid19", "data.json", JSON.stringify(data)).then(() => {
        console.log('completed nysCounties');
      });
    });
  } else if (scraper === 'suffolkTowns') {
    const endpoints = JSON.parse(process.env.SUFFOLK_ENDPOINTS);
    scrapeSuffolkTowns(endpoints).then(data => {
      upload("covid19", "suffolkTowns.json", JSON.stringify(data)).then(() => {
        console.log('completed suffolk towns');
      });
    });
  }
  
};
