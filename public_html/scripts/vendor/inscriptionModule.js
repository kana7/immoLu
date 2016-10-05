// MODULE
//------------------------------------------------------------------------------
var StepTransition = (function () {
    var html, info = {};
    var tplbtn = '<div class="clearfix phone-mt-10">' +
            '<div class="pull-left">' +
            '<button type="button" class="btn-grey previous">Étape précédente</button>' +
            '</div>' +
            '<div class="pull-right">' +
            '<button type="button" class="btn-orange next">Étape suivante</button>' +
            '</div>' +
            '</div>';

    var StepsContainer = $('#steps');
    var form = $('#step-transition form');
    var headerStepList = $('#step-list ul');
    var currentStep = 3;
    var stepList = StepsContainer.find('.step');
    //Prend l'ensemble des articles sélectionnables pour cette offre
    function init() {
        //recupération du panier
        _render();
        _bindEvents();
        _showSlider(currentStep);
    }

//génére le html de tous les sliders
    function _render() {
        stepList.each(function () {
            $(this).append(tplbtn); //TO DO PRINT BUTTONS FOR NEXT STEP
            /*if ($(this).is('[data-required]')){
                $(this).find('button.next').addClass('disabled');
            }*/
        });
        stepList.first().find('button.previous').parent().remove();
        stepList.last().find('button.next').parent().remove();
    }

//bind les évènements pour tous le script
    function _bindEvents() {
        headerStepList.on('click', 'li:not(.step-separator)', function () {
            var position = headerStepList.find('li:not(.step-separator)').index(this);
            _goToSlider(position);
        });
        StepsContainer.on('click', 'button.previous', function () {
            _previous();
        });
        StepsContainer.on('click', 'button.next', function () {
            _next();
            _collectDataForm($(this).parents('.step').find('.step-form'));
        });
        $(document).on('keyup', function (event) {
            switch (event.which) {
                case 37:
                    _previous();
                    break;
                case 39:
                    _next();
                    _collectDataForm($(this).parents('.step').find('.step-form'));
                    break;
                default:
                    return; // exit this handler for other keys
            }
        });
        /*StepsContainer.find('input[required]').on('blur click', function () {
            _checkInput();
        });*/
        /*$(window).on("beforeunload", function () { //SAVE IN COOKIES IF LEAVING
         _saveCart();
         });*/
    }
//Amène à un slide en fonction d'un paramètre dans le lien
    function _goToSlider(position) {
        if (!(currentStep - position <= 0)) {
            if (position >= 0) {
                currentStep = position;
                _showSlider(currentStep);
            }
        }
    }

//afficher un slide
    function _showSlider(index) {
        var position = Number(index);
        $('#step-list ul').find('li:not(.step-separator)').removeClass('active');
        $('#step-list ul').find('li:not(.step-separator)').eq(position).addClass('active');
        stepList.not(stepList[position]).hide().removeClass('is-visible');
        $(stepList[position]).fadeIn('800').addClass('is-visible');
        $('html,body').animate({
            scrollTop: $('#siteWrap').offset().top
        }, 0);
        console.log(currentStep);
    }

//slide suivant
    function _next() {
        //if (_checkInput()) {
            if (currentStep != stepList.length - 1) {
                _showSlider(++currentStep);
            }
        //}
    }
//slide précédent
    function _previous() {
        if (currentStep != 0) {
            _showSlider(--currentStep);
        }
    }

//Récupère les données des formulaires et les ajoute dans le panier
    function _collectDataForm($form) {
        if ($form.length > 0) {
            var id = $form.attr('data-form');
            var object = {};
            $form.find('input').each(function () {
                console.log($(this).attr('name'));
                if ($(this).is(':radio')) {
                    if ($(this).is(':checked')) {
                        object[$(this).attr('name')] = $(this).val();
                    }
                } else {
                    object[$(this).attr('name')] = $(this).val();
                }
            });
            console.log(object);
            events.emit('addForm', {id: id, object: object});
        } else {
            console.log('pas de formulaire à collecter');
        }
    }

//Vérifie si tous les éléments requis ont été remplis
    var _verifyStep = function ($element) {
        var flag = true;
        var currentStep = $element;
        var name;
        //vérifie si required est select
        currentStep.find('input[required]').each(function () {
            name = $(this).attr('name');
            if ($(this).attr('type') == 'radio') {
                if (!currentStep.find("input[name='" + name + "']").is(':checked')) {
                    flag = false;
                }
            } else {
                if (!$(this).val()) {
                    flag = false;
                }
            }
        });
        return flag;
    };
    //Désactive bouton si verifyStep est faux
    var _checkInput = function () {
        var flag = _verifyStep($(stepList[currentStep]));
        if (!flag) {
            $(stepList[currentStep]).find('button.next').addClass('disabled');
        } else {
            $(stepList[currentStep]).find('button.next').removeClass('disabled');
        }
        return flag;
    };


    function _addForm(data) {
        info[data['id']] = data['object'];
    }
// loop a travers un tableau pour sélectionner un objet selon un id dans les properties
    function _findInArray(array, id) {
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i].id == id)
                return array[i];
        }
        return null; // l'objet n'a pas été trouvé
    }
    return{
        init: init,
        step: currentStep
    };
})();