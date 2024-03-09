const formatTime = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-us", {
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: "3",
  }).format(date);
};

module.exports = { formatTime };
