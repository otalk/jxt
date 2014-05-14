'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            options: {
                bundleOptions: {
                    standalone: 'JXT'
                }
            },
            dist: {
                files: {
                    'build/<%= pkg.name %>.bundle.js': ['<%= pkg.main %>']
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %>'
            },
            dist: {
                files: {
                    'build/<%= pkg.name %>.bundle.min.js': ['build/<%= pkg.name %>.bundle.js']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'index.js', 'lib/**.js', 'test/**.js'],
            options: grunt.file.readJSON('.jshintrc')
        },
        tape: {
            options: {
                pretty: true
            },
            files: ['test/test.js']
        }
 
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-tape');
    grunt.loadNpmTasks('grunt-nsp-package');

    grunt.registerTask('default', ['jshint', 'browserify', 'uglify', 'tape', 'validate-package']);
};
