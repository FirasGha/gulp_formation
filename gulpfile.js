import gulp from "gulp"
import { deleteAsync } from 'del';
import sourcemaps from "gulp-sourcemaps"
import plumber from "gulp-plumber"
import dartSass from 'sass'
import gulpSass from "gulp-sass"
import autoprefixer from "gulp-autoprefixer"
import minifyCss from "gulp-clean-css"
import uglify from "gulp-uglify"
import concat from "gulp-concat"
import imagemin from "gulp-imagemin"
import nunjucksRender from "gulp-nunjucks-render"
import browserSync from "browser-sync"
import ts from "gulp-typescript"
import deploy from "gulp-gh-pages"

const sass = gulpSass(dartSass)
browserSync.create();


const src_folder = './src/',
    dist_folder = './dist/',
    dist_assets_folder = dist_folder + 'assets/',
    github_repo = 'https://github.com/FirasGha/gulp_formation.git';


gulp.task('clear', () => deleteAsync([dist_folder]));

gulp.task('njk-html', function () {
    return gulp.src(src_folder + 'views/pages/*.njk')
        .pipe(nunjucksRender({
            path: [src_folder],
            ext: '.html'
        }))
        .pipe(gulp.dest(dist_folder));
});

gulp.task('sass', () => {
    return gulp.src(
        src_folder + 'scss/*.scss'
        , { since: gulp.lastRun('sass') })
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(minifyCss())
        .pipe(concat('style.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dist_assets_folder + 'css'))
        .pipe(browserSync.stream());
});

gulp.task('js', () => {
    return gulp.src([src_folder + 'js/**/*.ts'], { since: gulp.lastRun('js') })
        .pipe(plumber())
        .pipe(ts({
            noImplicitAny: true,
            declaration: false,
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dist_assets_folder + 'js'))
        .pipe(browserSync.stream());
});

gulp.task('images', () => {
    return gulp.src([src_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)',], { since: gulp.lastRun('images') })
        .pipe(plumber())
        .pipe(imagemin())
        .pipe(gulp.dest(dist_assets_folder + 'images'))
        .pipe(browserSync.stream());
});

gulp.task('icons', () => {
    return gulp.src([src_folder + 'icons/**/*.+(png|jpg|jpeg|gif|svg|ico)',], { since: gulp.lastRun('icons') })
        .pipe(plumber())
        .pipe(imagemin())
        .pipe(gulp.dest(dist_assets_folder + 'icons'))
        .pipe(browserSync.stream());
});

gulp.task('fonts', function font() {
    return gulp.src('./src/fonts/**/*.woff2')
        .pipe(gulp.dest(dist_assets_folder + 'fonts'));
});

gulp.task('serve', () => {
    return browserSync.init({
        server: {
            baseDir: ['dist']
        },
        port: 3000,
        open: false
    });
});

gulp.task('watch', () => {
    const watchImages = [
        src_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)'
    ];

    const watch = [
        src_folder + '*.njk',
        src_folder + 'scss/**/*.scss',
        src_folder + 'js/**/*.ts'
    ];

    gulp.watch(watch, gulp.series('dev')).on('change', browserSync.reload);
    gulp.watch(watchImages, gulp.series('images')).on('change', browserSync.reload);
});

gulp.task('deploy', function () {
    return gulp.src(dist_folder + '/**/*')
        .pipe(deploy({
            remoteUrl: github_repo,
            branch: "master"
        }))
});
gulp.task('build', gulp.series('njk-html', 'sass', 'js', 'images', 'fonts'));
gulp.task('dev', gulp.series('clear', 'njk-html', 'sass', 'js', 'images', 'icons', 'fonts', 'serve', 'watch'));
gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')));