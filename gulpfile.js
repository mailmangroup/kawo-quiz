'use strict';

var gulp = require( 'gulp' ),
	del = require( 'del' ),
	webserver = require( 'gulp-webserver' ),
	minifyCSS = require( 'gulp-minify-css' ),
	uglify = require( 'gulp-uglify' ),
	replace = require( 'gulp-replace' ),
	rsync = require( 'rsyncwrapper' ).rsync;

// CREATE WEB SERVER
// ===========================================================================================
gulp.task( 'server', function() {
  gulp.src( './public' )
    .pipe(webserver({

    	// host: 'localhost', // LOCALHOST
    	host: '10.10.10.126', // IP SPECIFIC TO ALLOW INTEROFFICE SHARING
    	fallback: 'index.html',
      	livereload: true,
	    port: 8000

    }));
});

// CLEAN FILES FROM DIST DIRECTORY
// ===========================================================================================
gulp.task( 'clean', function ( cb ) {

	return del([
		'./dist/*'
	], cb );

});


// COPY ALL FILES FROM PUBLIC TO DIST
// ===========================================================================================
gulp.task( 'copy', [ 'clean' ], function() {

	return gulp.src( './public/**/*' )
		.pipe( gulp.dest( './dist' ) );

});

// MINIFY & MERGE CSS FILES
// ===========================================================================================
gulp.task( 'minify-css', [ 'copy' ], function() {

	return gulp.src( 'dist/*.css' )
		.pipe( minifyCSS({
			debug: true
		}) )
		.pipe( gulp.dest( 'dist/' ) );

});


// UGLIFY JS
// ===========================================================================================
gulp.task( 'uglify', [ 'copy' ], function() {

	gulp.src( 'dist/*.js' )
		.pipe( uglify() )
		.pipe( gulp.dest( 'dist/' ) );
});


gulp.task( 'build', [ 'minify-css', 'uglify' ], function() {

	return gulp.src( './dist/**/*' )

});


// RSYNC FILES TO STAGING
// $ gulp staging
// ===========================================================================================
gulp.task( 'staging', [ 'build' ], function() {

	return rsync({
		src: 'dist/',
		dest: 'mailman_static:/data/web/staging.quiz.kawo.com/public',
		ssh: true,
		recursive: true,
		exclude: [ '*.json', 'node_modules/*' ],
		args: [ '--verbose' ]
	}, function( error, stdout, stderr, cmd ) {

		if ( error ) {
			// failed
			console.log( error.message )
		}

	});

});

// RSYNC FILES TO PRODUCTION
// $ gulp deploy
// ===========================================================================================
gulp.task( 'deploy', [ 'build' ], function() {

	// REPLACE GOOGLE ANALYTICS ID
	gulp.src([ 'dist/**/*.html' ])
    	.pipe( replace( 'UA-39611373-2', 'UA-39611373-4' ) )
    	.pipe( replace( 'staging.quiz.kawo.com', 'auto' ) )
    	.pipe( gulp.dest( 'dist/' ) );

	return rsync({
		src: 'dist/',
		dest: 'mailman_static:/data/web/quiz.kawo.com/public',
		ssh: true,
		recursive: true,
		exclude: [ '*.json', 'node_modules/*' ],
		args: [ '--verbose' ]
	}, function( error, stdout, stderr, cmd ) {

		if ( error ) {
			// failed
			console.log( error.message )
		}

	});
});