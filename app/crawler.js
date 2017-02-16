var request = require('request');
var cheerio = require('cheerio');
var ora = require('ora');
var url = require('./url');
var crawler = {};
var videos = [];

const spinner = ora('加载中...');

// 获得英雄列表数据
crawler.getHeroList = function (cb) {
    spinner.start();
    request(url.baseUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var $heros = $('.ming_item').children();
            var heros = [];
            $heros.each(function (index, hero) {
                var $hero = $(hero);
                heros.push({
                    name: $hero.text(),
                    value: $hero.attr('href').replace(/.*\/(.*)\/$/, '$1')
                });
            })
            spinner.stop();
            cb(heros);
        }
    })
}

// 展示对应英雄的视频
crawler.showHeroVideos = function (url, cb) {
    getData(url);
    // 爬数据
    function getData(url) {
        spinner.start();
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(body);
                var $videos = $('.mod-pic').children();
                $videos.each(function (index, video) {
                    var $video = $(video);
                    videos.push({
                        name: '[' + $video.find('span').text() + ']' + $video.find('em').text(),
                        value: $video.find('a').attr('href')
                    });
                });

                // 翻页抓取 没匹配到.html 即为第一页，有index_2.html这种是第二页及以后的
                var nextUrl = '';
                if (!/.html/.test(url)) {
                    nextUrl = url + '/index_2.html';
                } else {
                    nextUrl = url.replace(/index_(.*).html$/, function (match, $1) {
                        return 'index_' + (Number($1) + 1) + '.html'
                    });
                }

                // 循环爬，知道没有下一页
                getData(nextUrl)

            } else {
                // 添加序号
                videos.forEach(function(video, index){
                    var _index = index + 1;
                    _index = _index >= 10 ? _index : '0' + _index;
                    video.name = '('+ _index +')' + video.name;
                });
                spinner.stop();
                cb(videos);
            }
        });
    }
}

module.exports = crawler;