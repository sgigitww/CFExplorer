const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');

const app = express();
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",function(req,res){
    res.render("home");
});

let maxRating,profilephoto,curRating;

app.post("/",function(req,res){

    let user_handle = req.body.handle;
    let key = "ce72ebe1d56ebe106c52288686ac4c30c4539f07";
    let secretkey = "e4b23d29ca62a1d0adcf1c234120681bc2bd6941";
    let time =  new Date().getTime();
    time/=1000;
    let hash = "sha512Hex(123456/user.info?handles=" + user_handle + "&apikey=" + key + "&time=" + time + "#" + secretkey + ")";
    let url = "https://codeforces.com/api/user.info?handles=" + user_handle + "&&apikey=" + key + "&time=" + time + "&apiSig=123456" + hash;
    let request = https.request(url,function(response){

         response.on("data",function(data){

            let newData = JSON.parse(data);
            maxRating = newData.result[0].maxRating;
            profilephoto = newData.result[0].titlePhoto;
            curRating = newData.result[0].rating;
            
        });

    }); 

    hash = "sha512Hex(123456/user.status?handle=" + user_handle + "&from=1&apikey=" + key + "&time=" + time + "#" + secretkey + ")";
    url =  "https://codeforces.com/api/user.status?handle=" + user_handle + "&from=1&&apikey=" + key + "&time=" + time + "&apiSig=123456" + hash;

    request.end();
    request = https.request(url,function(response){
        
        let chunks = [];
        response.on("data",function(data){
          chunks.push(data);
            
        }).on('end',function(){
            let data = Buffer.concat(chunks);
            let newData = JSON.parse(data);
            let cntAC = 0,cntWA=0,cntTLE=0,cntRE=0;
            for(var i=0;i<newData.result.length;++i){
                if(newData.result[i].verdict == "OK"){
                    cntAC++;

                }else if(newData.result[i].verdict == "TIME_LIMIT_EXCEEDED"){
                    cntTLE++;
                }else if(newData.result[i].verdict == "WRONG_ANSWER"){
                    cntWA++;
                }else if(newData.result[i].verdict == "RUNTIME_ERROR"){
                    cntRE++;
                }
            }
            res.render("about",{user_rating:curRating , user_handle : user_handle , max_rating : maxRating , photourl : profilephoto ,ac : cntAC , tle : cntTLE , re : cntRE , wa : cntWA});
              
        });
    });

    request.on('error',function(e){
        console.log(e);
    });
    
    request.end();
});


app.listen(process.env.PORT || 8080,function(){
    console.log("Server up on port 3000");
});