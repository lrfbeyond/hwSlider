/*
 * hwSlider内容滑动切换插件 - v1.0
 * by 月光光
 * http://www.helloweba.com
*/
;(function($, window, document, undefined) {
    var HwSlider = function(ele, opt){
        var self = this;
        self.$element = ele,
        self.defaults = {
            width: 600, //初始宽度
            height: 320, //初始高度
            start: 1, //初始滑动位置，从第几个开始滑动
            speed: 400, //滑动速度，单位ms
            interval: 3000, //间隔时间，单位ms
            autoPlay: false,  //是否自动滑动
            dotShow: true, //是否显示圆点导航
            arrShow: true, //是否显示左右方向箭头导航
            touch: true, //是否支持触摸滑动
            afterSlider: function(){}
        },
        self.clickable = true,  //是否已经点击了滑块在做滑动动画
        self.options = $.extend({}, self.defaults, opt)
    }
    HwSlider.prototype = {
        init: function(){
            var self = this,
                ele = self.$element;

            var sliderInder = ele.children('ul')
            var hwsliderLi = sliderInder.children('li');
            var hwsliderSize = hwsliderLi.length;  //滑块的总个数
            var index = self.options.start;
            var touchStartY = 0,touchStartX = 0;

            //显示左右方向键
            if(self.options.arrShow){
                var arrElement = '<a href="javascript:;" class="arr prev">&lt;</a><a href="javascript:;" class="arr next">&gt;</a>';
                ele.append(arrElement);
            }

            for(i=1;i<=hwsliderSize;i++){
                if(index==i) hwsliderLi.eq(index-1).addClass('active');
            }

            //显示圆点导航
            if(self.options.dotShow){
                var dot = '';
                for(i=1;i<=hwsliderSize;i++){
                    if(index==i){
                        dot += '<span data-index="'+i+'" class="active"></span>';
                    }else{
                        dot += '<span data-index="'+i+'"></span>';
                    }
                }
                var dotElement = '<div class="dots">'+dot+'</div>';
                ele.append(dotElement);
            }

            //初始化组件
            var resize = function(){
                var sWidth = ele.width();
                //根据滑块宽度等比例缩放高度
                var sHeight = self.options.height/self.options.width*sWidth;
                ele.css('height',sHeight); 

                if(self.options.arrShow){
                    var arrOffset = (sHeight-40)/2;
                    ele.find(".arr").css('top',arrOffset+'px'); //导航箭头位置
                }
                if(self.options.dotShow){
                    var dotWidth = hwsliderSize*20;
                    var dotOffset = (sWidth-dotWidth)/2;
                    ele.find(".dots").css('left',dotOffset+'px'); //导航圆点位置
                }
            }

            ele.css('height',self.options.height);
            resize();

            //窗口大小变换时自适应
            $(window).resize(function(){
              resize();
            });


            if(self.options.arrShow){
                //点击右箭头
                ele.find('.next').on('click', function(event) {
                    event.preventDefault();
                    if(self.clickable){
                        if(index >= hwsliderSize){
                            index = 1;
                        }else{
                            index += 1;
                        }
                        self.moveTo(index,'next');
                    }
                });

                //点击左箭头
                ele.find(".prev").on('click', function(event) {
                    event.preventDefault();
                    if(self.clickable){
                        if(index == 1){
                            index = hwsliderSize;
                        }else{
                            index -= 1;
                        }

                        self.moveTo(index,'prev');
                    }
                    
                });
            }

            //点击导航圆点
            if(self.options.dotShow){
                ele.find(".dots span").on('click',  function(event) {
                    event.preventDefault();
                    
                    if(self.clickable){
                        var dotIndex = $(this).data('index');
                        if(dotIndex > index){
                            dir = 'next';
                        }else{
                            dir = 'prev';
                        }
                        if(dotIndex != index){
                            index = dotIndex;
                            self.moveTo(index, dir);
                        }
                    }
                });
            }

            //自动滑动
            if(self.options.autoPlay){
                var timer;
                var play = function(){
                    index++;
                    if(index > hwsliderSize){
                        index = 1;
                    }
                    self.moveTo(index, 'next');
                }
                timer = setInterval(play, self.options.interval); //设置定时器

                //鼠标滑上时暂停
                ele.hover(function() {
                    timer = clearInterval(timer);
                }, function() {
                    timer = setInterval(play, self.options.interval);
                });
            };

            //触摸滑动
            if(self.options.touch){
                hwsliderLi.on({
                    //触控开始
                    'touchstart': function(e) {
                        touchStartY = e.originalEvent.touches[0].clientY;
                        touchStartX = e.originalEvent.touches[0].clientX;
                    },

                    //触控结束
                    'touchend': function(e) {
                        var touchEndY = e.originalEvent.changedTouches[0].clientY,
                            touchEndX = e.originalEvent.changedTouches[0].clientX,
                            yDiff = touchStartY - touchEndY,
                            xDiff = touchStartX - touchEndX;

                        
                        //判断滑动方向
                        if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
                            if ( xDiff > 5 ) {
                                if(index >= hwsliderSize){
                                    index = 1;
                                }else{
                                    index += 1;
                                }
                                self.moveTo(index,'next');
                            } else {
                                if(index == 1){
                                    index = hwsliderSize;
                                }else{
                                    index -= 1;
                                }
                                self.moveTo(index,'prev');
                            }                       
                        }
                        touchStartY = null;
                        touchStartX = null;
                    },

                    //触控移动
                    'touchmove': function(e) {
                        if(e.preventDefault) { e.preventDefault(); }

                    }
                });
            }
        },

        //滑动移动
        moveTo: function(index,dir){ 
            var self = this,
                ele = self.$element;
            var clickable = self.clickable;
            var dots = ele.find(".dots span");
            var sliderInder = ele.children('ul');
            var hwsliderLi = sliderInder.children('li');
            
            if(clickable){
                self.clickable = false;

                //位移距离
                var offset = ele.width();
                if(dir == 'prev'){
                    offset = -1*offset;
                }

                //当前滑块动画
                sliderInder.children('.active').stop().animate({
                    left: -offset},
                    self.options.speed,
                     function() {
                        $(this).removeClass('active');
                });
                //下一个滑块动画
                hwsliderLi.eq(index-1).css('left', offset + 'px').addClass('active').stop().animate({
                    left: 0}, 
                    self.options.speed,
                    function(){
                        self.clickable = true;
                });

                self.options.afterSlider.call(self);
                //显示可切换的圆点
                dots.removeClass('active');
                dots.eq(index-1).addClass('active');
                
            }else{
                return false;
            }
        }
        
    }
    

    $.fn.hwSlider = function(options) {
        var hwSlider = new HwSlider(this, options);
        return this.each(function () {
            hwSlider.init();
        });
    };
})(jQuery, window, document);