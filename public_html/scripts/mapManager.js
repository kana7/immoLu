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
    };

    //Listes des event handlers
    var _bindEvents = function () {
        $SearchBox.on('click', 'area[data-type="city"], #township input[type="checkbox"]:checked', function () { // au click sur carte ou checkbox liste des communes
            /*var checkbox;
             if ($(this)[0].tagName == "AREA"){ //si on clique sur la carte, on check la commune correspondante dans la liste
             checkbox = $('#township input[value="'+$(this).attr('data-id')+'"]');
             checkbox.prop("checked", !checkbox.prop("checked"));
             }*/
            _showCities($(this).attr('data-id') || $(this).val()); //on charge la liste des villes
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
        $SearchBox.on('change', '#township input[type="checkbox"], #cities input[type="checkbox"]', function (event) {
            var fn = ($(this).prop('checked') ? _addLocation : _removeLocation);
            var param = $(this);
            if (typeof fn === "function") {
                fn(param);
            }
        });
        $SearchBox.on('removeLocation', '.dropDownListResultBox .item', function () {
            var id = $(this).find('input').val();
            var cat = $(this).find('input').attr('data-cat');
            $('#' + cat + '-' + id).prop('checked', false).change();
        });
    };

    /*------------------------------METHODS-----------------------------------*/

    var _loadContent = function () { //Charge l'interface dans la recherche

    };

    //Charge l'image de la map + balise map avec coordonnées
    var _loadMap = function (id) {
        $.ajax({
            type: "GET",
            //TODO: URL TO GET MAPIMAGE + COORDINATES
            url: "http://shop.internet.lu/Scripts/sql.exe?SqlDB=LOLShop&Sql=#&_DivisionId=" + id, //Récupère l'image de la map (zone ou pays)
            beforeSend: function () {
                _clearLists();
                $('#search').prepend(loaderTemplate);
                setTimeout(function () {
                    $('#map').addClass('is-loading');
                });
            },
            success: function (data) {
                var obj = data.aData;
                //TODO: GET RESPONSE AND PRINT MAP IN SEARCH BOX
            },
            complete: function () {
                $('#map').removeClass('is-loading');
                $(loaderTemplate).remove();
                //TODO: afficher la liste des communes pour cette zone :  _showTownship();
                $SearchBox.find('.selection-list').removeClass('disabled');
            }
        });
    };
    //Récupère la liste des villes d'une commune
    var _showCities = function (id) {
        $.ajax({
            type: "GET",
            url: "http://shop.internet.lu/Scripts/sql.exe?SqlDB=LOLShop&Sql=GetDivisionList.phs&_DivisionId=" + id,
            dataType: "json",
            beforeSend: function () {
                $('#cities').prepend(loaderTemplate);
                setTimeout(function () {
                    $('#cities').addClass('is-loading');
                });
            },
            success: function (data) {
                var obj = data.aData;
                $("#cities").html(_printList('city', obj));
            },
            complete: function () {
                $('#cities').removeClass('is-loading');
                $(loaderTemplate).remove();
            }
        });
    };
    //Récupère la liste des communes d'une zone
    var _showTownship = function (id) {
        console.log(id);
        alert(id);
        $.ajax({
            type: "GET",
            url: "http://shop.internet.lu/Scripts/sql.exe?SqlDB=LOLShop&Sql=#&_DivisionId=" + id, //obtenir la liste de toute les communes de la zone (aprés clic sur zone nord, est, ouest, sud, center)
            dataType: "json",
            beforeSend: function () {
                $('#township').prepend(loaderTemplate);
                setTimeout(function () {
                    $('#township').addClass('is-loading');
                });
            },
            success: function (data) {
                var obj = data.aData;
                $("#township").html(_printList('township', obj));
            },
            complete: function () {
                $('#township').removeClass('is-loading');
                $(loaderTemplate).remove();
                //TODO: afficher la liste des villes pour la première commune de la liste :  _showCities();
            }
        });
    };
//Retourne la map du pays et clean les deux listes
    var _showZone = function (id) {
        console.log(zone);
        //TODO: LOAD COUNTRY MAP IN EXTENDED VIEW ---> _loadMap(id)
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
        //Supprimer de selected location
        var id = checkbox.attr('value');
        var cat = checkbox.attr('data-cat');
        delete selectedLocation[cat][id];
        //Enlever des deux listes
        $SearchBox.find('#I-' + cat + '-' + id).remove();
    };

    var _renderLocation = function () {
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
    var _loadTemplate = function (link) {
        var link = link || "search-simplified"; //search-simplified OR search-extended
        $("#search").load("templates/" + link + ".html", function (response, status, xhr) {
            if (status == "error") {
                var msg = "Oups, il y a une erreur: ";
                console.log(msg + xhr.status + " " + xhr.statusText);
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

    $('map').imageMapResize();
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