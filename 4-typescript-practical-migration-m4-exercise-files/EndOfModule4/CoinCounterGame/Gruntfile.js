module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            default: {
                src: ["**/*.ts", "!node_modules/**/*.ts"],
                options: {
                    comments: true
                }

            }
        },
        concat: {
            vendor: {
                src: ["Scripts/jquery-2.1.3.min.js",
                    "Scripts/big.min.js",
                    "Scripts/bootstrap.min.js",
                    "Scripts/knockout-3.2.0.js"
                ],
                dest: "Built/vendor.js"
            }
        },
        uglify: {
            coinCounter: {
                src: ["*.js", "!Gruntfile.js"],
                dest: "Built/coinCounter.min.js"
            }
        },
        qunit: {
            default: {
                options: {
                    urls: ["http://localhost:8000/tests/tests.html"]
                }
            }
        },
        connect: {
            default: {
                options: {
                    port: 8000,
                    base: "."
                }
            }
        }
    });
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.registerTask("default", ["ts", "concat", "uglify", "connect", "qunit"]);
};