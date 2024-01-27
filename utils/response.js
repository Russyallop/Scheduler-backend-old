const sendResponse = (res, data, status = 200) => {
  if (status !== 200) {
    data = {
      error: data
    }
    console.log("error", data);
  }
  res.status(status).json({
    status,
    data,
  });
};


module.exports = {
  sendResponse
};