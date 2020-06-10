var gulp = require('gulp')
var less = require('gulp-less')

// var sass = require('gulp-sass')

// 监视文件改动并重新载入
const browserSync = require('browser-sync').create()

gulp.task('less', function() {
  return gulp.src('./assets/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./assets/css'))
})

async function dev() {
  // 刷新浏览器
  await browserSync.init(
    {
      server: {
        baseDir: './',
      },
    //   files: ['./**/*.html', './**/*.css', './**/*.js'], // 这里填写监听的文件列表
      files: ['./*.html', './assets/**/*.css', './assets/**/*.js'], // 这里填写监听的文件列表
    },
    function() {
      console.log('browser refreshed')
    },
  )
  gulp.watch('./assets/less/*.less',  gulp.series('less'))
}
gulp.task('dev', dev)
