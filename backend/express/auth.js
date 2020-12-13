var admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const AUTH_DISABLED = process.env.AUTH_DISABLED || process.env.NODE_ENV === "test";

function firebaseAuthMiddleware(req, res, next) {
    var auth = req.header("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
        console.log("Unauthorized: invalid bearer token."); // eslint-disable-line no-console
        res.sendStatus(401);
        return;
    }
    auth = auth.slice(7, auth.length);

    admin.auth().verifyIdToken(auth)
        .then((decoded) => {
            res.locals.user = decoded;
            next();
        })
        .catch((err) => {
            console.log(`Unauthorized: ${err}`); // eslint-disable-line no-console
            res.sendStatus(401);
        });
}

function noAuthMiddleware(req, res, next) {
    var uid = req.headers.authorization || "Bearer foo";
    uid = uid.slice(7, uid.length);
    res.locals.user = { uid, email: "no email", name: uid };
    console.log(`Doing fake login for uid: ${uid}`); // eslint-disable-line no-console
    next();
}

const authMiddleware = AUTH_DISABLED === "1" ? noAuthMiddleware : firebaseAuthMiddleware;

module.exports = {
    AUTH_DISABLED, 
    authMiddleware
};
