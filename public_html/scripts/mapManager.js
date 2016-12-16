var mapManager = (function () {
    //Cache DOM
    var $SearchBox = $('#search');
    var selectedLocation = {//contient toutes les locations sélectionnées
        zone: {
        },
        township: {
        },
        city: {
        }
    };

    var init = function () {
        _bindEvents();
        _loadTemplate();
    };

    //Listes des event handlers
    var _bindEvents = function () {
        $SearchBox.on('click', 'area[data-type="city"], #township input[type="checkbox"]:checked', function () { // au click sur carte ou checkbox liste des communes
            /*var checkbox;
             if ($(this)[0].tagName == "AREA"){ //si on clique sur la carte, on check la commune correspondante dans la liste
             checkbox = $('#township input[value="'+$(this).attr('data-id')+'"]');
             checkbox.prop("checked", !checkbox.prop("checked"));
             }*/
            _getCities($(this).attr('data-id') || $(this).val()); //on charge la liste des villes
        });
        $SearchBox.on('click', '#simplified area[data-type="zone"]', function () { // au click sur carte du pays dans la recherche simplifiée
            _loadTemplate('search-extended', function () { //on charge extended search, la map, et les checkboxes
                _loadMap('./images/MAP/MAP_CENTRE.png', $(this).attr('data-id')); //TODO: OBTENIR IMAGE CORRECTE DU PAYS POUR RECHERCHE ETENDUE
                _updateLocation();
            });
        });
        $SearchBox.on('click', '#loadCountry', function () {
            _loadMap('./images/MAP/MAP_MAIN2.png', $(this).attr('data-id'));
            _clearLists();
        });
        $SearchBox.on('change', '#townshipAll', function () { //Township check all checkboxes
            if ($('#townshipAll').prop('checked')) {
                $('#township input[type="checkbox"]').prop('checked', true).change();
            } else {
                $('#township input[type="checkbox"]').prop('checked', false).change();
            }
        });
        $SearchBox.on('change', '#township input[type="checkbox"]', function () { //check townshipAll SI toutes les checkboxes sont check
            $('#townshipAll').prop('checked', false);
            if ($('#township input[type="checkbox"]:checked').length == $('#township input[type="checkbox"]').length) {
                $('#townshipAll').prop('checked', true);
            }
        });
        $SearchBox.on('change', '#citiesAll', function () { //cities check all checkboxes
            if ($('#citiesAll').prop('checked')) {
                $('#cities input[type="checkbox"]').prop('checked', true).change();
            } else {
                $('#cities input[type="checkbox"]').prop('checked', false).change();
            }
        });
        $SearchBox.on('change', '#cities input[type="checkbox"]', function () { //check citiesAll SI toutes les checkboxes sont check
            $('#citiesAll').prop('checked', false);
            if ($('#cities input[type="checkbox"]:checked').length == $('#cities input[type="checkbox"]').length) {
                $('#citiesAll').prop('checked', true);
            }
        });
        $SearchBox.on('change', '#township input[type="checkbox"], #cities input[type="checkbox"]', function (event) { //Ajoute la location quand on click sur une checkbox
            var fn = ($(this).prop('checked') ? _addLocation : _removeLocation);
            var param = $(this);
            if (typeof fn === "function") {
                fn(param);
            }
        });
        $SearchBox.on('removeLocation', '.dropDownListResultBox .item', function () { //on retire la location quand on click sur une item de la checkbox
            var id = $(this).find('input').val();
            var cat = $(this).find('input').attr('data-cat');
            $('#' + cat + '-' + id).prop('checked', false).change();
        });
        $SearchBox.on('click', '#back', function () { //retour vers recherche simplifiée
            _loadTemplate();
        });
    };

    /*------------------------------METHODS-----------------------------------*/
    //Montre la recherche étendu, Retourne la map des communes (avec coordonnées) + charge les listes
    var _showZone = function (id) {
        _loadTemplate('search-extended', _loadMap('./images/MAP/MAP_CENTRE.png', id));
        _updateLocation();
    };
    //Charge l'image de la map + balise map avec coordonnées
    var _loadMap = function (picURL, CoordinatesURL) {
        //load l'image de la map;
        var img = $('<img/>').attr('src', picURL).on('load', function () {
            if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                console.log("Erreur lors de la récupération de l'image de la map");
            } else {
                img.attr('usemap', '#map');
                img.attr('hidefocus', true);
                img.addClass('map');
                $('.checkbox-list').each(function () {
                    temp = new CheckboxList($(this));
                    temp.init();
                });
                $('#map>img').remove();
                $('#map').prepend(img);
                $('map').imageMapResize();
                $SearchBox.find('.selection-list').removeClass('disabled');
                _getRequest(CoordinatesURL, '', _getCoordinates); //TODO: DEFINIR URL POUR LES COORDONNEES
            }
        });
    };
    //prend la réponse json de la requête ajax (dans _loadMap) pour ensuite le printer à coté de l'image.
    var _getCoordinates = function (response) {
        //TODO: DEFINIR CORRECTEMENT LE PRINT DES DONNEES DANS LA PAGE. 
        var map = $('<map name="map" />');
        var areas = '';
        for (var area in response['areas']) {
            //area.cat = city, township, zone;
            areas += '<area shape="poly" data-type="' + area.cat + '" data-id="' + area.id + '" coords="' + area.coordinate + '" shapetitle="' + area.name + '" alt="' + area.name + '">';
        }
        map.append(areas);
        $('#map').append(map);
        $('map').imageMapResize();
    };

    //Récupère la liste des villes d'une commune
    var _getCities = function (id) {
        var url = "http://shop.internet.lu/Scripts/sql.exe?SqlDB=LOLShop&Sql=GetDivisionList.phs&_DivisionId=";
        _getRequest(url, id, _showCities);
    };
    //print la list des villes
    var _showCities = function (reponse) {
        var obj = reponse.aData;
        $("#cities").html(_printList('city', obj));
    };
    //Récupère la liste des communes d'une zone
    var _getTownship = function (id) {
        var url = ""; //TODO: DEFINIR URL POUR RECUPERER LISTE DES COMMUNES
        _getRequest(url, id, _showTownship);
    };
    //print la liste des communes
    var _showTownship = function (reponse) {
        var obj = reponse.aData;
        $("#township").html(_printList('township', obj));
    };

    var _addLocation = function (checkbox) {
        var object = {};
        var temp = "";
        //ajouter dans l'objet selectedLocation
        object[checkbox.attr('value')] = {
            id: checkbox.attr('value'),
            name: checkbox.attr('name'),
            cat: checkbox.attr('data-cat')
        };
        selectedLocation[checkbox.attr('data-cat')][checkbox.attr('value')] = object[checkbox.attr('value')];
        //printer dans la list des locations
        temp = '<li id="I-' + checkbox.attr('data-cat') + '-' + checkbox.attr('value') + '" class="item" data-event="removeLocation"><span class="icon-x-icone"></span>' + checkbox.attr('name') + '<input type="hidden" data-cat="' + checkbox.attr('data-cat') + '" name="' + checkbox.attr('name') + '" value ="' + checkbox.attr('value') + '"/></li>';
        $SearchBox.find('.dropDownListResultBox').prepend(temp);
    };
    var _removeLocation = function (checkbox) {
        //item = input OR item dans dropdownResultBox
        //Supprimer de l'objet selectedLocation
        var id = checkbox.attr('value');
        var cat = checkbox.attr('data-cat');
        delete selectedLocation[cat][id];
        //Enlever des deux listes
        $SearchBox.find('#I-' + cat + '-' + id).remove();
    };
    var _updateLocation = function () {
        $.each(selectedLocation, function (key) {
            for (var id in selectedLocation[key]) {
                $('#' + selectedLocation[key][id].cat + '-' + id).prop('checked', true).change();
            }
        });
    };

    //template pour printer la liste (township et city)
    var _printList = function (label, object) {
        var ul = $("<ul class='pannel--inset__checkbox-list'>");
        for (var i = 0, l = object.length; i < l; ++i) {
            ul.append('<li><label for="' + label + '-' + object[i].id + '" class="checkbox"><input id="' + label + '-' + object[i].id + '" type="checkbox" data-cat="' + label + '" name="' + object[i].azLabel + '" value="' + object[i].id + '">' + object[i].azLabel + '</label></li>');
        }
        return ul;
    };
    //Vide les liste #township + #cities
    var _clearLists = function () {
        $SearchBox.find('.pannel--inset__checkbox-list').empty().parents('.selection-list').addClass('disabled');
    };
    //Charge le template correspondant dans la searchBox
    var _loadTemplate = function (link, callback) {
        console.log('load-temp');
        var link = link || "search-simplified"; //search-simplified OR search-extended
        $("#search").load("templates/" + link + ".html", function (response, status, xhr) {
            if (status == "error") {
                var msg = "Oups, il y a une erreur: ";
                console.log(msg + xhr.status + " " + xhr.statusText);
            }
            if (typeof callback === "function") {
                callback();
            }
        });
    };

    //fait une requête ajax et execute une fonction callback
    var _getRequest = function (url, id, callbackSuccess) {
        $.ajax({
            type: "GET",
            url: url + id,
            dataType: "json",
            success: callbackSuccess,
            error: function (request, status, error) {
                console.log("Erreur lors de la requête ajax");
            }
        });
    };
    /*-----------------------------PUBLIC METHODS-----------------------------*/
    return {
        init: init
    };
})(mapManager);

$(document).ready(function () {

    mapManager.init();
    $('.map').maphilight({
        fill: true,
        fillColor: '000000',
        fillOpacity: 0.2,
        stroke: false,
        strokeColor: 'ff0000',
        strokeOpacity: 1,
        strokeWidth: 1,
        fade: true,
        alwaysOn: false,
        neverOn: false,
        groupBy: false,
        wrapClass: true,
        shadow: false,
        shadowX: 0,
        shadowY: 0,
        shadowRadius: 6,
        shadowColor: '000000',
        shadowOpacity: 0.8,
        shadowPosition: 'outside',
        shadowFrom: false
    });
});