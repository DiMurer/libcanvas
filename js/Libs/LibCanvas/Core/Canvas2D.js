
LibCanvas.Canvas2D = new Class({
	initialize : function (elem) {
		this.traceElem  = new LibCanvas.Utils.Trace();
		this.interval   = null;
		this.ctx    = elem.getContext('2d-libcanvas');
		this.elems  = [];
		this.images = {};
		this.fps    = 20;
		this.cfg    = {
			autoClear   : true,
			autoDraw    : true,
			background  : false,
			images      : null,
			progressBar : null
		};

		this.progressBar = null;
		this.mouse = new LibCanvas.Mouse(this);
	},
	setImages  : function (images) {
		this.images = images;
		return this;
	},
	setFps : function (fps) {
		this.fps = fps;
		if (this.interval) {
			this.start(this.fn);
		}
		return this;
	},
	setConfig : function (n) {
		for (var i in n) {
			this.cfg[i] = n[i];
		}
		return this;
	},
	setBackground : function (bg) {
		return this.setConfig({
			background : bg
		});
	},
	addElement : function (elem) {
		this.checkElem(elem);
		elem.setCanvas(this);
		this.elems = this.elems || [];
		this.elems.push(elem);
		return this;
	},
	rmElement : function (elem) {
		if (this.elems) {
			this.elems.erase(elem);
		}
		return this;
	},
	checkElem : function (elem) {
		if (typeof elem.setCanvas != 'function') {
			throw 'No setCanvas method';
		}
		return this;
	},
	drawAll : function () {
		this.elems.each(function (elem) {
			elem.draw();
		});
		return this;
	},
	fpsMeter : function (frames) {
		this.fpsMeter = new LibCanvas.Utils.FpsMeter(frames);
		return this;
	},
	frame : function () {
		if (this.fpsMeter) {
			this.fpsMeter.frame();
		}

		if (!this.cfg.images || (this.imagePreloader && this.imagePreloader.isReady())) {
			if (this.progressBar) {
				this.rmElement(this.progressBar);
				this.progressBar = null;
			}

			this.ctx.save();
			if (this.cfg.autoClear) {
				this.ctx.clearAll();
			}
			if (this.cfg.background) {
				this.ctx.fillAll(this.cfg.background);
			}
			if (this.fn) {
				this.fn.call(this);
			}
			if (this.cfg.autoDraw) {
				this.drawAll();
			}
			this.ctx.restore();
		} else {
			if (!this.imagePreloader) {
				this.imagePreloader = new LibCanvas.Utils.ImagePreloader(this.cfg.images)
					.ready(function (images) {
						this.setImages(images);
					}.bind(this));
			}
			if (this.cfg.progressBar && !this.progressBar) {
				this.progressBar = new LibCanvas.Utils.ProgressBar()
					.setStyle(this.cfg.progressBar)
				this.addElement(this.progressBar);
			}
			this.progressBar
				.setProgress(this.imagePreloader.getProgress())
				.draw();
		}
		return this;
	},
	trace : function () {
		this.traceElem.trace.apply(this.traceElem, arguments);
		return this;
	},
	start : function (fn) {
		this.stop();
		this.fn = fn || this.pauseFn || null;
		this.pauseFn  = undefined;
		this.interval = this.frame.periodical(1000/this.fps, this)
		return this;
	},
	pause : function () {
		this.pauseFn = this.fn;
		return this.stop();
	},
	stop : function () {
		this.fn = undefined;
		this.interval = $clear(this.interval);
		return this;
	}
});