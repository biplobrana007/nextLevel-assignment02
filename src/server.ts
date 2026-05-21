import app from "./app";

const main = async () => {
  app.listen(5000, () => {
    console.log(`The server is running on 5000`);
  });
};

main();
