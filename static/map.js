var map = {};
//White theme default:
var colorArray = ["#feebe2", "#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"];
var legend;

var theme = "white";

(function(window, document) {
  d3.select(window).on("resize", throttle);

  var doThrottle = false;

  var zoom = d3.behavior.zoom()
    .scaleExtent([1, 9])
    .on("zoom", move);

  // var width = document.getElementById('map-container').offsetWidth;
  // var height = width / 1.8;

  var height = window.innerHeight - 10;
  var width = document.getElementById('map-container').offsetWidth;

  var topo, projection, path, svg, g, countryNames, rateById, centered, active;
  countryCount = {};

  //Variables needed to update scale and legend
  var mydomain = [];
  var maxartists = 0;

  //Setting color and range to be used
  var color;

  //Returns total number of plays for country
  function getCountryPlaycount(c) {
    var count = 0;
    for (i = 0; i < countryCount[c.id].length; i++) {
      count += countryCount[c.id][i].playcount;
    }
    console.log(count);
    return count;
  }
  //Function to format numbers over 1000 with a space
  function numbersWithSpace(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }


  function updateScale() {

    for (i = 0; i < 5; i++) {
      mydomain[i] = Math.pow(Math.E, (Math.log(maxartists) / 6) * (i + 1))
    }
    mydomain = [0, 1, mydomain[0], mydomain[1], mydomain[2], mydomain[3], mydomain[4]];

    color = d3.scale.threshold()
      .domain(mydomain)
      .range(colorArray);
  }

  function updateLegend() {
    //Remove decimals from domain
    var x = 0;
    var len = mydomain.length
    while (x < len) {
      mydomain[x] = Math.ceil(mydomain[x]);
      x++;
    }

    //Array of text
    var legend_labels = [mydomain[0] + "", mydomain[1] + "-" + (mydomain[2] - 1), mydomain[2] + "-" + (mydomain[3] - 1), mydomain[3] + "-" + (mydomain[4] - 1), mydomain[4] + "-" + (mydomain[5] - 1), mydomain[5] + "-" + (mydomain[6] - 1), mydomain[6] + "+"];

    //Create Legend
    legend = svg.selectAll("g.legend")
      .data(mydomain);

    // Change colors on click.
    legend.on("click", function(d, i) {
      if (theme == "white") {
        toGreenWhite();
        redraw();
        return;
      }
      if (theme == "black") {
        toBlueBlack();
        redraw();
        return;
      }
    });

    //Color box sizes
    var ls_w = 20,
      ls_h = 20;

    var enter = legend.enter()
      .append("g")
      .attr("class", "legend");
    enter.append("rect")
      .attr("x", 20)
      .attr("y", function(d, i) {
        return height - (i * ls_h) - 2 * ls_h;
      })
      .attr("width", ls_w)
      .attr("height", ls_h)
      .style("fill", function(d) {
        return color(d);
      });
    enter.append("text")
      .attr("x", 50)
      .attr("y", function(d, i) {
        return height - (i * ls_h) - ls_h - 4;
      });

    legend.selectAll("text").data(mydomain)
      .text(function(d, _, i) {
        return legend_labels[i];
      });
  }

  /*var themeButton = d3.select("#map-container").append("button").attr("class",

    "theme-button").html("Paint it black"); */

  /*var changeTheme = d3.select("#changeTheme").append("button").attr("class",

    "theme-button").html("Paint it black");*/

  var changeTheme = d3.select("#changeTheme").append("div").attr("id", "paintIt").html("Paint it black");



  //Variables for color legend

  var tooltip = d3.select("#map-container").append("div").attr("class",
    "tooltip hidden");

  var infoContainer = d3.select("#map-container").append("div").attr("class",
    "infoContainer").attr("id", "infoContainer");

  var detailsDiv = d3.select("#infoContainer").append("div").attr("class",
    "detailsDiv hidden").attr("id", "details");

  var cnameDiv = d3.select("#infoContainer").append("div").attr("class",
    "cnameDiv hidden").attr("id", "cname");



  var closeButton;

  var offsetL;
  var offsetT;



  //-----------THEME FUNCTIONS---------------------//

  function toBlackTheme() {
    d3.select("body").classed("black-theme", true);
    changeTheme.html("Paint it white");
    changeTheme.style("color", "white");
    colorArray = ["#211f1D", "#211f1D", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"];
    toPinkBlack();
    theme = "black";
    redraw(true);
  }

  function toWhiteTheme() {
    d3.select("body").classed("black-theme", false);
    changeTheme.html("Paint it black");
    changeTheme.style("color", "black");
    colorArray = ["#feebe2", "#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"];
    //toRedWhite();
    theme = "white";
    redraw(true);
  }


  //---------------------- Color preferences -------------//
  function toBlueBlack() {
    colorArray = ["#03020D", "#140E1F", "#2A075A", "#321C78", "#362688", "#3E3CA7", "#4651C5", "#5371F4"];
  }

  function toGreenBlack() {
    colorArray = ["#03020D", "#08120C", "#032F30", "#064137", "#0E6745", "#158C54", "#1CB162", "#28EA78"];
  }

  function toPinkBlack() {
    colorArray = ["#03020D", "#211f1D", "#4B0627", "#5C1138", "#7E285C", "#A13F80", "#C355A4", "#F778DA"];
  }

  function toPinkWhite() {
    colorArray = ["#feebe2", "#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"];
  }

  function toGreenWhite() {
    colorArray = ["#ece2f0", "#F6EBFA", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c"];
  }

  function toRedWhite() {
    colorArray = ["#F0F0D8", "#F0F0D8", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"];
  }

  //-----------THEME BUTTON---------------------//
  /*themeButton.on("click", function(d, i) {
    if (theme == "white") {
      toBlackTheme();
      return;
    }
    if (theme == "black") {
      toWhiteTheme();
      return;
    }
  }); */

  changeTheme.on("click", function(d, i) {
    if (theme == "white") {
      toBlackTheme();
      return;
    }
    if (theme == "black") {
      toWhiteTheme();
      return;
    }
  });

  setup(width, height);

  function setup(width, height) {

    projection = d3.geo.naturalEarth()
      .translate([(width / 2), (height / 2)])
      .scale(width / 1.7 / Math.PI);

    path = d3.geo.path().projection(projection);

    svg = d3.select("#map-container").append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("margin-left", document.getElementById("map-container").offsetWidth / 2 - width / 2)
      .call(zoom)
      .on("click", click)
      .append("g");

    g = svg.append("g");
  }

  //Load country aliases and names
  if (!window.localStorage.countries) {
    d3.csv("../static/countries.csv", function(err, countries) {
      countryNames = countries;

      countries.forEach(function(i) {
        //Turning CSV values into numeric data
        i.id = +i.id;
      });

      // save countries
      window.localStorage.countries = JSON.stringify(countries);
    });

  } else {
    countryNames = JSON.parse(window.localStorage.countries);
  }
  //Load map
  d3.json("../static/world-50m.json", function(error, world) {

    var countries = topojson.feature(world, world.objects.countries).features;

    topo = countries;
    draw(topo, true);

  });

  function draw(topo, redrawMap) {
    var country = g.selectAll(".country").data(topo);

    //Draw countries
    if (redrawMap) {
      country.enter().insert("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("id", function(d, i) {
          return d.id;
        })
        .attr("title", function(d, i) {
          return d.properties.name;
        });
    }
    //Color countries
    country.transition().style("fill", function(d) {
      return countryCount[d.id] ? color(countryCount[d.id].length) :
        color(0);
    })

    //offsets for tooltips
    offsetL = document.getElementById('map-container').offsetLeft;
    offsetT = document.getElementById('map-container').offsetTop;

    //tooltips
    country
      .on("mousemove", function(d, i) {
        var name;
        var tag;
        countryNames.forEach(function(e, i) {
          if (e.id === d.id) {
            name = e.name;
            tag = e.tag;
          };
        })
        var mouse = d3.mouse(svg.node()).map(function(d) {
          return parseInt(d);
        });

        tooltip.classed("hidden", false)
          .attr("style", "left:" + (mouse[0] + offsetL + 20) + "px;top:" + (
            mouse[1] +
            offsetT + 10) + "px")
          .html(name + (countryCount[d.id] ? ", number of artists: " +
            countryCount[d.id].length : ""));

      })
      .on("mouseout", function(d, i) {
        tooltip.classed("hidden", true);
      });



    //Show div with top 10 artists for country when clicked
    country.on("click", function(d, i) { //.on("click", clicked)
      var name;
      var tag;
      var id;

      clicked(d);

      countryNames.forEach(function(e, i) {
        if (e.id === d.id) {
          name = e.name;
          tag = e.tag;
          id = d.id;
        };
      })
      var mouse = d3.mouse(svg.node()).map(function(d) {
        return parseInt(d);
      });

      closeButton
        .on("click", function(d, i) {
          //detailsDiv.classed("hidden", true);
          removeArtistDiv();
        }) //"stäng" onclick slutar

    }) // on click slutar

  }
  /*draw slutar här*/



  /*------------------------här börjar alla functioner--------------------------*/


  /*-------redraw----*/
  //den kallas varje gång datan uppdateras. redrawMap är en boolean 
  function redraw(redrawMap) {
    height = window.innerHeight - 10;
    width = document.getElementById('map-container').offsetWidth;
    if (redrawMap) {
      d3.select('svg').remove();
      setup(width, height);
    }

    maxartists = d3.max(d3.keys(countryCount), function(cname) {
      return countryCount[cname].length;
    });
    updateScale();
    updateLegend();

    draw(topo, redrawMap);
  }


  /**
   * Moves the map to the specified location or based on the current zoom event
   * @param  {Array} tr      Optional: Translation tuple [x, y]
   * @param  {Number} sc      Optional: Scale factor
   * @param  {Boolean} animate Optional: Decides whether to animate the map movement
   */
  function move(tr, sc, animate) {
    var t = tr || (d3.event ? d3.event.translate : false) || zoom.translate();
    var s = sc || (d3.event ? d3.event.scale : false) || zoom.scale();

    // If move was not initiated by clicking on a country, deselect the selected country
    if (!tr && !sc && centered) {
      highlightCountry(false);
      removeArtistDiv();
      centered = null;
    }

    var zscale = s;
    var h = height / 4;

    t[0] = Math.min(
      (width / height) * (s - 1),
      Math.max((width * 1.2) * (1 - s), t[0])
    );

    t[1] = Math.min(
      h * (s - 1) + h * s,
      Math.max(height * (1 - s) - h * s, t[1])
    );

    zoom.translate(t);
    zoom.scale(s);

    if (animate) {
      g.transition().duration(950).attr("transform", "translate(" + t + ")scale(" + s + ")");

    } else {
      g.attr("transform", "translate(" + t + ")scale(" + s + ")");
    }

    //adjust the country hover stroke width based on zoom level
    d3.selectAll(".country").style("stroke-width", 1.5 / s);
  }

  var throttleTimer;

  function throttle() {
    window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw(true);
    }, 200);
  }


  //geo translation on mouse click in map
  function click() {
    var latlon = projection.invert(d3.mouse(this));
    // console.log(latlon);
    console.log(countryCount);
  }


  /*----------------------------makeArtistDiv------------------------------------------------*/
  //Skapar "details-on-demand"-divarna.
  function makeArtistDiv(d) {


    //lägga till namn till detailseDiv
    var name;
    var tag;
    //var id;
    countryNames.forEach(function(e, i) {
      if (e.id === d.id) {
        name = e.name;
        tag = e.tag;
        //id = d.id;
      };
    })
    //Show country name and info div on left hand side
    cnameDiv
      .classed("hidden", false)
      .attr("style", "left:" + (width / 10) +
        "px;top:" + (height / 14) + "px")
      .append("div").attr("class", "cnameContainer").attr("id", "cnameCont")
      .append("h1").html(name);
    d3.select("#cnameCont").append("h5")
      .html(numbersWithSpace(countryCount[d.id].length) + " artists, " + numbersWithSpace(getCountryPlaycount(d)) + " plays")


    if (countryCount[d.id]) { //Om landet vi klickat på har lyssnade artister.

      //Show details about the country
      detailsDiv
        .classed("hidden", false)
        .attr("style", "left:" + (width / 2) +
          "px;top:" + (offsetT + 70) + "px");
      //Show country name

      closeButton = d3.select('#details').append("button").attr("type", "button").attr("class", "close-button").html("X");

      /*d3.select("#details").append("h3")
        .html("You have visited " + name + " through " + countryCount[d.id].length + " artists")
        .attr("class", "details-h");*/
      d3.select("#details").append("h4")
        .html("Top artists: ")
        .attr("class", "details-h2");



      for (i = 0; i < 5; i++) {
        if (countryCount[d.id][i]) {
          var artistDiv = d3.select("#details").append("div").attr("class", "artist-div");
          var artistLink = artistDiv.append("a").style("display", "block").attr("href", countryCount[d.id][i].url)
            .attr("target", "_blank");
          artistLink.append("div")
            .attr("class", "image-div")
            .style("background-image", "url(" + "'" + countryCount[d.id][i].image + "'" + " )");

          var playCountDiv = artistDiv.append("div").attr("class", "play-count-div");

          playCountDiv.append("p")
            .html(countryCount[d.id][i].artist + " playcount: " + countryCount[d.id][i].playcount)
            .attr("class", "details-p");
        } else {
          i = 5;
        }
      }
    } else { //Om landet vi klickat på inte har några lyssnade artister... 
      //Här ska vi skapa rekommendations-div.
      console.log("landet har inga lyssnade artister");
    }
  }

  function removeArtistDiv() {
    detailsDiv.classed("hidden", true);
    d3.selectAll(".artist-div").remove("div");
    d3.select(".close-button").remove("button");
    d3.select(".details-h").remove("p");
    d3.select(".details-h2").remove("h4");


    cnameDiv.classed("hidden", true);
    d3.select("#cnameCont").remove("h1");
    d3.select("#cnameCont").remove("h5");
  }

  /**
   * Toggles highlight of a specified country
   * @param  {Boolean} highlight      Specifies whether to highlight or "dehighlight"
   * @param  {Object} countryElement The country element to highlight (needs to have an "id" property)
   */
  function highlightCountry(highlight, countryElement) {
    d3.selectAll(".country").classed("highlighted", false);

    if (highlight) {
      // Fade out all other countries
      d3.selectAll(".country").transition()
        .style("opacity", function() {
          return (+this.id === +countryElement.id ? 1.0 : 0.3);
        })

      var ce = d3.select(document.getElementById("" + countryElement.id)); // d3 can't select ids that are only numbers
      ce.classed("highlighted", true);
    } else {
      // Fade in all countries
      d3.selectAll(".country").transition()
        .style("opacity", 1.0)
    }

  }

  function clicked(d) { //d är det en har klickat på

    var x, y, k;
    //bounding box for clicked country
    var b = path.bounds(d);

    getCountryPlaycount(d);

    //Set scale
    var modscaleX = (b[1][0] - b[0][0]);
    var modscaleY = (b[1][1] - b[0][1]);

    //Dom't zoom too far with small countries!
    if (modscaleX < 80)
      modscaleX = 80;

    //Landet är inte centrerat redan
    if (d && centered !== d) {
      centered = d;
      removeArtistDiv();
      makeArtistDiv(d);
      highlightCountry(true, d);


      //Special rules for special countries:
      switch (d.id) {
        case 840: //US
          k = 3;
          x = -(b[1][0] + b[0][0]) / 3;
          y = -(b[1][1] + b[0][1]) / 1.7;
          break;
        case 250: //France
          k = 7.012;
          x = -(b[1][0] + b[0][0]) / 1.8;
          y = -(b[1][1] + b[0][1]) / 3.4;
          break;
        case 528: //Netherlands
          k = 9.0124;
          x = -(b[1][0] + b[0][0]) / 1.5;
          y = -(b[1][1] + b[0][1]) / 3.3;
          break;
        case 643: //Russia
          k = 1.9;
          x = -(b[1][0] + b[0][0]) / 1.25;
          y = -(b[1][1] + b[0][1]) / 2;
          break;
        case 554: //New Zeeland
          k = 4;
          x = -(b[1][0] + b[0][0]) / 0.90;
          y = -(b[1][1] + b[0][1]) / 1.8;
          break;
        case 36: //Australia
          k = 3.3;
          x = -(b[1][0] + b[0][0]) / 1.8;
          y = -(b[1][1] + b[0][1]) / 2.1;
          break;

        default: //Everybody else
          k = .55 / Math.max(modscaleX / width, modscaleY / height);
          x = -(b[1][0] + b[0][0]) / 2 - (width / k) / 4;
          y = -(b[1][1] + b[0][1]) / 2;
          break;
      }

      //Landet är redan centrerat
    } else {
      x = -width / 2;
      y = -height / 2;
      k = 1
      removeArtistDiv();
      highlightCountry(false);
      centered = null;
      //detailsDiv.classed("hidden", true);
    }

    var pt = projection.translate();
    // Tell map to move with animation
    // Basically does the same as before: translate to middle,
    // then to x and y with respect to scale
    move([pt[0] + x * k, pt[1] + y * k], k, true);

  }

  //function to add points and text to the map (used in plotting capitals)
  function addpoint(lat, lon, text) {

    var gpoint = g.append("g").attr("class", "gpoint");
    var x = projection([lat, lon])[0];
    var y = projection([lat, lon])[1];

    gpoint.append("svg:circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("class", "point")
      .attr("r", 1.5);

    //conditional in case a point has no associated text
    if (text.length > 0) {

      gpoint.append("text")
        .attr("x", x + 2)
        .attr("y", y + 2)
        .attr("class", "text")
        .text(text);
    }

  }

  /** "PUBLUC" FUNCTIONS **/
  map.putCountryCount = function(list) {
    countryCount = list;


    redraw();
  }
})(window, document)