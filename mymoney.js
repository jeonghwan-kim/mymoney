// ==================================================
// Class Definition: Expens
// ==================================================

function Expense(id, date, item, text, money) {
    this.id = id;
    this.date = date;
    this.item = item;
    this.text = text;
    this.money = new Number(money);
    this.written_order = new Number(this.date.getDate()) * 1000 + new Number(this.id);
    // *1000은 날짜에 비중을 더 주기 위함
}

Expense.prototype.toHtml = function() {
    
    var text = "<p id='" + this.id + "'>";  
    
    if (this.item != "") // 항목이 있을 경우
        text += "(" + this.item + ") ";
        
    text += this.text + " " + this.money.formatMoney() 
    + " <input id='delete' type='button' value='삭제' onclick='deleteNode(" + this.id + ")'; />" 
    + "</p>";

    return text;
}

Expense.prototype.getDate = function() {
    return this.date.getDate();
}

// Date.toString 함수 재정의
Date.prototype.toString = function() {
    return this.getFullYear() + "-" + (this.getMonth() + 1) + "-" + this.getDate();
}

// Number를 금액 형식으로 출력
Number.prototype.formatMoney = function(c, d, t){
    var n = this;
    var c = isNaN(c = Math.abs(c)) ? 2 : c;
    var t = ",";
    var s = n < 0 ? "-" : "";
    var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
    var j = (j = i.length) > 3 ? j % 3 : 0;
    return s 
        + (j ? i.substr(0, j) + t : "") 
        + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
 };

// 배열에서 특정 인덱스(혹은 구간) 삭제
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

// array에 저장된 정보를 html 문서로 변환
Array.prototype.toHtml = function(is_only_recent) {
    if (this.length == 0) return;
    
    var recent_date = this[0].getDate(); // 최신 날짜
    
    if (is_only_recent == true) // 최근 날짜만 출력할 경우 현제 데이테 삭제(갱신시 활용)
        $("#contents").empty();
        
    for (var i = 0; i < this.length; i++) {
        // 최신날짜 출력할 경우: 최신날짜가 아니면 break
        if ((is_only_recent == true) && (this[i].getDate() != recent_date))
            break;
        // 최신 날짜 출력이 아닐 경우: 최신날짜이면 continue
        if ((is_only_recent == false) && (this[i].getDate() == recent_date))
            continue;
        if ((i == 0) || (i > 0 && this[i].getDate() != this[i - 1].getDate())){ 
            // 날짜가 변경될 경우: 날짜 출력				
            $("#contents").append("<h4>" + this[i].date + "</h4>");
        }
        $("#contents").append(this[i].toHtml()); // (항목) 내용, 금액 출력
    }
    
    if (is_only_recent == false)
        $("#morebtn").remove();    
}

// 총액 출력
Array.prototype.totalAmount = function() {
    var sum = 0;
    for (var i = 0; i < this.length; i++) {
        sum += this[i].money;
    }
    $("#total_amount").text("총지출: " + sum.formatMoney() + "원");
}



// ==================================================
// Global varialbles
// ==================================================

var entries = new Array(); // xml문서 내용을 파싱하여 담는 배열
var httpReq = new XMLHttpRequest(); 

// ==================================================
// Functions
// ==================================================

// 페이지 로딩시 작업들
$(document).ready(function() {
    $("#title").click( function() {
        $('#view_page').css("display", "block"); // view 보이기
        $('#write_page').css("display", "none"); // write 숨기기
    });
    
    $("#writebtn").click( function() {
        $('#view_page').css("display", "none"); // view 숨기기
        $('#write_page').css("display", "block"); // write 보이기
    });

    $("#more").click( function() {
        entries.toHtml(false);
    });

    $("#middle").add("<p id='loadmsg'>loading...</p>"); // 로딩중 메제지
    
    // xml 문서 호출
    if (!httpReq) {
        alert('XMLHttpRequest() error'); 
        return;
    }
    httpReq.abort(); // kill the previous request
    var url = getXmlFilename() + "?dummy=" + new Date().getTime(); // to override cach
    httpReq.open("get", url, true);
    httpReq.send();
    httpReq.onreadystatechange = loadXml;
    
});

// xml 요청 응답함수: xml->객체 저장, 정렬, html 출력
function loadXml() {
    if (httpReq.readyState == 4 && httpReq.status == 200) {
        // xml 문서 -> array로 저장
        var entry = httpReq.responseXML.getElementsByTagName("entry"); // xml 문서
        for (var i = 0; i < entry.length; i++) {
            var date_string = getText(entry[i].getElementsByTagName("date")[0]).split('-');
            var year = date_string[0];
            var month = date_string[1];
            var date = date_string[2];
            entries.push( new Expense(
                getText(entry[i].getElementsByTagName("id")[0]),
                new Date(year, month - 1, date),
                getText(entry[i].getElementsByTagName("item")[0]),
                getText(entry[i].getElementsByTagName("text")[0]),
                getText(entry[i].getElementsByTagName("money")[0]))
            );
        }
     
        $("#loadmsg").remove(); // 로딩중 메세지 제거
        
        entries.sort(function(a, b){return b.written_order - a.written_order;}); // 최근 시간순으로 array 정렬
        entries.totalAmount(); // 총액 출력
        entries.toHtml(true); // 배열 내용을 html로 출력 (true: 최근 일자만 출력)
        if (entries.length == 0) // 배열 내용이 없을 경우 더보기 버튼 감추기
            $("#morebtn").css("display", "none");
    } // endh of if
}


// element 로 부터 nodeValue 얻어내는 함수 (없으면 "" 반환)
function getText(elem) {
    var text = "";
    if (elem) {
        if (elem.childNodes) {
            var child = elem.childNodes[0];
            if (child && child.nodeValue) text = child.nodeValue;
        }
    }
    return text;
}

// 노드 삭제하기
function deleteNode(delete_id) {
    var response = confirm("Delete?");
    
    if (response) {
        httpReq = new XMLHttpRequest();
        if (!httpReq) {
            alert('XMLHttpRequest() error');
            exit;
        }
        httpReq.abort(); // kill the previous request
        httpReq.open("post", "delete.php", true);
        httpReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=euc-kr");
        var url = "delete_id=" + delete_id + "&filename=" + getXmlFilename() +"&dummy=" + (new Date).getTime();
        httpReq.send(url);  
            
        httpReq.onreadystatechange = function() {       
            // write.php 정상 호출될 경우
            if (httpReq.readyState == 4 && httpReq.status == 200) {
                // 배열에서 삭제
                var delete_date;
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].id == delete_id) {
                        delete_date = entries[i].date.getDate(); // 삭제된 항목의 날짜 구하기
                        entries.remove(i); 
                    }
                }
                $("#" + delete_id).remove(); // 화면 표시에서 삭제
                entries.totalAmount(); // 변경된 총 지출액 출력
                if (entries.length == 0) // 배열 내용이 없을 경우 더보기 버튼 감추기
                    $("#morebtn").css("display", "none");
                }           
        }
    } 
}

// "2012-12.xml" 형태의 파일명 얻는 함수
function getXmlFilename() {	
	var today = new Date();
	var xmlFilename = today.getFullYear() + "-" + (today.getMonth() + 1) + ".xml";
	return xmlFilename;
}