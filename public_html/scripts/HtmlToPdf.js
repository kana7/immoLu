// ---------------------------------
// ---------- htmlToPdf ----------
// ---------------------------------
// Plugin in pour générer un pdf à partir d'une page html.
// Utilise les plugins jsPDF et html2canvas
// https://raw.githubusercontent.com/MrRio/jsPDF/ddbfc0f0250ca908f8061a72fa057116b7613e78/dist/jspdf.min.js
// https://raw.githubusercontent.com/niklasvh/html2canvas/master/dist/html2canvas.min.js
// ------------------------
;
(function ($, window, document, undefined) {

    var pluginName = 'htmlToPdf';

    function Plugin(element, options) {

        this.element = element;
        this._name = pluginName;
        this._defaults = $.fn.htmlToPdf.defaults;
        this._format = {
            a4: {
                'p': [595.28, 841.89],
                'l': [841.89, 595.28]
            }
        };

        this.options = $.extend({}, this._defaults, options);

        try {
            if (!jsPDF)
                throw "jsPDF is missing. Please include it in your dependencies-->https://raw.githubusercontent.com/MrRio/jsPDF/ddbfc0f0250ca908f8061a72fa057116b7613e78/dist/jspdf.min.js";
            if (!html2canvas)
                throw "html2canvas is missing. Please include it in your dependencies-->https://raw.githubusercontent.com/niklasvh/html2canvas/master/dist/html2canvas.min.js";
            this.init();
        } catch (err) {
            console.log("Plugin htmlToPdf - " + err);
        }
    }

    $.extend(Plugin.prototype, {
        init: function () {
            this.buildCache();
            $('body').scrollTop(0);
            this.createPDF.call(this);
            this.callback();
        },
        destroy: function () {
            this.unbindEvents();
            this.$element.removeData();
        },
        buildCache: function () {
            this.$element = $(this.element);
            this.cache_width = this.$element.width();
        },
        bindEvents: function () {
            var plugin = this;
            /*Ajouter des events si nécessaire*/
        },
        unbindEvents: function () {
            this.$element.off('.' + this._name);
        },
        // METHODES
        createPDF: function () {
            this.getCanvas().then(function (canvas) {
                var
                        img = canvas.toDataURL("image/png", 1.0),
                        doc = new jsPDF(this.options.orientation, 'pt', this._format[this.options.format][this.options.orientation]);
                doc.addImage(img, 'PNG', 0, 0, img.width, img.height);
                doc.save(this.options.title + '.pdf');
                //this.$element.width(this.cache_width);
            }.bind(this));
        },
        getCanvas: function () {
            //this.$element.width((this._format[this.options.format][this.options.orientation][0] * 1.33333) - 80).css('max-width', 'none');
            return html2canvas(this.$element, {
                imageTimeout: 2000,
                removeContainer: true
            });
        },
        callback: function () {
            var onComplete = this.options.onComplete;
            if (typeof onComplete === 'function') {
                onComplete.call(this.element);
            }
        }

    });
    $.fn.htmlToPdf = function (options) {
        this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
        return this;
    };
    //PARAMETRES PAR DEFAUT
    $.fn.htmlToPdf.defaults = {
        title: "immo_annonces_" + Math.random().toString(36).slice(2),
        onComplete: null,
        format: 'a4',
        orientation: 'p'
    };

})(jQuery, window, document);
