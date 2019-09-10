var heros = [];
var ids = [];
var inc = 0;
var next = 0;
var last;
  
base_url = "https://akabab.github.io/superhero-api/api/";
$(function(){
  getResult();
});  

function getResult(){
  $("#loading").show();
  $.ajax({
    url: base_url+"all.json",
    success: function(data){
      changes(data[0]);
      $("#loading").hide();
      $.each(data, function(i, v){
        heros.push(v.name);
        ids.push(v.id);
      });
    }
  });
  autocomplete(document.getElementById("input_hero"), heros);
  last = (ids.length - 1)
}

$("#form_hero").submit(function(event){
  event.preventDefault();
  index = heros.indexOf($("#input_hero").val());
  if(index != -1){
   $("#loading").show();
   next = index;
    $.ajax({
      url: '/get',
      method: 'POST',
      dataType: 'json',
      data: { n1: ids[index] },
      success: function(data){
        changes(data);
        $("#loading").hide();  
      }
    });
  }else{}
});

function changes(obj){
  $("#name").html(obj.name);
  $("#img").attr("src", obj.images.lg);
  $("#fullname").html(obj.biography.fullName);
  $("#aliases").html(obj.biography.aliases[0]);
  $("#gender").html(obj.appearance.gender);
  $("#alignment").html(obj.biography.alignment);
  $("#intel").html(obj.powerstats.intelligence);
  $("#dur").html(obj.powerstats.durability);
  $("#str").html(obj.powerstats.strength);
  $("#speed").html(obj.powerstats.speed);
  $("#power").html(obj.powerstats.power);
  $("#group").html(obj.connections.groupAffiliation);
  $("#family").html(obj.connections.relatives);
}

function slider(act){
  if(act == "right"){
   if( next == last){
     next = 0;
    }else{
       next += 1;
    }
   }else if(act=="left"){
      if(next == 0){
         next = last;
      }else{
       next -= 1;
      }      
   }  
   $.ajax({
    url: '/get',
    method: 'POST',
    dataType: 'json',
    data: { n1: ids[next] },
    success: function(data){
    changes(data);  
    }
  }); 
}




function autocomplete(inp, arr) {
  var currentFocus;
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);
      for (i = 0; i < arr.length; i++) {
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          b = document.createElement("DIV");
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
              b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });

  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
      } else if (e.keyCode == 38) { 
        currentFocus--;
        addActive(x);
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}