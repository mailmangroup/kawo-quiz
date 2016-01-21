var data = {
	questions: [
		{
			"question" : {
				"en" : "On average, what time are people most active on WeChat?",
				"zh" : "一般来说，用户一天内使用微信最多的是几点？"
			},
			"answer": "true",
			"response": {
				"en":"On average, netizens were most active on WeChat at 22:00 in 2015.",
				"zh":"根据2015年的统计，微信用户最爱在晚上10点左右使用该软件。"
			}
		}
	]
}

var images = {
	correct: [
		'icon_024.gif',
	],
	incorrect: [
		'icon_025.gif',
	]
}

var seenImages = {
	correct: [],
	incorrect: []
}

// HELPER FUNCTION
// PICK AN IMAGE THAT HASNT BEEN SEEN TO DISPLAY
// ===============================================================================
function imageSelect ( options ) {

	if ( images ) {

		for ( var i = 0; i < images[ options ].length; i++ ) {

			// GENERATE INDEX BETWEEN 0 AND IMAGE ARRAY LENGTH
			var random = Math.floor( Math.random() * images[ options ].length );

			// IF THE IMAGE HASNT BEEN SEEN BEFORE › PUSH SELECTED IMAGE TO ARRAY AND RETURN IMAGE
			if ( seenImages[ options ].indexOf( images[ options ][ random ] ) === -1 ) {

				// PUSH IMAGE URL TO SEEN IMAGES ARRAY
				seenImages[ options ].push( images[ options ][ random ] );

				// RETURN THE IMAGE
				return images[ options ][ random ];

			}

		}

	}

}

// CREATE SCREEN FUNCTION
// ===============================================================================
function Screen ( textElement ) {

	this.el = document.createElement( 'section' );
	this.el.className = 'main-wrapper';

	this.article = document.createElement( 'article' );
	this.el.appendChild( this.article );

	this.textWrapper = document.createElement( 'div' );
	this.text = {};
	this.text.zh = document.createElement( textElement );
	this.text.en = document.createElement( textElement );

	this.choiceList = document.createElement( 'div' );
	this.choiceList.className = 'btn-list';

	this.article.appendChild( this.textWrapper );
	this.textWrapper.appendChild( this.text.zh );
	this.textWrapper.appendChild( this.text.en );
	this.article.appendChild( this.choiceList );

	return this;

}

function progressBar( ) {

	this.el = document.createElement( 'div' );
	this.inner = document.createElement( 'div' );
	this.text = document.createElement( 'span' );
	this.el.className = 'progress-bar';
	this.inner.className = 'progress-bar-inner';
	this.el.appendChild( this.inner );
	this.el.appendChild( this.text );

	return this;

}


