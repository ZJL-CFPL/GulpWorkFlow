/**
 * 工具函数 - 显示元素
 * @param {*} section 需要显示的的元素类
 * 用法: showSection('.test') showSection('#test')
 *
 */
var $prevSection

function showSection(section) {
	if ($prevSection) {
		$prevSection.removeClass('show')
	}
	$prevSection = $(section)
	$prevSection.addClass('show')
}

// 点击进入大赛科普  进入立即了解页面
$('.details-1-btns-item').on('click', function () {
	$('.page.details-1').removeClass('anin')
	$('.page.details-2').addClass('anin')
	showSection('.details-2')
})

// 点击立即了解按钮 进入活动详情页
$('.details-2-btn').on('click', function () {
	showSection('.wrap')
	sliderFun()

	$('.page.details-2').removeClass('anin')
	$('.details-tenth').addClass('anin')
})

// 点击我要报名按钮 进入报名页面
$('.wrap').on('click', '.details-8-btn', function () {

	$('.details-nine').addClass('anin')
	showSection('.details-nine')
})

// 点击马上开启按钮 显示弹窗
$('.details-nine-btn').on('click', function () {
	$('.modal').addClass('show')
	$('.details-nine-title').addClass('ani')
	$('.details-nine-btn').addClass('aniBtn')
})

// 点击关闭按钮 隐藏弹窗
$('.modal-close').on('click', function () {
	$('.modal').removeClass('show')
	$('.details-nine-title').removeClass('ani')
	$('.details-nine-btn').removeClass('aniBtn')
})

/* Data: 2020-05-01 Edit: Hani Describe: 修改页面跳转逻辑 */
// 需要显示的页面数组内容
var currentPageList = []
const pageList = [{
		id: 0,
		title: 'AI应用案例可以选哪些场景呢?',
		list: [{
				icon: 'icon-6',
				title: '人脸识别:',
				text: '智慧零售、考勤签到、刷脸支付、互动娱乐'
			},
			{
				icon: 'icon-7',
				title: '文字识别OCR:',
				text: '卡证、车牌、票据、教育、文档自动录入等场景'
			},
			{
				icon: 'icon-8',
				title: '人脸核身:',
				text: '银行开户、运营商开卡、网上招聘等\n线上身份核验场景'
			},
			{
				icon: 'icon-9',
				title: '人脸特效:',
				text: '美颜、试装、变脸、变性别、变年龄、玩转互动娱乐'
			},
			{
				icon: 'icon-10',
				title: '语音识别:',
				text: '智能客服、电话录音质检、会议记录、字幕生成'
			},
		]
	},
	{
		di: 1,
		title: '音视频案例可以选哪些场景呢?',
		list: [{
				icon: 'icon-11',
				title: '直播点播:',
				text: '赛事直播、游戏直播、直播培训、带货直播、\n视频监控等'
			},
			{
				icon: 'icon-12',
				title: '实时音视频:',
				text: '在线教育、视频会议、视频群聊、语音聊天室、\n直播连麦等'
			},
			{
				icon: 'icon-13',
				title: '互动课堂:',
				text: '在线语培、K12学科教育、双师教育、STEAM培训等'
			}
		]
	},
	{
		id: 2,
		title: '安全案例可以选哪些场景呢?',
		list: [{
				icon: 'icon-14',
				title: '应用安全:',
				text: '小程序安全、Web应用防火墙、移动应用安全等'
			},
			{
				icon: 'icon-15',
				title: '数据安全:',
				text: '密钥管理系统、数据防泄漏系统\n数据安全治理中心等'
			},
			{
				icon: 'icon-16',
				title: '业务安全:',
				text: '营销风控、活动防刷、多因子认证、反欺诈等'
			}
		]
	},
	{
		id: 3,
		title: '小程序云开发案例可以选哪些场景呢?',
		list: [{
				icon: 'icon-17',
				title: '微信小程序:',
				text: '小程序商城、小游戏、效率工具小程序、\n在线教育小程序 '
			},
			{
				icon: 'icon-18',
				title: 'WEB应用:',
				text: '建站系统、H5创意营销、CMS、电商系统'
			}
		]
	}
]
$('.wrap').on('click', '.details-answer .details-answer-item', function (e) {
	// 点击事件内获取页面所有内容数组
	var allPageList = pageList

	// 判断点击的下标
	if ($(this).index() == 0) {
		currentPageList = allPageList.splice($(this).index(), 1)
	} else {
		currentPageList = allPageList.splice($(this).index(), 1)
	}

	var pageClass = '.details-answer-0'

	sliderPageShow(pageClass, currentPageList, 0)
	myslider.next()
	showSection('.wrap')
})

function sliderPageShow($pageClass, pageList, listIndex) {
	// 添加标题文案
	$($pageClass).find('.details-dialogue-p').text(pageList[listIndex].title)
	$('.details-scenes-list').empty()
	for (let index = 0; index < pageList[listIndex].list.length; index++) {
		var $item;
		(function (index) {
			$item =
				'<div class="details-scenes-item">' +
				'<div class="details-answer-icon ' + pageList[listIndex].list[index].icon + '"></div>' +
				'<div class="details-scenes-options">' +
				'<div class="details-scenes-title">' + pageList[listIndex].list[index].title + '</div>' +
				'<div class="details-scenes-text details-scenes-text1">' + pageList[listIndex].list[index].text + '</div>' +
				'</div>' +
				'</div>'
		})(index)
		$($item).appendTo($('.details-scenes-list'))
	}
}

var myslider

function sliderFun() {
	myslider = new iSlider({
		lastLocate: false,
		noslide: [1, 6],
		onslide: function (index) {
			$('.item.play').find('.details-ani').addClass('anin')
			// $('.details-tenth').addClass('tenth');
			// $('.page').addClass('anin');
			if (index == 2) {
				myslider.lockPrev = true
				pageClass = `.details-answer-${0}`
				sliderPageShow(pageClass, currentPageList, 0)
			} else if (index == 3) {
				myslider.lockPrev = false
				pageClass = `.details-answer-${1}`
				sliderPageShow(pageClass, pageList, 0)
			} else if (index == 4) {
				myslider.lockPrev = false
				pageClass = `.details-answer-${2}`
				sliderPageShow(pageClass, pageList, 1)
			} else if (index == 5) {
				myslider.lockPrev = false
				pageClass = `.details-answer-${3}`
				sliderPageShow(pageClass, pageList, 2)
			}
		},
	})
}

// 背景音乐
var bgm = new Howl({
	/* 音频路径 可用相对路径 */
	src: ['./audio/txys.mp3'],
	/* 是否循环播放 默认为 false */
	autoplay: false,
	/* 是否循环播放 默认为 false */
	loop: true,
	/* 设置声音大小，从 0.0 到 1.0 */
	volume: 1,
	html5: true, // 设置为true 页面将使用原生video 标签渲染 不会导致资源跨域的情况
})

var isBgmPlay = false

$('.page.index').addClass('anin')

$('.index-btn').on('click', function () {
	$('.page.index').removeClass('anin')
	$('.page.details-1').addClass('anin')
	$('.index').removeClass('show')
	showSection('.details-1')
	if (isBgmPlay == false) {
		$('.music').removeClass('paused')
		bgm.play()
		isBgmPlay = true
	}
})

// 点击背景音乐icon
$('.music').on('click', function () {
	$(this).toggleClass('paused')
	if (isBgmPlay == false) {
		bgm.play()
		isBgmPlay = true
	} else {
		bgm.stop()
		isBgmPlay = false
	}
})