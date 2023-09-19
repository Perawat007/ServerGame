const express = require('express');
const { response } = require("express");
const mysql = require('mysql2') //npm install mysql2
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const os = require('os');
const md5 = require('md5');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(express.static('public'));
require('dotenv').config()

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD
});

module.exports = class Post {
    constructor(email, password, role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    static uploadLogRepostGame(post) {

        let browser;
        if (post.userAgent.includes('Chrome')) {
            browser = 'Google Chrome';
        } else if (post.userAgent.indexOf('Firefox') > -1) {
            browser = 'Mozilla Firefox';
        } else if (post.userAgent.indexOf('Safari') > -1) {
            browser = 'Apple Safari';
        } else if (post.userAgent.indexOf('Opera') > -1) {
            browser = 'Opera';
        } else if (post.userAgent.indexOf('Edg') > -1) {
            browser = 'Microsoft Edge';
        } else if (post.userAgent.indexOf('Trident') > -1) {
            browser = 'Microsoft Internet Explorer';
        }
        else {
            browser = 'Google Chrome';
        }
        const isMobile = /Mobile|Android/.test(post.userAgent);
        let platform = 'mobile';
        if (isMobile) {
            platform = 'mobile';
        } else {
            platform = 'computer pc';
        }

        const sql = `SELECT * FROM member WHERE username = ?`;
        connection.query(sql, [post.username], (error, result) => {
            try {
                if (error) { console.log(error) }
                else {
                    let datausername = result[0];
                    let sql_before = `INSERT INTO repostgame (iduser, username, gameid, bet, win, balance_credit, get_browser, platform, created_atdate, created_attime) value 
              ('${datausername.id}','${post.username}','${post.gameid}','${post.bet}','${post.win}','${post.balance_credit}','${browser}','${platform}',now(), now())`;
                    connection.query(sql_before, (error, resultAfter) => {
                        if (error) { console.log(error); }
                        return 'OK';
                    });
                }

            } catch (err) {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
            }
        });
    }

    static uploadLogRepostGameAsk(post) {
        let browser;
        if (post.userAgent.includes('Chrome')) {
            browser = 'Google Chrome';
        } else if (post.userAgent.indexOf('Firefox') > -1) {
            browser = 'Mozilla Firefox';
        } else if (post.userAgent.indexOf('Safari') > -1) {
            browser = 'Apple Safari';
        } else if (post.userAgent.indexOf('Opera') > -1) {
            browser = 'Opera';
        } else if (post.userAgent.indexOf('Edg') > -1) {
            browser = 'Microsoft Edge';
        } else if (post.userAgent.indexOf('Trident') > -1) {
            browser = 'Microsoft Internet Explorer';
        }
        else {
            browser = 'Google Chrome';
        }

        const isMobile = /Mobile|Android/.test(post.userAgent);
        let platform = 'mobile';
        if (isMobile) {
            platform = 'mobile';
        } else {
            platform = 'computer pc';
        }

        const sql = `SELECT * FROM member WHERE username = ?`;
        connection.query(sql, [post.username], (error, result) => {
            try {
                if (error) { console.log(error) }
                else {
                    let datausername = result[0];
                    const sql = `SELECT * FROM repostgame WHERE trans_id = ?`;
                    connection.query(sql, [post.trans_id], (error, resulttransID) => {
                        if (error) { console.log(error) }
                        else {
                            console.log(resulttransID.length);
                            if (resulttransID.length !== 0) {
                                let sql = `UPDATE repostgame set  win = '${post.win}', balance_credit = '${post.balance_credit}' WHERE trans_id = "${post.trans_id}"`;
                                connection.query(sql, (error, resultAfter) => {
                                    if (error) { console.log(error); }
                                    return 'OK';
                                });
                            } else {
                                let sql_before = `INSERT INTO repostgame (iduser, username, gameid, bet, win, balance_credit, get_browser, platform, trans_id, created_atdate, created_attime) value 
                                ('${datausername.id}','${post.username}','${post.gameid}','${post.bet}','${0}','${post.balance_credit}','${browser}','${platform}','${post.trans_id}',now(), now())`;
                                connection.query(sql_before, (error, resultAfter) => {
                                    if (error) { console.log(error); }
                                    return 'OK';
                                });
                            }
                        }
                    })

                }

            } catch (err) {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
            }
        });
    }

    /*--------------------------------------------------------------------------------- reports Game All*/
    static async valuewinbet(post) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM repostgame WHERE created_atdate >='${post.startdate}' AND created_atdate <= '${post.endDate}'`;
            connection.query(sql, (error, results) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    if (results.length !== 0) {
                        let betvalue = 0;
                        let winvalue = 0;
                        for (let i = 0; i < results.length; i++) {
                            betvalue += results[i].bet;
                            winvalue += results[i].win;
                        }
                        let jsArray = { "bet": betvalue, "win": winvalue };
                        resolve(jsArray);
                    } else {
                        let jsArray = { "bet": 0, "win": 0 };
                        resolve(jsArray);
                    }
                }
            });
        });
    }

    static async valuedailyRegisterMamber(post) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM member WHERE created_at >='${post.startdate}' AND created_at <= '${post.endDate}'`;
            connection.query(sql, (error, results) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    const totalCount = `SELECT COUNT(*) as count FROM member`
                    connection.query(totalCount, (error, res) => {
                        let value = results.length;
                        let total = res[0].count
                        let jsArray = { "membervalue": value, "allmember": total };
                        resolve(jsArray);
                    })
                }
            });
        });
    }

    static async valuedailyFinanceDeposit(post) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM logfinanceuser WHERE tpyefinance = 'ฝาก' AND transaction_date >='${post.startdate}' AND transaction_date <= '${post.endDate}'`;
            connection.query(sql, (error, results) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    if (results.length !== 0) {
                        let depositvalue = 0;
                        for (let i = 0; i < results.length; i++) {
                            depositvalue += results[i].quantity;
                        }
                        let jsArray = { "depositvalut": depositvalue };
                        resolve(jsArray);
                    } else {
                        let jsArray = { "depositvalut": 0 };
                        resolve(jsArray);
                    }
                }
            });
        });
    }

    static async valuedailyFinanceWithdraw(post) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM logfinanceuser WHERE tpyefinance = 'ถอน' AND transaction_date >='${post.startdate}' AND transaction_date <= '${post.endDate}'`;
            connection.query(sql, (error, results) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    if (results.length !== 0) {
                        let withdrawvalue = 0;
                        for (let i = 0; i < results.length; i++) {
                            withdrawvalue += results[i].quantity;
                        }
                        let jsArray = { "withdrawvalue": withdrawvalue };
                        resolve(jsArray);
                    } else {
                        let jsArray = { "withdrawvalue": 0 };
                        resolve(jsArray);
                    }
                }
            });
        });
    }

    static async valuedailyFinanceDepositTotal() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM logfinanceuser WHERE tpyefinance = 'ฝาก'`;
            connection.query(sql, (error, results) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    if (results.length !== 0) {
                        let depositvalueTolal = 0;
                        for (let i = 0; i < results.length; i++) {
                            depositvalueTolal += results[i].quantity;
                        }
                        let jsArray = { "depositvalutTotal": depositvalueTolal };
                        resolve(jsArray);
                    } else {
                        let jsArray = { "depositvalutTotal": 0 };
                        resolve(jsArray);
                    }
                }
            });
        });
    }

    static async valuedailyFinanceWithdrawTotal() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM logfinanceuser WHERE tpyefinance = 'ถอน'`;
            connection.query(sql, (error, results) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    if (results.length !== 0) {
                        let withdrawvalueTotal = 0;
                        for (let i = 0; i < results.length; i++) {
                            withdrawvalueTotal += results[i].quantity;
                        }
                        let jsArray = { "withdrawvalueTotal": withdrawvalueTotal };
                        resolve(jsArray);
                    } else {
                        let jsArray = { "withdrawvalueTotal": 0 };
                        resolve(jsArray);
                    }
                }
            });
        });
    }
    /*--------------------------------------------------------------------------------- reports Game All End*/
};