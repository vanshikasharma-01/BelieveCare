const mongoose = require("mongoose");

// Feedback is kept in its own database (separate from the main
// "believecare" app database) so it can be managed/backed up
// independently of orders, inventory, users etc.
//
// Defaults to the same MongoDB server as MONGO_URI, just with the
// database name swapped to "feedback" — unless FEEDBACK_MONGO_URI is
// set explicitly in .env, in which case that's used as-is (useful if
// feedback should live on a totally different server/cluster).
const getFeedbackUri = () => {
  if (process.env.FEEDBACK_MONGO_URI) {
    return process.env.FEEDBACK_MONGO_URI;
  }

  const base =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/believecare";

  // Swap out whatever database name is at the end of the URI for
  // "feedback", keeping any query string intact.
  return base.replace(/\/[^/?]+(\?|$)/, "/feedback$1");
};

const feedbackConnection = mongoose.createConnection(getFeedbackUri());

feedbackConnection.on("connected", () => {
  console.log("Feedback DB Connected:", getFeedbackUri());
});

feedbackConnection.on("error", (error) => {
  console.log("Feedback DB Connection Failed");
  console.log(error.message);
});

module.exports = feedbackConnection;
