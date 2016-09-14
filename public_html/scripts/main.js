$(function () {
    MenuMobile.init();
    resizeAllImages();
    if ($('.annonce-details-images-container').length > 0) {
        resizeImageDetail();
        $(window).on('load', function () {
            resizeImageDetail();
        });
        $(window).resize(resizeImageDetail());
    }

    if ($('.main-gallery').length > 0 && jQuery().flickity) {
        $('.immo-main-gallery').flickity({
            // options
            cellAlign: 'left',
            pageDots: false,
            freeScroll: false,
            wrapAround: false,
            contain: true
        });
        /*
        resizeSlider();
        $(window).resize(function () {
            resizeSlider();
        });
        */
    }

    /* init modules pour uploader image */
    if ($('.add-annonce-image-container').length > 0 || $('.add-client-input-container-image').length > 0) {
        $('.add-annonce-image-pic').each(function () {
            temp = new uploadFile($(this));
            temp.init();
        });
    }
    
    if ($('.dropdown').length > 0){
        $('.dropdown').each(function(){
            temp = new dropDown($(this));
            temp.init();
        });
    }
    if($('.pannel.expand').length > 0){
        $('.pannel.expand').each(function(){
            temp = new expandPannel($(this));
            temp.init();
        });
        if (viewport().width < 1056){
            $('.pannel.expand').addClass('minimized');
            $('.pannel.expand').find('.exp-btn').removeClass('icon-compress').addClass('icon-expand');
        }
    };

});

var resizeSlider = function () {
    $('.main-gallery').each(function () {
        //$(this).find('.img-annonce').parent().css('height', ($(this).find('.gallery-cell').innerWidth() / 4) * 3);
        //$(this).find('.flickity-viewport').css('height', $('.annonce-slider-item').innerHeight());
        $(this).show().flickity('resize');
    });
};

//redimensionne toute les images par rapport à la hauteur du container
var resizeAllImages = function (callback) {
    $('.img-annonce').each(function () {
        var element = $(this);
        element.addClass('fill-height');
    });
    if (typeof callback === 'function') {
        callback();
    }
};

var resizeImageDetail = function () {
    var $imageSrc;
    var $image = $('.annonce-details-images-container .annonce-img');
    var image;
    $image.each(function () {
        $imageSrc = $image.attr('src');
        image = new Image();
        image.src = $imageSrc;
        $(this).addClass(((image.width / image.height) > 1) ? 'fill-width' : 'fill-height');
    });
};

/* Module pour ajouter une image via input file */
var uploadFile = function (element) {
    var $image = element;

    //cache dom 
    var $imageContainer = $image.parents('.add-annonce-image-container');
    var $form = $('#add-annonce-form');
    var $container = $imageContainer.parent();
    var $deleteButton = $container.find('button');
    var $browserInfo = $('#alert-browser');
    var $status = $container.find('.upload-status');
    var $filePath = $status.find('.image-path');
    var $hiddenInput = $imageContainer.find('input[type="hidden"]');
    var $inputFile = $container.find('input[type="file"]');
    var $modifyButtons = $container.find('.image-buttons');

    this.init = function () {
        _bindEvents();
    };

    var _bindEvents = function () {
        $image.on('click', _addImage.bind(this));
        $inputFile.on('change', function () {
            _renderImage(this);
        });
        $deleteButton.on('click', _deleteImage.bind(this));
    };

    var _addImage = function () {
        $inputFile.click();
    };

    var _deleteImage = function () {
        $image.find('img').removeClass("rotate0");
        $image.find('img').removeClass("rotate90");
        $image.find('img').removeClass("rotate180");
        $image.find('img').removeClass("rotate270");
        $image.removeClass('hidden');
        $status.addClass('hidden');
        $image.val('');
        $filePath.text('');
        $image.attr('src', "/images/add.png");
        $inputFile.val('');
        $hiddenInput.val(-1);
        $deleteButton.addClass('hidden');
        $modifyButtons.addClass('hidden');
    };

    var _renderImage = function (input) {
        if (window.FileReader) {
            console.log("The fileReader API is supported on this browser");
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $image.attr('src', e.target.result);
                    $hiddenInput.val("notEmpty");
                };

                reader.readAsDataURL(input.files[0]);
                $deleteButton.removeClass('hidden');
                $modifyButtons.removeClass('hidden');
            }
        } else {
            console.log("FileReader API not supported on this browser, use ajax instead");
            var file_name = $inputFile.val().replace(/C:\\fakepath\\/i, '');
            $filePath.text(file_name);
            $hiddenInput.val($inputFile.val());
            $image.addClass('hidden');
            $status.removeClass('hidden');
            $deleteButton.removeClass('hidden');
            $browserInfo.removeClass('hidden');
        }
    };
};

