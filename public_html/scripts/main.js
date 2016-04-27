$(function () {
    MenuMobile.init();
    resizeAllImages();
    if ($('.annonce-entry').length > 0) {
        resizeImageDetail();
        $(window).on('load', function () {
            resizeAnnonceDetail();
        });
        $(window).resize(resizeAnnonceDetail);
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
        resizeSlider();
        $(window).resize(function () {
            resizeSlider();
        });
    }

    /* init modules pour uploader image */
    if ($('.add-annonce-image-container').length > 0 || $('.add-client-input-container-image').length > 0) {
        $('.add-annonce-image-pic').each(function () {
            temp = new uploadFile($(this));
            temp.init();
        });
    }

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
    var $image = $('.annonce-entry-img>figure img');
    var $imageSrc = $image.attr('src');
    var image = new Image();
    image.src = $imageSrc;
    $image.addClass((image.width / image.height > 1) ? 'fill-width' : 'fill-height');
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

//size of viewport
function viewport() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {width: e[ a + 'Width' ], height: e[ a + 'Height' ]};
}
