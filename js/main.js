(function(){
//^ Proteccion de las variables con scope...
// Vue...
var app = new Vue({
  el: "#app",
  data: {
    table_header: ["Name", "Party", "State", "Years in Office", "Votes w/ Party"],
    members: [],
    states: []
  }
});

var app2 = new Vue({
  el: "#app2",
  data: {
    header_glance: ["Party", "Total Reps", "Avg Voted w/ Party"],
    header_att: ["Name", "Missed Votes", "% Missed"],
    header_loyal: ["Name", "Party Votes", "% Votes w/ Party"],
    glance: [{
      id: "Democrats",
      number: 0,
      avg_votes: 0
    }, {
      id: "Republicans",
      number: 0,
      avg_votes: 0
    }, {
      id: "Independents",
      number: 0,
      avg_votes: 0
    }, {
      id: "Total",
      number: 0,
      avg_votes: 0
    }],
    least_engaged: [],
    most_engaged: [],
    least_loyal: [],
    most_loyal: []
  }
});
  
// AJAX Call...
$(function() {  
    var dataBase;
    function AJAXcall (url, init) {
      fetch(url, init)
        .then(function(response) {
            return response.json();
        }).then(function(objeto) {
            dataBase = objeto;
            app.members = objeto.results[0].members;
            var estados = app.members.map(function(x){return x.state;}).sort();
            app.states = outRepeat(estados);
            if ($("body").hasClass("stats")) {
              goStatistics();
            } else if ($("body").hasClass("main-data")){
              filtros();
            }
        }).then(function() {
            mejorarTabla();
        }).catch(function() {
          if (dataBase == undefined) {
            alert("Sorry! The Server is not responding. Please wait...");
          }
        });
    }
    if ($("body").hasClass("senate")) {
      AJAXcall("https://api.propublica.org/congress/v1/113/senate/members.json", {
                  headers: new Headers({
                    "X-API-Key": "e3nYJLRk0HCvGgOUmMHbA7u7RBhgStECveNbuFRT",
                  })});
    }
    if ($("body").hasClass("house")) {
      AJAXcall("https://api.propublica.org/congress/v1/113/house/members.json", {
                  headers: new Headers({
                    "X-API-Key": "e3nYJLRk0HCvGgOUmMHbA7u7RBhgStECveNbuFRT",
                  })});
    }
})
  
// Funcion para eliminar repetidos de una Array...
function outRepeat(array) {
  var resultado = [];
  for (i=0; i < array.length; i++) {
    if (i == array.indexOf(array[i])) {
      resultado.push(array[i]);
    }
  }
  return resultado;
}

// Funcion para filtrar las tablas...
function filtros(){
  
  var cantFilas = app.members.length;
  $("#rowsShown").html(cantFilas);
  $("#rowsTotal").html(cantFilas);

  function updateUI() {
        var checkedBoxes = Array.from(document.querySelectorAll("input[name=party-filter]:checked")).map(ele => ele.value),
            state = $("#state-filter").val(),
            states = state ? [state] : [];
    
        $(".table > tbody > tr").each(function () {
            var party = $(this).find("td:nth-child(2)").text(),
                state = $(this).find("td:nth-child(3)").text(),
                selection = isIncluded(state, states, party, checkedBoxes);
            $(this).toggle(selection);
          });

        var nFilas = $("tr[style=\"display: none;\"]").length;
        $("#rowsShown").html(cantFilas - nFilas);
      }
  // devuelve true or false, dependiendo la seleccion del filtro. True lo muestra el toggle, false lo oculta.
  function isIncluded(x, lst, p, c) {
    return c.indexOf(p) != -1 && lst.length === 0 || c.indexOf(p) != -1 && lst.indexOf(x) != -1;
  }

  $("#state-filter").change(updateUI);
  $("input[name=party-filter]").change(updateUI);
}

// Función para BOTTOM 10% or TOP 10%, sin dejar afuera repetidos... x = el arreglo, type = "bottom" o "top", prc = nro % de desvio...
function BottomOrTopPrc (x, type, prc) {
  var array = Array.from(x);
  var resultado = [];
  var i=0;
  while (resultado.length <= x.length*prc/100 || array.indexOf(data) != -1) {
    if (type==="bottom") {var data = Math.min.apply(null, array);
    } else if (type==="top") {var data = Math.max.apply(null, array);}
    resultado.push(data);
    var index = array.indexOf(data);
    array.splice(index, 1);
    i++;
  }
  return resultado;
};

// Funcion para calcular estadisticas y volcar en el Vue...
function goStatistics() {
  
  var D_Votes = [];
  var D_VotesSum = 0;
  var R_Votes = [];
  var R_VotesSum = 0;
  var I_Votes = [];
  var I_VotesSum = 0;
  var totalVotes = [];
  var votesMissed = [];
  
  app.members.map(function(x) {
      if (x.party === "D") {
        D_Votes.push(x.votes_with_party_pct);
        D_VotesSum += x.votes_with_party_pct;
      } else if (x.party === "R") {
        R_Votes.push(x.votes_with_party_pct);
        R_VotesSum += x.votes_with_party_pct;
      } else if (x.party === "I") {
        I_Votes.push(x.votes_with_party_pct);
        I_VotesSum += x.votes_with_party_pct;
      }
    totalVotes.push(x.votes_with_party_pct);
    votesMissed.push(x.missed_votes_pct);
  });

  app2.glance[0].number = D_Votes.length;
  app2.glance[1].number = R_Votes.length;
  app2.glance[2].number = I_Votes.length;
  app2.glance[3].number = D_Votes.length + R_Votes.length + I_Votes.length;
  
  app2.glance[0].avg_votes = ((D_VotesSum / D_Votes.length)||0).toFixed(2);
  app2.glance[1].avg_votes = ((R_VotesSum / R_Votes.length)||0).toFixed(2);
  app2.glance[2].avg_votes = ((I_VotesSum / I_Votes.length)||0).toFixed(2);
  app2.glance[3].avg_votes = (((D_VotesSum+R_VotesSum+I_VotesSum) / (D_Votes.length+R_Votes.length+I_Votes.length))||0).toFixed(2);

  var leastLoyal = BottomOrTopPrc(totalVotes, "bottom", 10);
  var mostLoyal = BottomOrTopPrc(totalVotes, "top", 10);
  var leastEngaged = BottomOrTopPrc(votesMissed, "top", 10);
  var mostEngaged = BottomOrTopPrc(votesMissed, "bottom", 10);
  
  app.members.map(function(x) {
    if (leastLoyal.indexOf(x.votes_with_party_pct) > -1) {
      app2.least_loyal.push({fname: x.first_name, mname: x.middle_name, lname: x.last_name, party_votes: x.total_votes, prc_votes: x.votes_with_party_pct});
    }
    if (mostLoyal.indexOf(x.votes_with_party_pct) > -1) {
      app2.most_loyal.push({fname: x.first_name, mname: x.middle_name, lname: x.last_name, party_votes: x.total_votes, prc_votes: x.votes_with_party_pct});
    }
    if (leastEngaged.indexOf(x.missed_votes_pct) > -1) {
      app2.least_engaged.push({fname: x.first_name, mname: x.middle_name, lname: x.last_name, missed_votes: x.missed_votes, prc_missed: x.missed_votes_pct});
    }
    if (mostEngaged.indexOf(x.missed_votes_pct) > -1) {
      app2.most_engaged.push({fname: x.first_name, mname: x.middle_name, lname: x.last_name, missed_votes: x.missed_votes, prc_missed: x.missed_votes_pct});
    }
  });
}

// -----DataTable + Colorbox Framework-----
function mejorarTabla() {
  $(".uptable").dataTable({
    "bPaginate": false,
    "bInfo" : false,
    fixedHeader: true
  });
  $(".locura").colorbox({iframe:true, width:"80%", height:"80%"});
}

})()