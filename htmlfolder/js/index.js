
var table = $('#table');
var submit=false;
var Gettimer
var Getcurrentprice
var Retreievetable

Retreievetable=setInterval(retreivetable,100)
Gettimer=setInterval(getime,100)
Getcurrentprice=setInterval(getcurrentprice,100)
//Create click event on Submit button
$("#click").on("click", myFunction);

//Function for updating table
function updatetable(mydata){
$("#table tr").remove(); 
table.append( '<tr>'+'<td>User ID</td><td>Name</td><td>Price Auction</td>'+'</tr>' )
for(var i=0;i<Object.keys(mydata).length;i++){
  table.append( '<tr>'+'<td>'+mydata[i].id+'</td><td>'+mydata[i].name+'</td><td>'+mydata[i].price+'</td>'+'</tr>' )
}
}

function myFunction() {
    var username=$('#username').val()
    var price=$('#price').val()
    var reWhiteSpace = new RegExp("\\s+");
    if(username==""||reWhiteSpace.test(username)){
      M.toast({html: "Please fill the username!!!!", classes: 'red  rounded',displayLength: 6000})
      return;
    }
    if(price==""||reWhiteSpace.test(price)){
      M.toast({html: "Please fill the price or Put Price as integer!!!!", classes: 'red  rounded',displayLength: 6000})
      return;
    }
    var result = confirm("Do you want to bid?");
    if(result){
    var sendingdata={
      num1:username,
      num2:price
    }      
    $.get("/pushdata",sendingdata)
    .done(function (data) {
      var mydata = JSON.parse(data);
      var keyCount  = Object.keys(mydata).length;
      updatetable(mydata)
      submit=true;
      $('#username').val('')
      $('#price').val('')
      M.toast({html: "Successful!" ,classes: 'green  rounded',displayLength: 6000})
  }).fail(function (jqXHR, textStatus) {
    M.toast({html: jqXHR.responseText, classes: 'red  rounded',displayLength: 6000})
  });
}
}
//Function get time and get the winner when time=0
function getime(){
    $.get("/Timer",function(data)
    {
      if(data.min!=null||data.sec!=null){
      $('#timer').html(data.min +" minutes"+ "  "+data.sec+" seconds")
      if(data.min==0&&data.sec==0){        
      $('#result').html("CONGRATULATIONS FOR WINNING THIS AUCTION IS: " +data.winner+" with price: " +data.lastprice+" AU $")
       clearInterval(Gettimer)
       clearInterval(Getcurrentprice)
       clearInterval(Retreievetable) 
     }
   }

   });
  
}
//Function get current price
function getcurrentprice(){
  $.get("/getcurrentprice",function(data){
   if(data.count!=0){
    $('#currentprice').html("Current Auction Price: AU $" +data.price +" (You must bid higher than current auction price 50$ and can not bid 2 times CONSECUTIVELY)"  ) 
   }
   else{
    $('#currentprice').html("Starting Price From: AU $" +data.price)
   }
   });

}
//Function to updata table
function retreivetable(){
  $.get("/retrivedatatotable",function(data){
    var mydata = JSON.parse(data);
    updatetable(mydata)
 });
}