// Permet d'ouvrir le menu de droite sur mobile
var MenuMobile = (function () {
    //Cache DOM
    var $mobileButton = $('.mobile-button-white');
    var $contentSite = $('#siteWrap');
    var $mobileSideBar = $('.mobile-side-menu');
    var $mobileMenu = $mobileSideBar.find('ul.menu');
    var $menuItems = $mobileMenu.find('li.menu-item');
    var $menuLinks = $mobileSideBar.find('ul.menu-links');
    var $backButtons = $menuLinks.find('.back');
    var $currentSubMenu;
    var $document = $('html');
    var flag = "1";
    var init = function () {
        _bindEvents();
    };
    var _bindEvents = function () {
        $mobileButton.on('click', _toggleSideMenu);
        $menuItems.on('click', function (event) {
            _showSubMenu(this, event);
        });
        $backButtons.on('click', _hideSubMenu);
        $document.on('click', function () {
            if (flag != "0") {
                _closeSideMenu();
            }
            else {
                flag = "1";
            }
        });
    };
    var _toggleSideMenu = function () {
        flag = "0";
        if ($contentSite.hasClass('open')) {
            _closeSideMenu();
        } else {
            $contentSite.addClass('open');
        }
    };
    var _closeSideMenuOnAway = function (event) {
        if (!$(event.target).closest($mobileButton, $mobileSideBar, $backButtons).length) {
            _closeSideMenu();
        }
    };
    var _closeSideMenu = function () {
        if ($contentSite.hasClass('open')) {
            _hideSubMenu();
            $contentSite.removeClass('open');
        }
    };
    var _hideSubMenu = function () {
        flag = "0";
        if (typeof $currentSubMenu != 'undefined') {
            $currentSubMenu.closest('.menu-links-wrapper').removeClass('is-open');
            $currentSubMenu = undefined;
        }
    };
    var _showSubMenu = function (element) {
        flag = "0";
        if ($(element).attr('data-id')) {
            $currentSubMenu = _getSubMenu($(element).attr('data-id'));
            $currentSubMenu.closest('.menu-links-wrapper').addClass('is-open');
        }
    };
    var _getSubMenu = function (id) {
        var temp;
        $menuLinks.each(function () {
            if ($(this).attr('id') === id) {
                temp = $(this);
                return false;
            }
        });
        return temp;
    };
    return{
        init: init
    };
})();

var checkboxList = function($element){
    var element = $element;
};
checkboxList.prototype = {
  init : function (){
      
  }
};

var dropDown = function($element){
    var $dropdownContainer = $element;
    var $button = $dropdownContainer.find('button');
    var $menu = $dropdownContainer.find('ul');
    var $document = $('html');
    var flag = '1';
    
    this.init = function(){
        _bindEvents();
    };
    var _bindEvents = function(){
        $button.on('click', function(){
            _toggleDrop();
        });
        $document.on('click', function(){
            if (flag!=='0'){
                _closeDrop();
            }else{
                flag = '1';
            }
        });
    };
    var _toggleDrop = function(){
        flag = '0';
        if ($menu.hasClass('open')){
            _closeDrop();
        }else{
            _openDrop();
        }
    };
    var _openDrop = function(){
        $button.addClass('active');
        $menu.animateCss('fadeIn');
        $menu.addClass('open');
    };
    var _closeDrop = function(){
        $button.removeClass('active');
        $menu.removeClass('open');
    };
};

//permet d'étendre et de compresser les philtres sur la liste de la recherche
var expandPannel = function($element){
    var $pannel = $element;
    var $btn = $pannel.find('.exp-btn');
    var $pannelBody = $pannel.find('.pannel-body');
    
    this.init = function(){
        _bindEvents();
    };
    var _bindEvents = function(){
        $btn.on('click', function(){
            _toggleExpand();
        });
    };
    var _toggleExpand = function(){
        if ($pannel.hasClass('minimized')){
            _expand();
        }else{
            _compress();
        }
    };
    var _expand = function(){
        $pannel.removeClass('minimized');
        $btn.removeClass('icon-expand').addClass('icon-compress');
        $pannelBody.animateCss('fadeInDown');
    };
    var _compress = function(){
        $pannel.addClass('minimized');
        $btn.removeClass('icon-compress').addClass('icon-expand');
    };
};

//Permet de manuellement "truncate" un text pour ajouter une ellipse
var ellipsizeTextBox = function(element) {
    var $el = $(element);
    var wordArray = $el.innerHTML.split(' ');
    while($el.scrollHeight > $el.offsetHeight) {
        wordArray.pop();
        $el.innerHTML = wordArray.join(' ') + '&hellip;';
     }
};

//size of viewport
function viewport() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {width: e[ a + 'Width' ], height: e[ a + 'Height' ]};
}

$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        $(this).addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});