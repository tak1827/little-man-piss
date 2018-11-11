/*global $, document, window, event, setInterval, setTimeout, clearInterval,localStorage,andjs*/
var TIME_LIMIT = 60;
var WATER_LIMIT = 131;
var COLOR_NUM = 15; // 負荷軽減のためHitAnimeのcolorをNum色に抑える
var fps = 20;
var scoreCount;
var waters = [];
var star = [];
var context = null;
var context2 = null;
var returnWasPressed = false;
var displayedWaterNum = 10;// 画面に表示される水滴の数

$(document).ready(function() {
    //    // スマフォで正しく表示される
    $(window).bind('resize load', function(){
        $("html").css("zoom" , $(window).width()/640 );
    });
    // スクロール禁止
    window.addEventListener('touchmove', function() {
        document.body.ontouchmove = event.preventDefault();
    }, false);
    // 画面遷移
    $(document).on('touchmove', '.abtn', function (e) {
        e.preventDefault();
    }).on('touchend', '.abtn', function () {
        return movePage($(this).attr("alt"));
    });
    ////////////////////// // チュートリアル////////////////////////////
    $(document).on('touchmove', '.slide', function (e) {
        e.preventDefault();
    }).on('touchend', '.slide', function () {
        // cssのleft値を取得してを数値に変換
        var imagesLeft = $(".images").css("left").replace(/px/, "") * 1;
        // Math.abs:絶対値　Math.floor:小数以下切り下げ
        var currentPage = Math.abs(Math.floor(imagesLeft / 640));
        imagesLeft = Math.floor(imagesLeft / 640) * 640;
        // 右の矢印が選択されたら　last-child:最後の要素
        if ($(this).is(":last-child")) {
            if (imagesLeft > -1280) {
                $("#tutorial .images").animate({
                    left : (imagesLeft - 640) + "px"
                }, 500, function() {
                    $(".dot").removeClass("active");
                    $(".dot:eq(" + (currentPage + 1) + ")").addClass("active");
                });
            }
            // 左の矢印が選択されたら
        } else {
            if (imagesLeft < 0) {
                $(".images").animate({
                    left : (imagesLeft + 640) + "px"
                }, 500, function() {
                    $(".dot").removeClass("active");
                    $(".dot:eq(" + (currentPage - 1) + ")").addClass("active");
                });
            }
        }
    });
    
    // ////////////////////ゲーム////////////////////////
    $(document).on('touchmove', '.touch', function (e) {
        e.preventDefault();
    }).on('touchend', '.touch', function () {
        main();
//        poopHitAnime.timerForPaint = setInterval(poopHitAnime.paint, 1000/fps);
        $(this).hide();
    });
    var touching = false;
    var touchingR = false;
    var $arrow_right = $("#arrow_right");
    var $arrow_left = $("#arrow_left");
    var $document = $(document);
    var $walkman = $("#walkman");
    var manTimer;
    var manTick = 0;
    // 右の矢印をクリック
    $arrow_right.bind('touchstart', function() {
        if (!touching) {
            touching = true;
            touchingR = true;
        }
    });
    // 左の矢印をクリック
    $arrow_left.bind('touchstart', function() {
        if (!touching) {
            touching = true;
            touchingR = false;
        }
    });
    $document.bind('touchend', function() {
        touching = false;
    });
    function manMove(isRight) {
        // 右に移動
        if (isRight) {
            $walkman.css({backgroundPosition: 200*(manTick) + "px 300px",});
            // 右端に来たら
            if (parseFloat($walkman.css('left')) < 580) {
                $walkman.css("left", "+=15px");
            }
        // 左に移動
        } else {
            $walkman.css({backgroundPosition: 200*(10-manTick) + "px 0px",});
            // 左端に来たら　replaceで"px"を除去
            if (parseFloat($walkman.css('left')) > -140) {
                $walkman.css("left", "-=15px");
            }
        }
        manTick++;
        if (manTick > 20) {
            manTick = 0;
        }
    }
    
    var canvas = $('#myCanvas');
    var canvas2 = $('#myCanvas2');
    try {
        context = canvas.get(0).getContext('2d');
        context2 = canvas2.get(0).getContext('2d');
    } catch(e) {
        //
    }
    ///////////////戻るボタンが押されたとき///////////////
    $(document).on('touchmove', '#game .return', function (e) {
        e.preventDefault();
    }).on('touchend', '#game .return', function () {
        returnWasPressed = true;
        return movePage($(this).attr("alt"));
    });
    /////////////////放水///////////////
    var counterForCycle = 0,// 放水の周期を管理するため
        variableforCycle = 0,
        toSeparate = displayedWaterNum -1;
    // 小僧に近い & 周期が長い
    var cycle00 = [500, 1000, 40];
    // 小僧に遠い & 周期が長い
    var cycle01 = [450, 900, 90];
    // 小僧に近い & 周期が短い
    var cycle000 = [200, 400, 30];
    var cycle001 = [150, 300, 20];
    // 小僧に遠い & 周期が短い
    var cycle002 = [300, 600, 60];
    var cycle003 = [250, 500, 50];
    var cycleTop = [cycle00, cycle01, cycle000, cycle001, cycle002, cycle003];
    var cycle = cycle002; // サイクルの初期値
    
    // watersにwaterの初期値を入れる
    for (var i = 0 ; i < displayedWaterNum ; i++) {
        waters.push(new water.ini());
    }
    function waterMove() {
        for (var i = 0 ; i < displayedWaterNum ; i++) {
            var tmpWater = waters[i];
            if (toSeparate < i) {
                if (counterForCycle >=　cycle[0] && counterForCycle < cycle[1]) {
                    variableforCycle--;
                } else if (counterForCycle >= cycle[1]){
                    // カウンターの初期化
                    counterForCycle = -1;
                    // 周期を変える
                    cycle = cycleTop[Math.floor( Math.random()*6)];
                } else {
                    variableforCycle++;
                }
                counterForCycle++;
        
                // xとyの新しい座標
                tmpWater.x += 15;
                var y_temp = tmpWater.y;
                tmpWater.y += (tmpWater.y - tmpWater.y_prev) + 2 +(variableforCycle/cycle[2]);
                tmpWater.y_prev = y_temp;
                
                // トイレとの衝突チェック
                if (tmpWater.y > 650) {
                    tmpWater.wasHit = water.checkHitWater(tmpWater.x, tmpWater.y , manPosition);
                }
                // 画面の外に出たら
                if(tmpWater.y > 850) {
                    tmpWater.isOut = true;
                    tmpWater.x = 70;
                    tmpWater.y = 365;
                    tmpWater.y_prev = 410;
                }
            }
        }
    }
    var manPosition;
    var tick = 0;
    var main = function() {
        // 画面をクリア
        context.clearRect(0, 0, canvas.width(),canvas.height());
        poopHitAnime.paint();
        // マンの位置
        manPosition = parseFloat($walkman.css('left'));
        
        //////////////////// 矢印がタッチされてたら//////////////////
        if (touching) {
            if (touchingR) {
                manMove(true);
            } else {
                manMove(false);
            }
        }
        ///////////////////////////放水//////////////////////////
        waterMove();
        // 描画処理
        water.create();
        
        // 放水に関する
        if (tick % 4 ===0) {
            toSeparate--;
            // 水滴が塊にならないようにするために一旦水滴の座標を初期化
        } else if (tick === 650){
            toSeparate = displayedWaterNum - 1;
            for (var j = displayedWaterNum ; j--; ) {
                var tmpWater = waters[j];
                tmpWater.x = 70;
                tmpWater.y = 365;
                tmpWater.y_prev = 410;
                tmpWater.wasHit = false;
                tmpWater.isOut = false;
            }
        }
        //////////////////// タイマーの表示//////////////////
        if (tick % 20 === 0) {
            $("#leftTime").html("<h1>" + Math.ceil(60 - tick/20) + "</h1>");
            if (tick === 0) {
                $(".timer.second").addClass("timermove");
            } else if (tick === 600) {
                $(".timer.forth").show();
            } else if (tick === 1000) {
                $("#leftTime").addClass("red");
            }
        }
        ////////////////////////うんち//////////////////
        if (poop.canThrow) {
            poop.create();
        } else {
            poop.move();
//            if (poop.isOut) {
//                poop.remove();
//                poop.isOut = false;
//            }
        }
        // 画像処理あり
//        if(!poop.canThrow && poop.tick === 0) {
//            poop.ini();
//        }
        if (poopHitAnime.during) {
            poopHitAnime.create(poopHitAnime.positionX);
        }
        
        ////////////////////////画面遷移//////////////////
        if (overFlow.isOverFlow || tick === TIME_LIMIT*20 + 1 || returnWasPressed) {
            context.clearRect(0, 0, canvas.width(),canvas.height());
            context2.clearRect(0, 0, canvas2.width(),canvas2.height());
            $("#walkman, #arrow_right, #arrow_left, #game .return").hide();
            counterForCycle = 0;
            variableforCycle = 0;
            toSeparate = displayedWaterNum -1;
            poop.clear();
            if (overFlow.isOverFlow) {
                gameover.create();
            } else if (tick === TIME_LIMIT*20 + 1) {
                gameclear.create();
                $("#leftTime").html('');
            } else if (returnWasPressed) {
                //
            }
            tick = -1;
        } else {
            setTimeout(main, 1000/fps);
        }
        
        tick++;
    };
});

