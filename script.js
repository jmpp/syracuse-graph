
(function(c, module, input, btn, btnPlus, btnLess, showNumbers, exponential) {

	window.addEventListener('DOMContentLoaded', function() {

		MODULE = { offsetLeft : 0, offsetTop : 0 };
		WIDTH = c.width = window.innerWidth || document.body.clientWidth;
		HEIGHT = c.height = window.innerHeight || document.body.clientHeight;
		ctx = c.getContext('2d');
		ctx.translate(.5, .5); // Moving canvas from .5 to prevent Chrome anti-aliasing

		STEPS = 44;
		NUMBER_MIN = 10000;
		NUMBER_MAX = 11000;
		NUMBER = parseInt(Math.random() * (NUMBER_MAX - NUMBER_MIN) + NUMBER_MIN); // Default one at page loading..

		var values = [], dots = [], n;

		/**
		 * Module Listeners
		**/

		module.addEventListener('dragstart', function(evt) {
			console.log('dragenter');
			MODULE.offsetLeft = evt.clientX - this.offsetLeft;
			MODULE.offsetTop = evt.clientY - this.offsetTop;
		}, false);

		module.addEventListener('drag', function(evt) {
			if (evt.clientX !== 0 && evt.clientY !== 0) {
				this.style.left = (evt.clientX - MODULE.offsetLeft) + 'px';
				this.style.top = (evt.clientY - MODULE.offsetTop) + 'px';
			}
		}, false);

		btn.addEventListener('click', function(evt) {
			evt.preventDefault();

			var val = ~~input.value;
			if (val <= 0 || val >= 1e9) {
				input.value = NUMBER;
				return;
			}
			
			NUMBER = val;

			compute();
			render();
		}, false);

		btnLess.addEventListener('click', function(evt) {
			evt.preventDefault();

			if (STEPS + 2 > 100)
				return;

			STEPS += 2;

			compute();
			render();
		}, false);

		btnPlus.addEventListener('click', function(evt) {
			evt.preventDefault();

			if (STEPS - 2 < 30)
				return;

			STEPS -= 2;

			compute();
			render();
		}, false);

		showNumbers.addEventListener('click', function(evt) {
			var evt = evt || window.event;

			render();
		}, false);

		exponential.addEventListener('click', function(evt) {
			var evt = evt || window.event;

			compute();
			render();
		}, false);

		/**
		 * Here starts the algorithm & rendering
		**/

		function compute()
		{
			/**
			 * Syracuse algorithm
			**/

			values = []
			dots = []
			n = NUMBER;

			input.value = NUMBER;

			values.push(n);

			for(;;)
			{
				n = (n % 2 === 0) ? n/2 : n*3+1;
				values.push(n);

				if (n === 1)
					break;
			}

			/**
			 * Creating Dot objets
			**/

			for (var i = 0, c = values.length; i < c; i++)
			{
				dots.push(new Dot({
					x : ((WIDTH-150)/(c-1) * i)+75,
					y : (exponential.checked ? ExponentialPxPosition(values[i], STEPS) : values[i]),
					val : values[i]
				}));
			}

			if (dots.length === 0)
				return;
		}
		compute();

		/**
		 * Rendering layout
		**/
		function renderLayout()
		{
			ctx.strokeStyle = '#ccc';
			ctx.lineWidth = 1;
			ctx.fillStyle = '#aaa';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'bottom';
			ctx.font = 'bold 14px Arial';

			for (var i = 0; i < HEIGHT; i++)
			{
				if (i > 1 && i % STEPS === 0)
				{
					// Line
					ctx.beginPath();
					ctx.moveTo(0, i);
					ctx.lineTo(WIDTH, i);
					ctx.stroke();
					// Indicator number
					var lineValue = (exponential.checked ? (1/2)*Math.pow(2, i/STEPS) : i/STEPS * STEPS);
					ctx.fillText( lineValue , 2, i);
				}
			}
			ctx.closePath();
		}

		/**
		 * Rendering diagram
		**/
		function renderDiagram()
		{
			// Lines graph
			// -----------
			ctx.beginPath();
			ctx.moveTo(dots[0].x, dots[0].y);
			ctx.strokeStyle = '#888';
			for (var i=0, c=dots.length; i < c; i++)
			{
				var d = dots[i];

				ctx.lineTo(d.x, d.y);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(d.x, d.y);
			}
			ctx.closePath();

			// Blue Dots
			// ---------
			ctx.beginPath();
			ctx.moveTo(dots[0].x, dots[0].y);
			ctx.fillStyle = '#2cf';
			for (var i=0, c=dots.length; i < c; i++)
			{
				var d = dots[i];

				ctx.arc(d.x, d.y, d.radius, 0, Math.PI*2);
				ctx.fill();

				ctx.beginPath();
				ctx.moveTo(d.x, d.y);
			}
			ctx.closePath();

			// Informative number
			// ------------------
			if (showNumbers.checked)
			{
				ctx.moveTo(dots[0].x, dots[0].y);
				ctx.fillStyle = '#000';
				ctx.font = 'bold 12px Calibri, Helvetica, Verdana';
				ctx.textAlign = 'left';
				ctx.textBaseline = 'top';
				for (var i=0, c=dots.length; i < c; i++)
				{
					var d = dots[i];

					ctx.fillText(d.val, d.x + 2, d.y + 2);
				}
			}
		}

		/**
		 * Rendering initial number at top/center
		**/
		function renderInitialNumber()
		{
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = '30px Arial';
			ctx.fillStyle = '#6ae';
			ctx.fillText(NUMBER, WIDTH/2, STEPS/2);
		}

		function render() {
			ctx.clearRect(0, 0, WIDTH, HEIGHT);

			renderLayout();
			renderDiagram();
			//renderInitialNumber();
		}

		render();

		/**
		 * Dot object
		**/
		function Dot(o)
		{
			if (!o)
				return;

			this.x = o.x;
			this.y = o.y;
			this.radius = 3;
			this.val = o.val;
		}

		function ExponentialPxPosition(realPixels, stepPixels)
		{
			/**
			 Let's say we know 'n' and need to find 'x'
			 Consider this equation :
				(1/2) * 2^x = n;
				((1/2)/n) = (1/2^x)
				2^x = 2n
				x = log2(2n)
				x = logE(2n)/logN(2)
			 .. to JavaScript :
				x = Math.log(2*n)/Math.log(2)
			 -----------------
			 More explanations here : http://www.math.uiuc.edu/~castelln/M117/lecture9_math117.pdf
			**/
			return (Math.log(realPixels*2)/Math.log(2))*stepPixels;
		}
	}, false);

})(
	document.getElementById('c'),
	document.getElementById('module'),
	document.getElementById('number'),
	document.getElementById('compute'),
	document.getElementById('plus'),
	document.getElementById('less'),
	document.getElementById('shownumbers'),
	document.getElementById('exponential'));