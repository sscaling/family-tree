module.exports = function (grunt) {

    require("load-grunt-tasks")(grunt);

    grunt.initConfig(
        {
            copy: {
                main: {
                    files: [
                        {expand: false, src: ['node_modules/react-dom/dist/react-dom.js'], dest: 'www/js/react-dom.js', filter: 'isFile'},
                        {expand: false, src: ['node_modules/react/dist/react-with-addons.js'], dest: 'www/js/react-with-addons.js', filter: 'isFile'},
                    ],
                },
            },
            babel: {
                options: {
                    sourceMap: true
                },
                dist: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src/',
                            src: ['*.js'],
                            dest: 'www/js'
                        }
                    ]
                }
            },
            watch: {
                files: ['src/*.js'],
                tasks: ['copy', 'babel']
            }
        }
    );

    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    grunt.registerTask('default', ['copy', 'babel']);
};
