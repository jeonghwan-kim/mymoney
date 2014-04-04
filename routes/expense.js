var path = require('path');
var mysqlPool = require(path.join(__dirname, './mysql-pool'));
var monthString = require(path.join(__dirname, './monthstring'));


exports.listExpense = function (req, res) {
	// Check signin
	if (req.session.isSigned !== true) {
		res.redirect('/signin');
		return;
	}

	var uid = req.params.uid;
	var yearMonth = req.params.yearMonth;

	if (!uid || !yearMonth) {
		res.send(400, 'uid or yearMonth is invalid');
		return;
	}

	getMonthlyHistory(uid, yearMonth, function (data, total) {
		getMonthList(uid, function (monthList) {
			res.render('expense-history', {
				data: data,
				total: total,
				monthList: monthList,
				curMonth: yearMonth,
				uid: uid
			});
			return;
		});
	});
};

exports.insertExpense = function (req, res) {
	var date = req.body.date;
	var text = req.body.text;
	var amount = req.body.amount;
	var uid = req.session.uid;

	if (!uid || !date || !text || !amount) {
		throw new Error ('uid or date or text or amount is invalid');
	}

	var q = "insert into money.expense (uid, date, text, amount) values " +
		"(" + uid + ", '" + date + "', '" + text + "', '" +  amount + "')";

	mysqlPool.getConnection(function (err, conn) {
		if (err) {
			throw err;
		}

		conn.query(q, function (err, data) {
			conn.release();
			if (err) {
				throw err;
			}

			if (data.insertId > 0) {
				res.redirect('/expense/' + uid + '/' + monthString(date));
			} else {
				res.send(500);
			}
		});
	});
};

exports.deleteExpense = function (req, res) {
	// Check signin
	if (req.session.isSigned !== true) {
		res.redirect('/signin');
		return;
	}

	var id = req.body.id;
	var uid = req.session.uid;

	if (!id) {
		res.send(400, 'id is invalid');
		return;
	}

	mysqlPool.getConnection(function (err, conn) {
		if (err) {
			throw err;
		}

		var q = "delete from money.expense where id=" + id + " and uid=" + uid;
		conn.query(q, function (err, data) {
			conn.release();
			if (err) {
				throw err;
			}

			res.send({deletedRows: data.affectedRows});
			return;
		});
	});
};




/**
 * 사용자가 기록한 지출월 목록을 반환한다.
 *
 * @param  {[type]}   uid [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
function getMonthList(uid, cb) {
	if (!uid) {
		throw new Error('uid is invalid');
	}

	mysqlPool.getConnection(function (err, conn) {
		if (err) {
			throw err;
		}

		var q = "select distinct(substr(date,1,7)) as yearmonth from money.expense where uid='" + uid + "' order by yearmonth desc";

		conn.query(q, function (err, data) {
			conn.release();
			if (err) {
				throw err;
			}

			cb(data);
			return;
		});
	});
}

/**
 * 월별 지출 이력을 반환한다.
 *
 * @param  {[type]}   uid       [description]
 * @param  {[type]}   yearMonth [description]
 * @param  {Function} cb        [description]
 * @return {[type]}             [description]
 */
function getMonthlyHistory(uid, yearMonth, cb) {
	if (!uid || !yearMonth) {
		throw new Error('uid or yearMonth is invalid');
	}

	mysqlPool.getConnection(function (err, conn) {
		if (err) {
			throw err;
		}

		var q = "select * from (select *, substr(date,1,7) as month from money.expense where uid='" + uid + "') as a where month='" + yearMonth + "' order by date desc, id desc";

		conn.query(q, function (err, data) {
			conn.release();
			if (err) {
				throw err;
			}

			var i, len = data.length, total = 0;
			for (i = 0; i < len; i++) {
				// 날짜 형식 변환
				var tmp = new Date(data[i].date);
				data[i].date = tmp.getFullYear() + '-' +
					(tmp.getMonth() + 1) + '-' +
					tmp.getDate();

				// 총 지출 계산
				total += data[i].amount;
			}

			cb(data, total);
			return;
		});
	});
}