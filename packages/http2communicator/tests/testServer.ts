import startServer from '../src/server'

startServer(
  (response) => {
    debugger
    console.log(response)
  },
  (server, gracefulShutdown) => {
    debugger
    console.log('ready')
    // gracefulShutdown()
  },
)