// 画面遷移のため
function movePage(pageName) {
    switch (pageName) {
    case "top":
        scoreCount = undefined;
        andjs.showAd();
        break;
    case "tutorial":
        $("#tutorial .footer .dot_holder .dot").removeClass("active");
        // フッターの最初のドットを表示
        $("#tutorial .footer .dot_holder .dot:first").addClass("active");
        $(".images").css("left", 0 + "px");
        andjs.hideAd();
        break;
    case "game":
        returnWasPressed = false;
        context.clearRect(0, 0, 640,839);
        context2.clearRect(0, 0, 640,290);
        scoreCount = 0;
        water.clear();
        man.clear();
        overFlow.clear();
        $(".touch, #arrow_right, #arrow_left, #game .return").show();
        $("#overflow img").css("top",134 + "px");
        $(".timer.forth").hide();
        $(".timer.second").removeClass("timermove");
        $("#leftTime").removeClass("red").html("<h1>60</h1>");
        andjs.hideAd();
        break;
    case "record":
        record.clear();
        record.displayRank();
        break;
    case "apps":
        andjs.cutinAd();
        break;
    default:
        break;
    }
    // カットインしたときに画面が真っ暗にならないように
    if (pageName != "apps") {
        $(".panel").removeClass("active");
        $("#" + pageName).addClass("active");
    }
    return false;
}
var water = {
    ini : function () {
        this.x = 70;
        this.y = 365;
        this.y_prev = 410;
        this.wasHit = false;
        this.isOut = false;
    },
    waterHitAnime : function(x, y) {
        var hue = Math.floor(Math.random() * (COLOR_NUM + 1)) * 360 / COLOR_NUM;
        var radius = Math.floor(Math.random() * 20) + 30 ;
        context2.fillStyle  =  "hsla(" + hue + ", 100%, 50%, 1)";
        context2.beginPath();
        context2.arc(x, y-550, radius, 0, Math.PI*2, true);
        context2.fill();
    },
    create : function() {
        for (var i = 0 ; i < displayedWaterNum ; i++) {
            var tmpWater = waters[i];
            // トイレと衝突していなかったら
            if (!tmpWater.wasHit){
                context.fillStyle = "rgb(0, 255, 255)";
                context.beginPath();
                context.arc(tmpWater.x, tmpWater.y - (Math.floor(Math.random()*6)/5), 20, 0, Math.PI*2, false);
                context.fill();
            } else {
                // トイレと衝突してたら
                this.waterHitAnime(tmpWater.x, tmpWater.y);
                tmpWater.wasHit = false;
                // ここで初期化しないとおかしくなする
                tmpWater.x = 70;
                tmpWater.y = 365;
                tmpWater.y_prev = 410;
            }
            // 画面の外なら
            if (tmpWater.isOut) {
                overFlow.create();
                tmpWater.isOut = false;
            }
        }
    },
    checkHitWater : function(x, y, mPosi) {
        var toiletX = mPosi + 110;
        var dX = toiletX - x;
        var dY = 660 - y;
    //    var dY2 = 720 - y;
    //    var dY3 = 780 - y;
        var distance1 = Math.sqrt((dX*dX) + (dY*dY));
    //    // manの下に落ちた水もカウントするため
    //    var distance2 = Math.sqrt((dX*dX) + (dY2*dY2));
    //    var distance3 = Math.sqrt((dX*dX) + (dY3*dY3));
        if (distance1 < 60 ) {
            scoreCount++;
            return true;
        } else {
            return false;
        }
    },
    clear : function () {
        for (var k = 0 ; k < 10 ; k++) {
            waters[k].x = 70;
            waters[k].y = 365;
            waters[k].y_prev = 410;
            waters[k].wasHit = false;
        }
    },
};
var overFlow = {
    waterLevel : 0,
    isOverFlow : false,
    create : function() {
        this.waterLevel++;
        if (this.waterLevel > WATER_LIMIT) {
            this.isOverFlow = true;
        } else {
            $("#overflow img").css("top", 134 - this.waterLevel + "px");
        }
    },
    clear : function() {
        this.waterLevel = 0;
        this.isOverFlow = false;
    },
};
var poopHitAnime = {
    timer : null,
    during : false,
    paint : function () {
        context2.globalCompositeOperation = "source-over";
        context2.fillStyle = "rgba(255,255,255,.5)";
        context2.fillRect(0, 0, 640, 290);
    },
    tick : 0,
    positionX : 0,
    makeStar : function(x,vb,sb) {
        var velocity = Math.random() * 5 + vb;
        var radian = Math.random() * Math.PI * 2;
        var velocityX = velocity * Math.cos(radian);
        var velocityY = velocity * Math.sin(radian);
        var hue = Math.floor(Math.random() * (COLOR_NUM + 1)) * 360 / COLOR_NUM;
        var radius = (Math.random() * 5 + sb);
        //新規玉作成
        star[star.length] = {x:x, y:120, vx:velocityX, vy:velocityY, hue:hue, radius:radius};
    },
    create : function (x) {
        if (poopHitAnime.tick < 10) {// 円を作る個数＝poopHitAnimeTick
            if (poop.isRare) {
                // makeStar(x, speed, radius);
                poopHitAnime.makeStar(x, 6, 25);
                poopHitAnime.makeStar(x, 6, 25);
            } else {
                poopHitAnime.makeStar(x, 6, 15);
            }
        }
        var drawItems = [];
        for (var i = 0, len = star.length ; i < len; i++) {
            var starNow = star[i];
            //玉移動
            starNow.vy += 0.5;
            starNow.y += starNow.vy;
            starNow.x += starNow.vx;
            starNow.radius -= 1;
            if (starNow.radius < 0) {
                starNow.radius = 0;
            }
            //エリア外で削除
            if (starNow.x > 640 || starNow.x < 0 || starNow.y > 290 || starNow.y < 0 || starNow.radius <= 0) {
                star.splice(i, 1);
                len--;
                i--;
            } else {
                // 負荷軽減のために同じ色を後でまとめて描画する
                drawItems[starNow.hue] = [];
                drawItems[starNow.hue].push(starNow);
            }
        }
        // 玉を描画, 色別に分けて一気に塗ることで負荷を軽減する
        for (var hue in drawItems) {
            var item = drawItems[hue];
            context2.fillStyle  =  "hsla(" + hue + ", 100%, 50%, 1)";
            context2.beginPath();
            for (var l = item.length; l-- ; ) {
                var starNow2 = item[l];
                context2.moveTo(starNow2.x + starNow2.radius, starNow2.y);
                context2.arc(starNow2.x, starNow2.y, starNow2.radius, 0,  Math.PI * 2, false);
            }
            context2.fill();
        }
        poopHitAnime.tick++;
        // 全ての円が画面から消えたら
        if (star.length === 0) {
            poopHitAnime.tick = 0;
//            clearInterval(poopHitAnime.timer);
            poopHitAnime.during = false;
        }
    },
};
var man = {
    clear : function() {
        man.isRight = false;
        man.tick = 0;
        $("#walkman").css({backgroundPosition: 0 + "px 0px",}).css("left", "400px").show();
    },
};
var poop = {
    canThrow : true,
    isRare : false,
    isOut : true,
    positionX : 0,// 衝突判定のため
    tick : 0,
    create : function() {
        var pX = 0;
        var random = Math.floor( Math.random()*1000);
        // うんちを降らせるか
        switch (random) {
        case 0:
            pX = 150;
            break;
        case 1:
            pX = 300;
            break;
        case 2:
            pX = 450;
            break;
        case 3:
            pX = 570;
            break;
        }
        if (pX !== 0) {
            // レアか普通か
            if (Math.floor( Math.random()*10) > 0) {
                this.isRare = false;
            } else {
                this.isRare = true;
            }
            poop.canThrow = false;
            poop.isOut = false;
            this.positionX = pX;
        }
    },
    ini : function() {
        var $poop = $("#poop");
        var $rapoop = $("#rapoop");
        if(!this.isRare) {
            // うんちを位置にセット
            $poop.css({"left": this.positionX + "px", "top": -70 + "px"});
            // うんちを見えるようにする
            $poop.show();
        } else {
            $rapoop.css({"left": this.positionX + "px", "top": -70 + "px"});
            $rapoop.show();
        }
    },
//    remove : function() {
//        if(!poop.isRare) {
//                $("#poop").hide();
//        } else {
//                $("#rapoop").hide();
//        }
//    },
    x : 0,
    y : -70,
    move :function() {
        var $poop = $("#poop");
        var $rapoop = $("#rapoop");
        // レアうんちなら
        if (!this.isRare) {
            if (this.tick === 0) {
                this.y = -70;
                // うんちをケツの位置にセット
                $poop.css({"left": this.positionX + "px", "top": -70 + "px"});
                // うんちを見えるようにする
                $poop.show();
            } else {
                this.y += 15;
                $poop.css({"top": this.y + "px"});
            }
           
            if (parseFloat($poop.css('top')) > 780) {
                $poop.hide();
                poop.isOut = true;
                this.tick = -1;
                this.canThrow = true;
            } else if (parseFloat($poop.css('top')) > 600) {
                this.checkHit(false);
            }
            // 普通のうんちなら
        } else {
            if (this.tick === 0) {
                this.y = -70;
                // うんちをケツの位置にセット
                $rapoop.css({"left": this.positionX + "px", "top": -70 + "px"});
                // うんちを見えるようにする
                $rapoop.show();
            } else {
                this.y += 15;
                $rapoop.css({"top": this.y + "px"});
            }
            if (parseFloat($rapoop.css('top')) > 780) {
                $rapoop.hide();
                poop.isOut = true;
                this.tick = -1;
                this.canThrow = true;
            } else if (parseFloat($rapoop.css('top')) > 600) {
                this.checkHit(true);
            }
        }
        this.tick++;
    },
//    move :function(manPosi) {
//        if (this.tick > 44 && this.tick < 47) {
//            this.checkHit(manPosi);
//        }
//        // 画面の外に出たら or うんちをキャッチしたら
//        if (this.tick >= 50 || poopHitAnime.during) {
//            poop.isOut = true;
//            this.tick = -1;
//            this.canThrow = true;
//            if (!this.isRare) {
//                $("#poop").hide();
//            } else {
//                $("#rapoop").hide();
//            }
//        }
//        this.tick++;
//    },
    checkHit : function(isRare) {
        var $poop = $("#poop");
        var $rapoop = $("#rapoop");
        var toiletX = parseFloat($("#walkman").css('left')) + 110;
        var toiletY = 655;
        if (!isRare) {
            var poopX = parseFloat($poop.css('left')) + 30;
            var poopY = parseFloat($poop.css('top')) + 30;
            var dX = toiletX - poopX;
            var dY = toiletY - poopY;
            var distance = Math.sqrt((dX*dX) + (dY*dY));
            if (distance < 50 ) {
                this.tick = -1;
                this.canThrow = true;
                $poop.hide();
                scoreCount += 50;
                poopHitAnime.during = true;
                poop.isRare = false;
                poop.isOut = false;
                poopHitAnime.positionX = toiletX;
                return true;
            } else {
                return false;
            }
        } else {
            var rapoopX = parseFloat($rapoop.css('left')) + 30;
            var rapoopY = parseFloat($rapoop.css('top')) + 30;
            var radX = toiletX - rapoopX;
            var radY = toiletY - rapoopY;
            var radistance = Math.sqrt((radX*radX) + (radY*radY));
            if (radistance < 50 ) {
                this.tick = -1;
                this.canThrow = true;
                $rapoop.hide();
                scoreCount += 100;
                poopHitAnime.during = true;
                poop.isRare = true;
                poop.isOut = false;
                poopHitAnime.positionX = toiletX;
                return true;
            } else {
                return false;
            }
        }
    },
//        if (Math.abs(dX) < 50) {
//            poopHitAnime.during = true;
//            poopHitAnime.positionX = toiletX;
////            poopHitAnime.timer = setInterval(poopHitAnime.create, 1000/fps);
//            if (!this.isRare) {
//                scoreCount += 50;
//                $("#poop").hide();
//                poop.isOut = true;
////                poop.isOut = false;
//            } else {
//                scoreCount += 100;
//                $("#rapoop").hide();
//                poop.isOut = true;
////                poop.isOut = false;
//            }
//        }
//    },
    clear : function() {
        this.canThrow = true;
        this.tick = 0;
        this.isOut = true;
        $("#poop, #rapoop").hide();
    }
};
var gameover = {
    create : function() {
        gameover.timer = setInterval(function(){gameover.move();}, 1000/fps);
    },
    tick : 0,
    move :function() {
        if(this.tick === 10) {
            $(".black, .soul").show();
            var soulX = parseFloat($("#walkman").css('left')) - 50;
            $(".soul").css({"left": soulX + "px", "top":"400px"});
        } else if (this.tick > 10) {
//            $(".soul").css("top", "-=" + 8 + "px");
            $(".soul").addClass("move");
        }
        // GAMEOVERのフェードイン
        if(this.tick === 30 ) {
            $(".gameoverLetter").fadeIn("slow");
            // うんちヒットアニメーションを止める
            clearInterval(poopHitAnime.timerForPaint);
            // 記録画面へ
        } else if (this.tick === 50) {
            // 記録画面の初期化
            record.clear();
            record.discplayNowScore();
        } else if (this.tick === 60) {
            record.displayRank();
        } else if (this.tick > 70) {
            clearInterval(gameover.timer);
            // gameoverの初期化
            $(".black, .soul, .gameoverLetter").hide();
            this.tick = -1;
            // 記録画面へ遷移
            $(".panel").removeClass("active");
            $("#record").addClass("active");
            andjs.showAd();
        }
        this.tick++;
    }
};
var gameclear = {
    anim : function (tick) {
        $(".ring").css({
            backgroundPosition: 640*(tick) + "px 0px",
        });
    },
    create : function() {
        gameclear.timer = setInterval(function(){gameclear.move();}, 1000/fps);
    },
    tick : 0,
    move :function() {
        if(this.tick === 10) {
            $(".black, .clearangel").show();
        } else if (this.tick === 20) {
//            $(".clearangel").fadeIn("slow");
            $(".clearangel").addClass("move");
        } else if (this.tick === 50) {
            $(".ring").fadeIn("slow");
            $(".ring").addClass("move");
        }
        // CLEARのフェードイン
        if(this.tick === 50) {
            $(".clearLetter").fadeIn("slow");
            // うんちヒットアニメーションを止める
            clearInterval(poopHitAnime.timerForPaint);
        } else if (this.tick === 60) {
            // 記録画面の初期化
            record.clear();
            record.discplayNowScore();
        } else if (this.tick === 90){
            record.displayRank();
        } else if (this.tick > 110) {
            clearInterval(gameclear.timer);
            // gameclearの初期化
            $(".black, .clearangel, .clearLetter, .ring").hide();
            this.tick = -1;
            // 記録画面へ遷移
            $(".panel").removeClass("active");
            $("#record").addClass("active");
            andjs.showAd();
        }
        this.tick++;
    }
};
var record = {
    discplayNowScore : function() {
        $('#now').children().text(scoreCount + " P");
//        $(".score.now").html("<h1>" + scoreCount + " P</h1>");
    },
    checkNewRank : null,
    displayRank : function () {
        /////////////////ストレージの初期化////////////////////
        //  localStorage.clear();　// ←ローカルストレージのデータを全て消去
        if (localStorage.getItem('No1_Score') === null) {
            localStorage.setItem('No1_Score', 0);
            localStorage.setItem('No2_Score', 0);
            localStorage.setItem('No3_Score', 0);
            localStorage.setItem('No4_Score', 0);
            localStorage.setItem('No5_Score', 0);
        }
        var strageData = [];
        var keyOfStrage = ['No1_Score', 'No2_Score', 'No3_Score', 'No4_Score', 'No5_Score'];
        // 配列にローカルストレージから取得したデータをいれる
        for (var i = 0 ; i < localStorage.length ; i++) {
            // 数値に置き換えて配列に追加
            strageData.push(parseInt(localStorage.getItem(keyOfStrage[i]), null));
        }
        function desc(a,b){
            return (b-a);
        }
        // ローカルストレージの更新
        for (var m = 0 ; m < localStorage.length ; m++) {
            // 現在のスコアがランキング圏内か調べる
            if (scoreCount >= strageData[m]) {
                strageData.push(scoreCount);
                // scoreCountの初期化
                scoreCount = undefined;
                // strageDataを降順に並び替え，並び替えたものをストレージに保存
                strageData.sort(desc);
                // ローカルストレージの更新
                for (var j = 0 ; j < localStorage.length ; j++) {
                    localStorage.setItem(keyOfStrage[j], strageData[j]);
                }
                // ランキング表示の更新のため
                this.checkNewRank = m;
                break;
            }
        }
        for (var n = 0 ; n < localStorage.length ; n++) {
            // ランキングが更新されたら
            if (n === this.checkNewRank) {
                $(".rank .score:eq("+ n + ")").addClass("renewal").children().text( (n+1) + "位　"　+ localStorage.getItem(keyOfStrage[n]));
            } else {
                $(".rank .score:eq("+ n + ")").children().text( (n+1) + "位　"　+ localStorage.getItem(keyOfStrage[n]));
            }
        }
    },
    clear : function() {
//        $(".score").empty();
        $('#now').children().text("");
        $(".score").removeClass("renewal");
        this.checkNewRank = null;
    },
};