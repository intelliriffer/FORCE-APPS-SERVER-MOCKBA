/**
 * URL ENDPOINTS FOR THE APP
 * 
 */

module.exports = [
    {
        NAME: "Home",
        PATH: "./api/endpoints/home.js",
        PARAM: "/",
        URL: "/",
        HIDDEN: false,
        HOME: false
    },


    {
        NAME: "File Manager",
        PATH: "./api/endpoints/file-browser/index.js",
        PARAM: "/file-browser",
        URL: "/file-browser",
        HIDDEN: false,
        HOME: true
    },

    {
        NAME: "Arps Manager",
        PATH: "./api/endpoints/arp-manager/index.js",
        PARAM: "/arps",
        URL: "/arps",
        HIDDEN: false,
        HOME: true
    },
    {
        NAME: "Static Assets",
        PATH: "./api/endpoints/static.js",
        PARAM: "/static",
        URL: "/static",
        HIDDEN: true,
        HOME: false
    },
    {
        NAME: "Progression Builder",
        PATH: "./api/endpoints/progression-builder/index.js",
        PARAM: "/pbuilder",
        URL: "/pbuilder",
        HIDDEN: false,
        HOME: true

    },
    {
        NAME: "Projects",
        PATH: "./api/endpoints/projects/index.js",
        PARAM: "/projects",
        URL: "/projects",
        HIDDEN: true,
        HOME: true
    },
    {
        NAME: "Project Templates",
        PATH: "./api/endpoints/project-templates/index.js",
        PARAM: "/project-templates",
        URL: "/project-templates",
        HIDDEN: false,
        HOME: true
    },
    {
        NAME: "Screen Captures",
        PATH: "./api/endpoints/captures/index.js",
        PARAM: "/captures",
        URL: "/captures",
        HIDDEN: false,
        HOME: true
    },
    {
        NAME: "TOOLING",
        PATH: "./api/endpoints/tooling/index.js",
        PARAM: "/tooling",
        URL: "/tooling",
        HIDDEN: true,
        HOME: false
    },
    {
        NAME: "Trans Arranger",
        PATH: "./api/endpoints/track-arranger/index.js",
        PARAM: "/track-arranger",
        URL: "/track-arranger",
        HIDDEN: true,
        HOME: false
    },
    {
        NAME: "Module Manager",
        PATH: "./api/endpoints/moduler/index.js",
        PARAM: "/moduler",
        URL: "/moduler",
        HIDDEN: false,
        HOME: true
    },
    {
        NAME: "Shell Console",
        PATH: "./api/endpoints/shell/index.js",
        PARAM: "/shell",
        URL: "/shell",
        HIDDEN: false,
        HOME: true
    },
    {
        NAME: "Config",
        PATH: "./api/endpoints/config/config.js",
        PARAM: "/config",
        URL: "/config",
        HIDDEN: false,
        HOME: true
    }
];