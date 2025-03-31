//#region Imports
import { ServerExpress } from "./serverExpress"
//#endregion

process.on('unhandledRejection', (err: Error) => {
    console.error(err?.message || err)
    process.exit(1)
})

    const server = new ServerExpress();
    server.start()
        .then(() => server.listen())
        .catch(error => {
            console.error(error)
            process.exit(1)
        })