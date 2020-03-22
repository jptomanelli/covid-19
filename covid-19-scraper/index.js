const { upload } = require("./s3");
const scrape = require("./scrape");

exports.handler = () => {
  scrape().then(data => {
    upload("covid19", "data.json", JSON.stringify(data)).then(() => {
      console.log('complete');
    });
  });
};