// CREATE QUIZ OBJECT
// ===============================================================================
var quiz = {

	data: data,

	currentQuestion: 0,

	correct: [],

	incorrect: [],

	// UPDATE PROGRESS BAR FUNCTION
	// ===============================================================================
	updateBar: function ( bar, question, dataLength ) {

		bar.text.innerHTML = ( parseInt( question ) + 1 ) + ' of ' + dataLength;
		bar.inner.style.width = ( ( parseInt( question ) + 1 ) / dataLength ) * 100 + '%';

		return bar;

	},

	// BUILD QUIZ PAGE FUNCTION
	// ===============================================================================
	init: function (  ) {

		// PREVENT SCROLL ON IPHONES TO DISABLE OVERFLOW JUMP
		document.ontouchmove = function( e ) { e.preventDefault(); }

		// IF THERE ARE ALREADY ANSWERS BUT NO PROGRESS IN LOCALSTORAGE › REMOVE ANSWERS FROM LOCALSTORAGE
		if ( localStorage.getItem( 'answers' ) && !localStorage.getItem( 'progress' ) ) localStorage.removeItem( 'answers' );

		// CREATE PROGRESS BARS
		this.progress = new progressBar();

		this.shadowBar = new progressBar();

		// IF LAST QUESTION ANSWERED BUT DIDNT CLICK FINISH › RUN FINISH FUNCTION
		if ( localStorage.getItem( 'progress' ) && this.data.questions.length === localStorage.getItem( 'progress' ).length ) {

			var results = JSON.parse( localStorage.getItem( 'answers' ) );

			window.ga && ga( 'send', 'event', 'finish-quiz', 'Finish Quiz', results.correct.length.toString() + '/' + ( results.correct.length + results.incorrect.length ).toString() );

			window.mixpanel && mixpanel.track( 'finish-quiz', { question: 'Finish Quiz', label: results.correct.length.toString() + '/' + ( results.correct.length + results.incorrect.length ).toString(), } );

			this.finishQuiz( results.correct );

		}

		// RUN FIRST NEXT QUESTION CALL ON INIT
		this.setQuestion( this.data, document.getElementById( 'target' ) );

		var intro = document.getElementById( 'intro-screen' );

		if ( intro ) setTimeout( function () { intro.parentNode.removeChild( intro ); }, 1200 );

		return this;

	},


	// NEXT QUESTION FUNCTION
	// ===============================================================================
	setQuestion: function ( data, target ) {

		this.questionScreen = new Screen( 'h2' );

		var $this = this,
			theQuestion = data.questions[ this.currentQuestion ],
			screen = this.questionScreen;

		// APPEND PROGRESS BAR
		if ( screen.article && screen.article.parentNode )
			screen.article.parentNode.insertBefore( this.progress.el, screen.article );

		// UPDATE PROGRESS BAR
		this.updateBar( this.progress, this.currentQuestion, data.questions.length );

		// SET TEXT OF QUESTIONS
		screen.text.zh.innerHTML = theQuestion.question.zh;
		screen.text.en.innerHTML = theQuestion.question.en;

		screen.choice = [
			{ label: 'true', text: '中文／true' },
			{ label: 'false', text: '中文／false' }
		]

		// SET HTML AND EVENT LISTENER OF CHOICES
		// ===========================================================================
		for ( var i = 0; i < screen.choice.length; i ++ ) {

			var choice = screen.choice[ i ];

			// IF NO CHOICE ELEMENT AT INDEX › CREATE CHOICE ELEMENT
			// =======================================================================
			if ( !choice.el ) {

				choice.el = document.createElement( 'div' );
				choice.el.className = 'choice';
				choice.el.setAttribute( 'data-label', choice.label );

				// CREATE CHOICE BUTTON
				choice.button = document.createElement( 'button' );
				choice.button.className = 'btn';
				choice.button.innerHTML = choice.text;

			}

			// APPEND CHOICE ELEMENT TO CHOICES LIST
			if ( !choice.el.parentNode )
				screen.choiceList.appendChild( choice.el );

			if ( !choice.button.parentNode )
				choice.el.appendChild( choice.button );

			// ADD EVENT LISTENER
			// =======================================================================
			choice.el.addEventListener( 'click', function ( e ) {

				this.classList.add( 'clicked' );

				// SET ANSWERS TO EMPTY ARRAY
				var answers = {
					correct: [],
					incorrect: []
				};

				// IF LOCALSTORAGE ALREADY HAS ANSWERS › SET TO CURRENT LOCALSTORAGE DATA SO THERES NO OVERWRITE
				if ( localStorage.getItem( 'answers' ) )
					answers = JSON.parse( localStorage.getItem( 'answers' ) );

				if ( this.getAttribute( 'data-label' ).toLowerCase() === theQuestion.answer.toLowerCase() ) {

					// PUSH CURRENT QUESTION TO CORRECT ARRAY
					answers.correct.push( $this.currentQuestion );

					// RETURN CORRECT RESPONSE
					$this.correctResponse( theQuestion.response );

					window.ga && ga( 'send', 'event', 'answered-question', 'Question ' + $this.currentQuestion, 'Correct: ' + this.getAttribute( 'data-label' ) );

					window.mixpanel && mixpanel.track( 'answered-question', { question: 'Question ' + $this.currentQuestion, label: 'Correct: ' + this.getAttribute( 'data-label' ), } );

				}

				else {

					// PUSH CURRENT QUESTION TO INCORRECT ARRAY
					answers.incorrect.push( $this.currentQuestion );

					// RETURN WRONG RESPONSE
					$this.incorrectResponse( theQuestion.response );

					window.ga && ga( 'send', 'event', 'answered-question', 'Question ' + $this.currentQuestion, 'Incorrect: ' + this.getAttribute( 'data-label' ) );

					window.mixpanel && mixpanel.track( 'answered-question', { question: 'Question ' + $this.currentQuestion, label: 'Incorrect: ' + this.getAttribute( 'data-label' ), } );

				}

				// LOG ANSWERS ARRAY TO LOCALSTORAGE
				localStorage.setItem( 'answers', JSON.stringify( answers ) );

			});

		}

		this.currentQuestion = parseInt( this.currentQuestion );
		this.currentQuestion += 1;

		// IF THERES A RESPONSE SCREEN OPEN › CLOSE RESPONSE SCEEN
		if ( this.response && this.response.el.parentNode )
			this.closeScreen( $this.response, screen.el );

		// ELSE › APPEND TO BODY
		else {

			document.getElementById( 'target' ).appendChild( screen.el );

			// ADD OPEN CLASS FOR ANIMATION
			setTimeout( function() { screen.el.classList.add( 'open' ); }, 50 );

		}

		return this;

	},


	// RESPONSE SCREEN FUNCTION
	// ===============================================================================
	responseScreen: function ( target ) {

		// LOG CURRENT QUESTION TO LOCALSTORAGE
		if ( localStorage ) localStorage.setItem( 'progress', JSON.stringify( this.currentQuestion ) );

		var $this = this;

		this.response = new Screen( 'h2' );

		// APPEND PROGRESS BAR
		this.response.article.parentNode.insertBefore( this.progress.el, this.response.article );

		// ADD AND APPEND IMAGE
		if ( !this.response.image )
			this.response.image = document.createElement( 'img' );

		if ( !this.response.parentNode && this.response.textWrapper.parentNode )
			this.response.textWrapper.parentNode.insertBefore( this.response.image, this.response.textWrapper );

		// ADD NEXT BUTTON
		// ============================================================================
		this.response.button = document.createElement( 'button' );
		this.response.button.className = 'btn btn-red';
		this.response.choiceList.appendChild( this.response.button );

		// IF NOT LAST QUESTION › SET TEXT OF BUTTON TO REFLECT THAT
		if ( this.currentQuestion < this.data.questions.length )
			this.response.button.innerHTML = 'Next Question / 下一题'

		// ELSE › SET BUTTON TEXT TO FINISH QUIZ
		else this.response.button.innerHTML = 'Finish Quiz! / 结束测试！';

		// ADD CLICK EVENT TO NEXT QUESTION BUTTON
		this.response.button.addEventListener( 'click', function ( ) {

			// IF NOT LAST QUESTION › LOAD NEXT QUESTION ON CLICK
			if ( $this.currentQuestion < $this.data.questions.length ) {

				window.ga && ga( 'send', 'event', 'next-question', 'Question ' + $this.currentQuestion, 'Question ' + $this.currentQuestion );

				window.mixpanel && mixpanel.track( 'next-question', { question: 'Question ' + $this.currentQuestion, label: null, } );

				$this.setQuestion( $this.data, document.getElementById( 'target' ) );

			}

			// ELSE › RUN FINISH QUIZ FUNCTION WITH DATA FROM LOCALSTORAGE
			else {

				// STORE COMPLETED ITEM TO LOCALSTORAGE
				localStorage.setItem( 'completed', JSON.stringify( 'true' ) );

				var results = JSON.parse( localStorage.getItem( 'answers' ) );

				window.ga && ga( 'send', 'event', 'finish-quiz', 'Finish Quiz', results.correct.length.toString() + '/' + ( results.correct.length + results.incorrect.length ).toString() );

				window.mixpanel && mixpanel.track( 'finish-quiz', { question: 'Finish Quiz', label: results.correct.length.toString() + '/' + ( results.correct.length + results.incorrect.length ).toString(), } );

				$this.finishQuiz( results.correct );

			}

		} );

		// CLOSE QUESTION SCREEN AND APPEND RESPONSE SCREEN
		this.closeScreen( this.questionScreen, this.response.el );

		return this;

	},

	closeScreen: function ( theScreenObject, replacement, theScreenElement ) {

		var $this = this;

		// APPEND SHADOW BAR TO SCREEN
		if ( theScreenObject && theScreenObject.article ) theScreenObject.article.parentNode.insertBefore( this.shadowBar.el, theScreenObject.article );
		if ( this.shadowBar ) this.updateBar( this.shadowBar, this.currentQuestion - 1, data.questions.length );

		// APPEND NEW SCREEN TO BODY
		document.getElementById( 'target' ).appendChild( replacement );

		// ADD OPEN CLASS FOR ANIMATION
		setTimeout( function() { replacement.classList.add( 'open' ); }, 50 );

		// CLOSE SCREEN ON ANIMATION FINISH
		setTimeout( function () {

			if ( theScreenObject && theScreenObject.el ) {

				theScreenObject.el.parentNode.removeChild( theScreenObject.el );

			} else if ( theScreenElement ) {

				theScreenElement.parentNode.removeChild( theScreenElement );

			}

		}, 1250 );

	},

	// CORRECT ANSWER FUNCTION
	// ===============================================================================
	correctResponse: function ( response ) {

		this.responseScreen( document.getElementById( 'target' ) );

		var image = imageSelect( 'correct' );

		this.response.image.src = './images/' + image;

		this.response.text.zh.innerHTML = '<strong class="correct">是啊！</strong>&nbsp;' + response.zh;
		this.response.text.en.innerHTML = '<strong class="correct">Correct!</strong>&nbsp;' + response.en;

		return this;

	},


	// WRONG ANSWER FUNCTION
	// ===============================================================================
	incorrectResponse: function ( response ) {

		this.responseScreen( document.getElementById( 'target' ) );

		var image = imageSelect( 'incorrect' );

		this.response.image.src = './images/' + image;

		this.response.text.zh.innerHTML = '<strong class="incorrect">不是！</strong>&nbsp;' + response.zh;
		this.response.text.en.innerHTML = '<strong class="incorrect">Wrong!</strong>&nbsp;' + response.en;

		return this;

	},

	// DISPLAY RESULTS PAGE FUNCTION
	// ===============================================================================
	finishQuiz: function ( correctAnswers ) {

		var $this = this;

		var resultsPage = new Screen( 'h2' );
		resultsPage.el.id = 'splash-screen';
		resultsPage.el.classList.add( 'final-screen' );

		// ADD AND APPEND SHARE CTA
		resultsPage.shareCTA = document.createElement( 'small' );
		resultsPage.shareCTA.className = 'share-wechat';
		resultsPage.shareCTA.innerHTML = '分享该测试!<br>Share the quiz!';
		resultsPage.article.insertBefore( resultsPage.shareCTA, resultsPage.textWrapper );

		// ADD AND APPEND ARROW
		resultsPage.arrow = document.createElement( 'img' );
		resultsPage.arrow.className = 'arrow share-wechat';
		resultsPage.arrow.src = './images/assets/arrow.png';
		resultsPage.article.insertBefore( resultsPage.arrow, resultsPage.choiceList );

		resultsPage.textWrapper.classList.add( 'vertical-center' );

		// ADD AND APPEND IMAGE
		resultsPage.image = document.createElement( 'img' );
		resultsPage.image.className = 'normal-image character';
		resultsPage.textWrapper.insertBefore( resultsPage.image, resultsPage.text.zh );

		var moreInformation = document.createElement( 'div' );

		resultsPage.article.appendChild( moreInformation );

		resultsPage.followCTA = document.createElement( 'small' );
		resultsPage.followCTA.innerHTML = '科握制造。了解更多<br>Produced by KAWO. Learn more'
		moreInformation.appendChild( resultsPage.followCTA );

		resultsPage.logo = document.createElement( 'div' );
		resultsPage.logo.className = 'logo logo-icon';
		moreInformation.appendChild( resultsPage.logo );

		// ON CLICK OF MORE INFORMATION › OPEN INFORMATION PAGE
		moreInformation.addEventListener( 'click', function() {

			// LOG RESULTS PAGE TO THIS TO BE ACCESSIBLE VIA CLOSE FUNCTION
			$this.resultsPage = resultsPage;

			$this.learnMore();

			window.ga && ga( 'send', 'event', 'learn-more', 'Learn More', 'Learn More' );

			window.mixpanel && mixpanel.track( 'learn-more', { question: 'Learn More', label: null, } );


		});


		// ALTER PAGE ACCORDING TO SCORE
		// ============================================================================

		// DONT LET BE MROE THAN 100% THROUGH LOCAL STORAGE HACKS
		if ( correctAnswers.length > 20 ) var correct = '20';
		else var correct = correctAnswers.length.toString();

		var scoreEn = correct + '/' + this.data.questions.length.toString(),
			scoreZh = this.data.questions.length.toString() + '题中的' + correct;

		// IF THEY SCORED 80% OR HIGHER › DISPLAY DIGITAL MASTER PAGE
		if ( correctAnswers.length / this.data.questions.length >= 0.8 ) {

			var levelImage = 'shifuKAWO.png',
				levelMessageEn = '. <br>Congratulations! You\'re a digital shīfù!',
				levelMessageZh = '题，恭喜你得到了‘数码师傅’的称号！',
				titleMessage = '我是一个数码师傅。快来参加问答！I\'m a digital shīfù, are you? Take the quiz!';

		}

		// IF THEY SCORED BETWEEN 80% AND 30% › DISPLAY DIGITAL UNCLE PAGE
		else if ( correctAnswers.length / this.data.questions.length >= 0.35 ) {

			var levelImage = 'uncleKAWO.png',
				levelMessageEn = '. <br>Not bad, you\'re a digital dàshū!',
				levelMessageZh = '题，你可以得到‘数码大叔’的称号，看起来还不错嘛！',
				titleMessage = '我是一个数码大叔。 快来参加问答！I\'m a digital dàshū. Take the quiz!';

		}

		// ELSE › DISPLAY DIGITAL BABY PAGE
		else {

			var levelImage = 'babyKAWO.png',
				levelMessageEn = ' and are a digital bǎobǎo. Time to study!',
				levelMessageZh = '题，看来你只能得到‘数码宝宝’的称号，还要继续努力啊！',
				titleMessage = '我是一个数码宝宝。快来参加问答！I\'m a digital bǎobǎo. Take the quiz!';

		}

		// SET INNER HTML OF TEXT
		resultsPage.text.zh.innerHTML = '你答对了' + scoreZh + levelMessageZh;
		resultsPage.text.en.innerHTML = 'You scored ' + scoreEn + levelMessageEn;

		// SET CHARACTER IMAGE URL
		resultsPage.image.src = './images/characters/' + levelImage;

		// SET NEW TITLE FOR SHARING
		var title = document.querySelectorAll( 'title' )[ 0 ];
		if ( title ) title.innerHTML = titleMessage;

		// CLOSE RESPONSE SCREEN AND APPEND RESULTS SCREEN
		if ( this.responseScreen )
			this.closeScreen( this.responseScreen, resultsPage.el );

		else
			document.getElementById( 'target' ).appendChild( resultsPage.el );

		// IF ON DESKTOP › LOAD FACEBOOK AND TWITTER SHARE ICONS
		if ( window.innerWidth > 641 ) {

			// FACEBOOK SHARE SCRIPT
			(function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) return;js = d.createElement(s); js.id = id;js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.3";fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'facebook-jssdk'));

			// TWITTER SHARE SCRIPT
			!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

			var shareList = document.createElement( 'ul' ),
				facebookShare = document.createElement( 'li' ),
				twitterShare = document.createElement( 'li' ),
				facebookShareInner = document.createElement( 'div' ),
				twitterShareInner = document.createElement( 'a' ),
				shareTarget = document.getElementById( 'share-target' );

			shareTarget.style.padding = '10px';

			facebookShareInner.className = 'fb-share-button';
			facebookShareInner.setAttribute( 'data-layout', 'button_count' );

			twitterShareInner.className = 'twitter-share-button';
			twitterShareInner.href = 'https://twitter.com/share';
			twitterShareInner.setAttribute( 'data-via', 'kawo' );
			twitterShareInner.innerHTML = 'Tweet';

			shareList.appendChild( facebookShare );
			shareList.appendChild( twitterShare );
			facebookShare.appendChild( facebookShareInner );
			twitterShare.appendChild( twitterShareInner );

			// APPEND SHARE BUTTONS TO SHARE TARGET
			shareTarget.appendChild( shareList );

		}

		return this;

	},

	learnMore: function(  ) {

		var learnMore = new Screen( 'h2' );
		learnMore.el.id = 'splash-screen';
		learnMore.el.classList.add( 'learn-more-screen' );

		learnMore.logo = document.createElement( 'div' );
		learnMore.logo.className = 'logo';
		learnMore.textWrapper.parentNode.insertBefore( learnMore.logo, learnMore.textWrapper );

		learnMore.text.zh.innerHTML = '从初稿，规划，再到发布，分析数据，KAWO帮助您的品牌在中国大放异彩。<br><a href="http://kawo.com/cn.html">在科握官方网站了解更多</a>';
		learnMore.text.en.innerHTML = 'KAWO is an enterprise Weibo & WeChat management tool helping organizations take control of their brand in China. <br>Learn more at <a href="http://kawo.com">KAWO.com</a>';

		// ADD FOLLOW INFORMATION TO CHOICE LIST
		learnMore.followCTA = document.createElement( 'small' );
		learnMore.followCTA.innerHTML = '最新详情请可以关注KAWO的微信。<br>Follow us on WeChat.'
		learnMore.choiceList.appendChild( learnMore.followCTA );

		// ADD QR CODE
		learnMore.qrCode = document.createElement( 'img' );
		learnMore.qrCode.className = 'normal-image';
		learnMore.qrCode.src = './images/assets/qr-code.jpg';
		learnMore.article.appendChild( learnMore.qrCode );

		// CLOSE RESPONSE SCREEN AND APPEND RESULTS SCREEN
		if ( this.resultsPage ) this.closeScreen( this.resultsPage.el, learnMore.el );

		else {

			document.body.appendChild( learnMore.el );

			setTimeot( function (  ) {

				learnMore.el.classList.add( 'open' );

				if ( learnMore.el.getBoundingClientRect().height <= 568 ) learnMore.el.classList.add( 'smaller-screen' );

			}, 50 );

		}

		// SET NEW TITLE
		var title = document.querySelectorAll( 'title' )[ 0 ];
		if ( title ) title.innerHTML = 'KAWO Quiz';

	},

}

