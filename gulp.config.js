module.exports = function() {
    var front = 'src',
        frontScripts = './src/scripts'
        dist = 'static',
        tmp = '.tmp',
        docs = 'documentation',
        landing = 'landing';
    var config = {
        front: front,
        dist: dist,
        tmp: tmp,
        index: front + "/index.html",
        alljs: [
            front + "/scripts/**/*.js",
            './*.js'
        ],
        assets: [
            front + "/fonts/*", 
            front + "/images/**/*", 
            front + "/favicon.ico"
        ],
        less: [],
        sass: [
            front + "/styles/**/*.scss"
        ],
        js: [
            frontScripts + "/main.js",
            frontScripts + "/**/*.js",
            '!' + frontScripts + "/**/*.spec.js"
        ],
        docs: docs, 
        docsJade: [
            docs + "/jade/index.jade",
            docs + "/jade/faqs.jade",
            docs + "/jade/layout.jade"
        ],
        allToClean: [
            tmp, 
            ".DS_Store",
            ".sass-cache",
            docs + "/jade",
            docs + "/layout.html",
            landing + "/jade",
            landing + "/bower_components",
            "readme.md"
        ]
    };

    return config;
};
