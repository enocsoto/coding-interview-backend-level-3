//#region Imports
import { Server } from "@hapi/hapi"
//#endregion

export const defineRoutes = (server: Server) => {
    server.route({
        method: 'GET',
        path: '/ping',
        handler: async (_request,_h) => {
            return {
                ok: true
            }
        }
    })  
}