var exec = require('child_process').exec;
var program = require('commander');
var inquirer = require('inquirer');
var chalk = require('chalk');
var crawler = require('./crawler');

module.exports = function () {
    program
        .version('0.0.1')
        .command('hero')
        .option('-l, --list', '显示英雄列表', { isDefault: true })
        .option('-p, --person [heroName]', '显示单个英雄')
        .action(function (option) {
            var promps = [];

            // 英雄列表
            if (option.list) {
                crawler.getHeroList(function (heros) {
                    promps.push({
                        type: 'list',
                        name: 'heroList',
                        message: '想查看哪个英雄的精彩视频？',
                        choices: heros
                    })
                    inquirer.prompt(promps).then(function (answers) {
                        var url = 'http://m.wzshipin.com/yingxiong/' + answers.heroList;
                        crawler.showHeroVideos(url, function (videos) {
                            var promps = [];
                            promps.push({
                                type: 'list',
                                name: 'videoPage',
                                message: '想看哪个视频？[' + videos.length + '个]',
                                choices: videos
                            });
                            inquirer.prompt(promps).then(function (answers) {
                                exec('open ' + answers.videoPage, function () {
                                    console.log(chalk.red('\n已经在浏览器中为您打开！\n'));
                                });
                            });
                        });
                    })
                });
            }

            // 单个英雄查询
            if (option.person) {
                if (option.person === true) {
                    promps.push({
                        type: 'input',
                        name: 'heroName',
                        message: '请输入英雄名称：',
                        validate: function (input) {
                            if (!input) {
                                return '不能为空'
                            }
                            return true
                        }
                    });
                } else {
                    var url = 'http://m.wzshipin.com/yingxiong/' + option.person;
                    crawler.showHeroVideos(url, function (videos) {
                        var promps = [];
                        promps.push({
                            type: 'list',
                            name: 'videoPage',
                            message: '想看哪个视频？[' + videos.length + '个]',
                            choices: videos
                        });
                        inquirer.prompt(promps).then(function (answers) {
                            exec('open ' + answers.videoPage, function () {
                                console.log(chalk.red('\n已经在浏览器中为您打开！\n'));
                            });
                        });
                    });
                }
                inquirer.prompt(promps).then(function (answers) {
                    console.log(answers);
                });
            }


        });

    program.parse(process.argv);
}