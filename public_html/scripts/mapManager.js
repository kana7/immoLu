function showCities(id) {
    $.ajax({
        type: "GET",
        url: "http://shop.internet.lu/Scripts/sql.exe?SqlDB=LOLShop&Sql=GetDivisionList.phs&_DivisionId=" + id,
        dataType: "json",
        success: function (data) {
            console.log(data);
            var obj = data.aData,
                    ul = $("<ul>");
            for (var i = 0, l = obj.length; i < l; ++i) {
                ul.append("<li><a href='http://www.URL/" + obj[i].id + "'>" + obj[i].azLabel + "</a></li>");
            }
            $("#cities").html(ul);
        }
    });
}
function showCommune(commune) {
    console.log(commune);
    alert(commune);
}
function showZone(zone) {
    console.log(zone);
    alert(zone);
    $("#search").load("templates/search-extanded.html", function (response, status, xhr) {
        if (status == "error") {
            var msg = "Oups, il y a une erreur: ";
            alert(msg + xhr.status + " " + xhr.statusText);
        }
    });

}
$(document).ready(function () {
    $('map').imageMapResize();
    $('#Map').maphilight({
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