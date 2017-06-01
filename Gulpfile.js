const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglifyjs');
const rename = require('gulp-rename');
 
gulp.task('default', () => {
    return gulp.src('src/vue-resource-case-converter.js')
        .pipe(babel({
            presets: ['es2015'],
            plugins: ['transform-object-assign'],
        }))
        .pipe(rename('vue-resource-case-converter.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename('vue-resource-case-converter.min.js'))
        .pipe(gulp.dest('dist'));
});
