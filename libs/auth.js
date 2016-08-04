import scitran from './scitran';

/**
 * Authorization
 *
 * Authorization middleware.
 */
export default {

    /**
     * User
     *
     * Checks if a request contains an access token
     * for a valid user. Throws an error or calls next
     * function.
     */
    user(req, res, next) {
        scitran.getUserByToken(req.headers.authorization, (err, resp) => {
            if (err || resp.body.code === 400 || resp.body.code === 401) {
                res.status(401).send({error: 'You must have a valid access token.'});
            } else {
                req.user = resp.body._id;
                req.isSuperUser = resp.body.root;
                return next();
            }
        });
    },

    /**
     * Super User
     *
     * Checks if a request contains an access token
     * for a valid superuser. Throws an error or calls next
     * function.
     */
    superuser(req, res, next) {
        scitran.getUserByToken(req.headers.authorization, (err, resp) => {
            if (err || !resp.body.root) {
                res.status(403).send({error: 'You must have admin privileges.'});
            } else {
                req.user = resp.body._id;
                req.isSuperUser = resp.body.root;
                return next();
            }
        });
    },

    /**
     * Optional
     *
     * If a request has a valid access token it will
     * append the user id to the req object. Will
     * not throw an error. Used for requests that may
     * work with varying levels of access.
     */
    optional(req, res, next) {
        scitran.getUserByToken(req.headers.authorization, (err, resp) => {
            if (resp.body && resp.body._id) {
                req.user = resp.body._id;
                req.isSuperUser = resp.body.root;
            }
            return next();
        });
    },

    /**
     * Dataset Access
     *
     * Takes in the authorization header and a datasetId as
     * a url or query param and adds a hasAccess property to
     * the request object.
     */
    datasetAccess(req, res, next) {
        let snapshot   = req.query.hasOwnProperty('snapshot') && req.query.snapshot == 'true';
        let datasetId = req.params.datasetId ? req.params.datasetId : req.query.datasetId;
        scitran.getUserByToken(req.headers.authorization, (err, resp) => {
            if (resp.body && resp.body._id) {
                req.user = resp.body._id;
                req.isSuperUser = resp.body.root;
            }

            scitran.getProject(datasetId, (err, resp1) => {
                if (resp1.body.code && resp1.body.code == 404) {
                    return res.status(404).send({error: resp1.body.detail});
                }

                let hasAccess = !!resp1.body.public || req.isSuperUser;
                if (resp1.body.permissions && !hasAccess) {
                    for (let permission of resp1.body.permissions) {
                        if (permission._id == req.user) {hasAccess = true; break;}
                    }
                }

                req.hasAccess = hasAccess;

                return next();
            }, {snapshot});
        });
    }

}
