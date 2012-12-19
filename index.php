<?php 
    require_once("htmlAuth.php");
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<title>My Money</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="stylesheet" type="text/css" href="style.css" />
	<meta name="viewport" content="user-scalable=no, width=device-width" />
	<script type="text/javascript" src="jquery.js"></script>
	<script type="text/javascript" src="mymoney.js"></script>
	<script type="text/javascript" src="write.js"></script>
</head>
<body>
<div id="wrapper">

    <!-- top -->
	<div id="top">
		<h1><a id="title" href="./">My Money</a></h1>
	</div>

    <!-- view --> 
	<div id="view_page">
		<div id="summary">
			<h3 id="total_amount"></h3>
			<input id="writebtn" class="btn" type="button" value="지출 입력" />
		</div>

		<div id="contents">
		</div>

		<div id="morebtn">
			<input id="more" class="btn" type="button" value="더 보기"/>
		</div>
	</div>
	
	<!-- write -->
    <div id="write_page">
        <div id="editor">
            일시: <input id="date" type="text" /><br />
            분류: <input id="item" type="text" /><br />
            내용: <input id="text" type="text" /><br />
            금액: <input id="money" type="text" /><br />
            <div id="save">
                <input class="btn" type="button" value="저장" />
            </div>
        </div>
    </div>

    <!-- footer -->    
	<div id="footer">
		<p>매월 가계부에 정리 할 것</p>
	</div>
</div>	
</body>
</html>