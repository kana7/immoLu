var MediaQueries = (function () {
    var media = {
        phone: 679,
        tab: 680,
        desk: 992,
        lgdesk: 1172
    };
    var query = {
        phone: 'screen and (max-width: ' + media['phone'] + 'px)',
        tab: 'screen and (min-width: ' + media['tab'] + 'px)',
        desk: 'screen and (min-width: ' + media['desk'] + 'px)',
        lgdesk: 'screen and (min-width: ' + media['lgdesk'] + 'px)',
        mobile: 'screen and (max-width: ' + media['desk'] + 'px)'
    };

    function matchQuery(media) {
        if (query.hasOwnProperty(media)) {
            return window.matchMedia(query[media]).matches;
        } else {
            return window.matchMedia('screen and ' + media).matches;
        }
    }
    ;
    return {
        matchQuery: matchQuery
    };
})();



// ---------------------------------
// ---------- Tooltip ----------
// ---------------------------------
// Plugin tooltip pour afficher des infos supplémentaires et des aides dans le shop
// ------------------------
;
(function ($, window, document, undefined) {

    var pluginName = 'tooltip';

    //plugin constructor
    function Plugin(element, options) {

        this.element = element;
        this._name = pluginName;
        this._defaults = $.fn.tooltip.defaults;

        this.options = $.extend({}, this._defaults, options);

        this.init();
    }
    //permet de définir les méthodes dans l'objet prototype du plugin
    $.extend(Plugin.prototype, {
        init: function () {
            this.printTooltip();
            this.buildCache();
            this.fetchInfos.call(this);
            this.bindEvents();
        },
        //suppression d'une instance du plugin
        destroy: function () {
            /*
             Détuit l'instance du plugin lié à l'objet du DOM
             $('selector').data('tooltip').destroy();
             */
            this.unbindEvents();
            this.$element.removeData();
        },
        // Cache DOM
        buildCache: function () {
            this.$element = $(this.element);
            this.$tooltip = this.$element.find('.tooltip');
            this.$button = this.$tooltip.find('button');
            this.$tips = this.$tooltip.find('.popupTips');
            this.$content = this.$tips.find('.popup-content');
        },
        //Déclaration des events
        bindEvents: function () {
            //instance de l'objet à passer aux fonctions utilisés sur les handlers
            var plugin = this;
            var timer;

            plugin.$button.on('click' + '.' + plugin._name, function () { //mobile : open on click
                if (MediaQueries.matchQuery('(max-width: 459px)')) {
                    plugin.setPosition.call(plugin);
                    plugin.openTips.call(plugin);
                }
            });
            plugin.$button.on('mouseover' + '.' + plugin._name, function () { //open on mousehover with delay
                plugin.setPosition.call(plugin);
                timer = setTimeout(function () {
                    plugin.openTips.call(plugin);
                }, 250);
            }).mouseleave(function () {
                clearTimeout(timer);
            });
            /*plugin.$button.on('mouseout' + '.' + plugin._name, function () { //desktop : close on mouse out
             if (MediaQueries.matchQuery('(min-width: 459px)')){
             plugin.closeTips.call(plugin);
             }
             });*/
            $('html').on('click' + '.' + plugin._name, function (event) { //mobile : close on click away
                //if (MediaQueries.matchQuery('(max-width: 459px)')) {
                if (!$(event.target).closest(plugin.$tooltip).length) {
                    plugin.closeTips.call(plugin);
                }
                //}
            });
        },
        unbindEvents: function () {
            this.$element.off('.' + this._name);
        },
        printTooltip: function () {
            var htmlTip = '<div class="tooltip" data-idShopPage="' + this.options.idShopPage + '" data-idShopReference="' + this.options.idShopReference + '"><button type="button" class="icon-question-circle"></button><div style="width:' + this.options.size + 'px;" class="popupTips"><div class="popup-content"/><div class="arrow"/></div></div>';
            $(this.element).append(htmlTip);
        },
        setPosition: function () {
            var pos = this.$button.offset(); //position du tooltip cliqué
            var middleWidthPage = ((viewport().width) / 2); //milieu de la page en x
            var middleHeightPage = ((viewport().height) / 2); //milieu de la page en y
            this.$tips.removeClass('up left bottom right');
            if (MediaQueries.matchQuery('(min-width: 460px)')) {
                if ((pos.left >= middleWidthPage) && (pos.top < middleHeightPage)) { //bas à gauche
                    this.$tips.addClass('up right');
                } else if ((pos.left >= middleWidthPage) && (pos.top >= middleHeightPage)) { //haut à gauche
                    this.$tips.addClass('bottom right');
                } else if ((pos.left < middleWidthPage) && (pos.top >= middleHeightPage)) { //haut à doite
                    this.$tips.addClass('bottom left');
                } else if ((pos.left < middleWidthPage) && (pos.top < middleHeightPage)) { //bas à droite
                    this.$tips.addClass('up left');
                }
            }
        },
        fetchInfos: function () {
            var plugin = this;
            if (this.options.ajax){
                $.ajax({
                type: 'GET',
                dataType: 'json',
                url: plugin.options.url + 'SqlDB=' + plugin.options.SqlDB + '&Sql=' + plugin.options.Sql + '&xid=' + plugin.options.xid + '&idShopLibrary=' + plugin.options.idShopLibrary + '&idShopPage=' + plugin.options.idShopPage + '&idShopReference=' + plugin.$tooltip.attr("data-idshopreference") + '&idLanguage=' + plugin.options.idLanguage,
                success: function (content) {
                    plugin.$content.append(content.info);
                },
                error: function () {
                    plugin.$content.append(plugin.options.message);
                }
            });
            }else{
                plugin.$content.append(plugin.options.message);
            }
        },
        toggleTips: function () {
            this.$tooltip.toggleClass('active');
        },
        openTips: function () {
            this.$tooltip.filter(':not(.active)').addClass('active');
        },
        closeTips: function () {
            this.$tooltip.filter('.active').removeClass('active');
        },
        callback: function () {
            // Cache onComplete option
            var onComplete = this.options.onComplete;

            if (typeof onComplete === 'function') {
                /*Call attache l'élément appellé par le plugin aux paramètres du callback*/
                onComplete.call(this.element);
            }
        }
    });

    $.fn.tooltip = function (options) {
        this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                /*
                 Use "$.data" to save each instance of the plugin in case
                 the user wants to modify it. Using "$.data" in this way
                 ensures the data is removed when the DOM element(s) are
                 removed via jQuery methods, as well as when the userleaves
                 the page. It's a smart way to prevent memory leaks.
                 
                 More: http://api.jquery.com/jquery.data/
                 */
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
        return this;
    };

    //paramètres par défaut
    $.fn.tooltip.defaults = {
        ajax: false,
        property: 'value',
        onComplete: null,
        url: '/Scripts/sql.exe?',
        SqlDB: '',
        Sql: '',
        xid: 0,
        idShopLibrary: 0,
        idShopPage: 0,
        idShopReference: 0,
        idLanguage: 0,
        message: 'Astuce non disponible actuellement.',
        size: 300
    };

})(jQuery, window, document);
