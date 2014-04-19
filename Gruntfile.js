module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
        stripBanners: true,
        banner: "/*\n"+
                "  ludumpad-client - v0.0.1 - 2013-10-28\n"+
                "  Copyright(c) 2013 David da Silva Contín <daviddasilvacontin@me.com> MIT Licensed\n"+
                "*/\n\n"
      },
      dist: {
        src: ['src/Polyfills.js', 'src/Main.js', 'src/Screen.js', 'src/Gamepad.js', 'src/GamepadClient.js', 'src/Channel.js', 'src/UI.js'],
        dest: 'ludumpad.js',
      }
    },
    uglify: {
      options: {
        banner: "/*\n"+
                "  ludumpad-client - v0.0.1 - 2013-10-28\n"+
                "  Copyright(c) 2013 David da Silva Contín <daviddasilvacontin@me.com> MIT Licensed\n"+
                "*/\n\n"
      },
      dynamic_mappings: {
        // Grunt will search for "**/*.js" under "lib/" when the "minify" task
        // runs and build the appropriate src-dest file mappings then, so you
        // don't need to update the Gruntfile when files are added or removed.
        files: [
          {
            expand: true,     // Enable dynamic expansion.
            cwd: '',      // Src matches are relative to this path.
            src: 'ludumpad.js', // Actual pattern(s) to match.
            dest: '',   // Destination path prefix.
            ext: '.min.js',   // Dest filepaths will have this extension.
          },
        ],
      }
    },
    watch: {
      main: {
        files: ["src/**/*.js"],
        tasks : ["concat", "uglify"]
      }
    }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['concat','uglify']);
  grunt.registerTask('server', ['default', 'watch']);
};
