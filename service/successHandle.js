const successHandle = (res, data, statusCode = 200) => {
  res.status(statusCode).send({
    "status": true,
    data
  })
  res.end()
}
module.exports =  successHandle