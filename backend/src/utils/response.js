function success(res, message, data, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function failure(res, message, status = 500) {
  return res.status(status).json({ success: false, message });
}

module.exports = { success, failure };
