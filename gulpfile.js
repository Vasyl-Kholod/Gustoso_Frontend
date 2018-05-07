var gulp = require("gulp");
var less = require("gulp-less");
var nano = require("gulp-cssnano");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var gulpIf = require("gulp-if");
var autoprefixer = require("gulp-autoprefixer");
var sync = require("browser-sync").create();
var image = require("gulp-image");
var rigger = require("gulp-rigger");
var ghPages = require('gulp-gh-pages');
var clean = require('gulp-clean');

var isDevelopment = false;

gulp.task('deploy', function () {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});

gulp.task('clean', function () {
    return gulp.src('dist/', {read: false})
        .pipe(clean());
});

gulp.task("css:own", function () {
    return gulp.src("src/Styles/main.less")
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(less())
        .pipe(autoprefixer("last 2 versions"))
        .pipe(nano())
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest("dist/css"))
        .pipe(sync.stream());
});

gulp.task("css:admin", function () {
    return gulp.src("src/Styles/Components/admin.less")
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(less())
        .pipe(autoprefixer("last 2 versions"))
        .pipe(nano())
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest("dist/admin/css"))
        .pipe(sync.stream());
});

gulp.task("css:vendor", function () {
    return gulp.src([
        "node_modules/bootstrap/dist/css/bootstrap.css",
        "node_modules/font-awesome/css/font-awesome.css",
        "node_modules/toastr/build/toastr.css",
        "src/Resources/jquery.bxslider/jquery.bxslider.css",
        "node_modules/datatables.net-dt/css/jquery.dataTables.css",
        "node_modules/jssocials/dist/jssocials.css",
        "node_modules/jssocials/dist/jssocials-theme-flat.css"
    ])
        .pipe(gulpIf(!isDevelopment, nano()))
        .pipe(concat("vendor.css"))
        .pipe(gulp.dest("dist/css"));
});

gulp.task("js:own", function () {
    return gulp.src([
        "src/js/main.js"
    ])
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        // .pipe(uglify())
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest("dist/js"));
});

gulp.task("js:admin", function () {
    return gulp.src([
        "src/js/admin.js"
    ])
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest("dist/admin/js"));
});

gulp.task("js:serviceWorker", function () {
    return gulp.src([
        "src/js/service-worker.js"
    ])
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest("dist/"));
});

gulp.task("js:vendor", function () {
    return gulp.src([
        "node_modules/jquery/dist/jquery.js",
        "node_modules/jquery-validation/dist/jquery.validate.js",
        "node_modules/bootstrap/dist/js/bootstrap.js",
        "src/Resources/jquery.bxslider/jquery.bxslider.js",
        "src/Resources/scrollup/jquery.scrollUp.js",
        "node_modules/toastr/build/toastr.min.js",
        "node_modules/datatables.net/js/jquery.dataTables.js",
        "node_modules/jssocials/dist/jssocials.js",
        "src/js/calendar.js",
        "src/js/moment.js",
        "src/js/bootstrap-material-datetimepicker.js"
    ])
        .pipe(concat("vendor.js"))
        .pipe(gulpIf(!isDevelopment, uglify()))
        .pipe(gulp.dest("dist/js"));
});

gulp.task("fonts", function () {
    return gulp.src([
        "src/Fonts/**/*.ttf",
        "node_modules/font-awesome/fonts/**"
    ])
        .pipe(gulp.dest("dist/Fonts"));
});

gulp.task("html:own", function () {
    return gulp.src("src/admin/*.html")
        .pipe(rigger())
        .pipe(gulp.dest("dist/admin"));
});

gulp.task("html:vendor", function () {
    return gulp.src("src/*.html")
        .pipe(rigger())
        .pipe(gulp.dest("dist"));
});

gulp.task("json", function () {
    return gulp.src("src/data.json")
        .pipe(gulp.dest("dist"));
});

gulp.task("images", function () {
    return gulp.src([
        "src/Images/**/*.{png,jpg,gif,jpeg,svg}",
        "src/Resources/jquery.bxslider/images/*.{png,gif}",
        "node_modules/datatables.net-dt/images/*.png"
    ])
        // .pipe(image({
        //     pngquant: true,
        //     optipng: false,
        //     zopflipng: true,
        //     jpegRecompress: false,
        //     jpegoptim: true,
        //     mozjpeg: true,
        //     gifsicle: true,
        //     svgo: true,
        //     concurrent: 10
        // }))
        .pipe(gulp.dest("dist/Images"));
});

gulp.task("css", ["css:own", "css:vendor", "css:admin"]);
gulp.task("js", ["js:own", "js:vendor", "js:admin", "js:serviceWorker"]);
gulp.task("html", ["html:own", "html:vendor"]);

gulp.task("watch", ["build"], function () {
    sync.init({
        server: "dist"
    });
    gulp.watch("src/Styles/**/*.less", ["css:own", "css:admin"]);

    gulp.watch("src/js/*.js", ["js:own", "js:admin", "js:serviceWorker"]);
    gulp.watch("dist/js/*.js").on("change", sync.reload);

    gulp.watch("src/admin/*.html", ["html:own"]);
    gulp.watch("dist/admin/*.html", ["html:own"]).on("change", sync.reload);

    gulp.watch("src/*.html", ["html:vendor"]);
    gulp.watch("dist/*.html", ["html:vendor"]).on("change", sync.reload);

    gulp.watch("src/data.json", ["json"]);
    gulp.watch("src/data.json", ["json"]).on("change", sync.reload);

    gulp.watch("src/Fonts/**/*.ttf", ["fonts"]);
    gulp.watch("dist/Fonts/**/*.ttf", ["fonts"]).on("change", sync.reload);

    gulp.watch("src/Images/**/*.{png,jpg,gif,jpeg,svg}", ["images"]);
    gulp.watch("dist/Images/**/*.{png,jpg,gif,jpeg,svg}", ["images"]).on("change", sync.reload);

});

gulp.task("build", ["html", "css", "js", "fonts", "images", "json"]);
gulp.task("default", ["build", "watch"]);