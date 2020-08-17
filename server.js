const express = require('express')
const app = express()
const port = 3000

//Run node as a web server for hosting static files (html)
app.use(express.static(__dirname+"/htmlfolder"))

var countdown
var countdownreal
var countdowntime
var idnumber=0
var interval=setInterval(timer,100)
var firstprice="1000"
class Node{
    constructor(id,name,price,prev,next){
    this.id=id
    this.name=name
    this.price=price
    this.prev=prev||null
    this.next=next||null
    }
}
//Using Linkedlist
class LinkedList{
    constructor(){
      this.head=null
      this.tail=null
  }
  //Push node to end of List
   appendlist=function(id,name,price){
      if(this.tail==null){
          this.head=this.tail=new Node(id,name,price)
      }
      else{
          let oldtail=this.tail
          this.tail=new Node(id,name,price)
          oldtail.next=this.tail
          this.tail.prev=oldtail
      }
  }
  //search user by name
  search=function(name){
    let currentnode=this.head
    while(currentnode){
    if(currentnode.name==name){   
        return currentnode
    }
    currentnode=currentnode.next
 }
 return null
 }
}
var listuser=new LinkedList()
// Check validation before going to next function
app.use("/",function(req,res,next){
    var username=req.query.num1
    var price=parseInt(req.query.num2)
    var id
   var bool= checkpreviousbet(listuser,username)
    if(bool==false){
    //Error when you are the latest bidder. You can not bid    
    res.status(400).send("Error:Your bidding is the latest one and you can not bid 2 times CONSECUTIVELY. Please wait other person bid for continue bidding")
    }
    else if(listuser.head!=null&& (parseInt(price)-parseInt(listuser.tail.price)<50)){
     
        res.status(400).send("Error: The next bid must be higher than previous bid 50$")
    }
    else if(parseInt(price)<1000){
        res.status(400).send("Error: The bid must be higher than beginning price")
    }
    else{
        next()
    }
})
var turnontimedown=false
//Function for calculate countdown time.
function timer(){
    // Get today's date and time
    if(turnontimedown==true){
    var now=new Date()     
    // Find the distance between now and the count down date
    var distance = countdownreal - now;  
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    countdowntime={min:minutes ,sec:seconds,winner:"Empty"}
    if(minutes==0 && seconds==0){
        clearInterval(interval)
    }
}
}

//Send  current countdown time and  winner result when time=0
app.get("/Timer",function(req,res){
    turnontimedown=true;
    var countdown=new Date()
    var countdownreal=new Date (countdown );
    countdownreal.setMinutes ( countdown.getMinutes() + 2 );    
    if(countdowntime!=null&& countdowntime.min==0&&countdowntime.sec==0){
      if(listuser.head==null){
          countdowntime["winner"]="NO ONE WIN FOR THIS PRODUCT"
          res.send(countdowntime)
      }
      else{
        countdowntime["winner"]=listuser.tail.name
        countdowntime["lastprice"]=listuser.tail.price
        res.send(countdowntime)
      }
    }
    else{
    res.send(countdowntime)
    }
})

//Function to check the previous bet person
function checkpreviousbet(listuser,username){
    var bool=true
    if(listuser.head!=null){
        if(username==listuser.tail.name){
            bool=false
            return bool
        }
        else{
            bool=true
            return bool
        }
    }
}


//Return the betting information to array.
function pushdatatotable(listuser){
    var listobject=[]
    let currentnode=listuser.head
    while(currentnode){
    var text={ id:  currentnode.id,name: currentnode.name,price: currentnode.price}
    listobject.push(text)
    currentnode=currentnode.next
    }
    return listobject
}

//Return current betting price.
app.get("/getcurrentprice",function(req,res){
    if(listuser.head==null){
    var text={ price:firstprice,count:0}
    res.send(text)
    }
    else{
    var text={ price:listuser.tail.price,count:1}
    res.send(text)
    }
})

//Send all user information for table updating on UI
app.get("/retrivedatatotable",function(req,res){
    res.setHeader('Content-Type', 'text/html');
    var listobject  = pushdatatotable(listuser)
    res.send(listobject)
})


//Retrieve the information of user from UI and update new countdown time.
app.get("/pushdata",function(req,res){
    if(countdowntime!=null&&countdowntime["winner"]!="Empty"){
        //Error when auction session is closed    
        res.status(400).send("Error: The auction time is closed. You can not bet anymore")   
    }
    else{
    res.setHeader('Content-Type', 'text/html');
    var username=req.query.num1
    var price=parseInt(req.query.num2)
    var id
    var resultsearch= listuser.search(username)
    if(resultsearch==null){
    idnumber=idnumber+1
    id=idnumber
    }
    else{
        id=resultsearch.id  
    }
  listuser.appendlist(id,username,price)
  var listobject  =pushdatatotable(listuser)
  var countdown=new Date()
  countdownreal=new Date (countdown );
  countdownreal.setMinutes ( countdown.getMinutes() + 2 );
  res.send(listobject)
}
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
