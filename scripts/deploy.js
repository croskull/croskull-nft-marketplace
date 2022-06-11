const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();
require("dotenv").config();

const config = {
    user: process.env.FTP_USER,
    password:   process.env.FTP_PASW,
    host: process.env.FTP_HOST,
    port: 21,
    localRoot: __dirname + "/build",
    remoteRoot: "/test/",
    // include: ["*", "**/*"],      // this would upload everything except dot files
    // e.g. exclude sourcemaps, and ALL files in node_modules (including dot files)
    exclude: [
        "dist/**/*.map",
        "node_modules/**",
        "node_modules/**/.*",
        ".git/**",
        ".DS_STORE"
    ],
    deleteRemote: false,
    // Passive mode is forced (EPSV command is not sent)
    forcePasv: true,
    // use sftp or ftp
    sftp: false,
};

ftpDeploy
    .deploy(config)
    .then((res) => console.log("finished:", res))
    .catch((err) => console.log(err));