// ON LOAD › CREATE SPLASH SCREEN OR SET QUESTIONS ACCORINDG TO LOCAL STORAGE
// ===============================================================================
window.onload = function () {

	// IF QUIZ NOT STARTED YET › SET SPLASH SCREEN
	// ============================================================================
	if ( !localStorage.getItem( 'progress' ) && !localStorage.getItem( 'completed' ) ) {

		var splash = new Screen( 'h2' );

		splash.el.id = 'splash-screen';
		splash.el.classList.add( 'landing-screen' );

		splash.el.classList.add( 'open' );

		splash.textWrapper.className = 'splash-text-wrapper';
		splash.text.zh.innerHTML = '中文中文?';
		splash.text.en.innerHTML = 'Do you know China better than Donald Trump?';
		splash.text.en.style.textTransform = 'uppercase';

		// ADD NEXT BUTTON
		splash.button = document.createElement( 'button' );
		splash.button.className = 'btn btn-white';
		splash.choiceList.appendChild( splash.button );

		// ADD TEXT TO BUTTON
		splash.button.innerHTML = '<span class="btn-zh">开始测试</span>Get Started'

		splash.logo = document.createElement( 'div' );
		splash.logo.className = 'logo logo-icon';
		splash.choiceList.appendChild( splash.logo );

		document.getElementById( 'target' ).appendChild( splash.el );

		// IF NOT COMPLETED AND QUIZ WILL INIT › PRELOAD SOME IMAGES
		// ===============================================================================
		var preloaded = [];

		// PRELOAD THE FIRST 10 CORRECT / INCORRECT IMAGES
		// ===============================================================================
		for ( var i = 0; i < 20; i++ ) {

			// IF IN CORRECT LENGTH › PRELOAD CORRECT IMAGES
			if ( i < 11 && images.correct[ i ] ) {

				preloaded[ i ] = new Image()
				preloaded[ i ].src = './images/' + images.correct[ i ];

			}

			// ELSE › PRELOAD INCORRECT IMAGES
			else if ( images.incorrect[ i - 10 ] ) {

				preloaded[ i ] = new Image()
				preloaded[ i ].src = './images/' + images.incorrect[ i - 10 ];

			}

		}

		// START QUIZ
		// ===============================================================================
		splash.button.addEventListener( 'click', function ( ) {

			window.ga && ga( 'send', 'event', 'get-started', 'click', 'Opened introduction page' );

			window.mixpanel && mixpanel.track( 'get-started' );

			var intro = new Screen( 'h2' );

			intro.el.id = 'intro-screen';

			// ADD AND APPEND IMAGE
			intro.image = document.createElement( 'img' );
			intro.image.src = './images/icon_019.gif';

			intro.textWrapper.parentNode.insertBefore( intro.image, intro.textWrapper );

			intro.text.zh.innerHTML = '中文';
			intro.text.en.innerHTML = 'Ready?';

			// ADD NEXT BUTTON
			intro.button = document.createElement( 'button' );
			intro.button.className = 'btn btn-red';
			intro.choiceList.appendChild( intro.button );

			// ADD TEXT TO BUTTON
			intro.button.innerHTML = 'Start Quiz / 开始测试'

			intro.logo = document.createElement( 'div' );
			intro.logo.className = 'logo logo-icon';
			intro.choiceList.appendChild( intro.logo );

			// INITIATE QUIZ ON BUTTON CLICK
			intro.button.addEventListener( 'click', function ( ) {

				window.ga && ga( 'send', 'event', 'quiz-started', 'click', 'Quiz started' );

				window.mixpanel && mixpanel.track( 'quiz-started' );

				quiz.init();

			} );

			// CLOSE SPLASH SCREEN
			quiz.closeScreen( null, intro.el, splash.el );

		} );

	}


	// IF PROGRESS MADE IN LOCALSTORAGE BUT QUIZ NOT COMPLETED › JUMP TO LAST QUESTION
	// ============================================================================
	else if ( localStorage.getItem( 'progress' ) && !localStorage.getItem( 'completed' ) ) {

		quiz.currentQuestion = parseInt( localStorage.getItem( 'progress' ) );

		window.ga && ga( 'send', 'event', 'returned-to-quiz', 'Pageview', 'Returned on question: ' + localStorage.getItem( "progress" ) );

		window.mixpanel && mixpanel.track( 'returned-to-quiz', { question: localStorage.getItem( "progress" ), label: null, } );

		quiz.init();

	}

	// IF COMPLETED AND ANSWERS STORED › GENERATE COMPLETION PAGE
	// ============================================================================
	else if ( localStorage.getItem( 'completed' ) && localStorage.getItem( 'answers' ) ) {

		quiz.finishQuiz( JSON.parse( localStorage.getItem( 'answers' ) ).correct );

	}

	// IF ANY UNFORSEEN ROUTE TAKEN › JUST START THE QUIZ
	// ============================================================================
	else {

		localStorage.clear();
		quiz.init();

	}

}