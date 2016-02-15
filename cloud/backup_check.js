var _ = require('underscore')
var AV = require('leanengine');
var blc = require("broken-link-checker")

var mandrill = require('mandrill-api');
var mandrill_client = new mandrill.Mandrill('5-lEbzv4ZLUII78TutS5Yw');


var backupModule = function () {
};

var brokenlinkMsg="-1";

var checkbrokenlink1=function(checklinkarray,callback){

    var html;
    var htmlChecker;
    var brokenlink=[];

	var gcounter=-1;
	var printOffset=10;
	var i=1;
	var totallink=checklinkarray.length;

    if(gcounter==-2){
      console.log("gcounter==-2 / msg:"+brokenlinkMsg);
    }
    else{
    	var temp = _(checklinkarray).map(function (value){return "<a href='"+value+"'></a>"});

		html = temp.join();

        htmlChecker = new blc.HtmlChecker({}, {
          link: function(result) {
            gcounter++;

            if(result.broken){
              brokenlinkMsg+=result.html.text+" is broken :"+result.url.resolved+"\n";
              brokenlink.push(result.url.resolved);
              // console.log(result.html.index, result.broken, result.html.text, result.url.resolved);
              console.log(result.html.index, result.broken, result.html.text, result.url.resolved);
            }

            if(i%printOffset == 0){
              i=1;
              console.log(gcounter+" links have been checked . ......");
            }else{
            	i++;
            }

            if(gcounter==totallink){
              gcount =-2;
            }
          },
          complete: function() {
            console.log("done checking!");
            gcounter=-2;

            callback(brokenlink);

          }
        });
        htmlChecker.scan(html, "https://mywebsite.com");
    }

}

var getObjectFromClass = function(className,arr){
	var promise = new AV.Promise();

	var CLASS = AV.Object.extend(className);
	var query = new AV.Query(CLASS);
	query.exists('objectId');
	query.limit(1000);
	query.find().then(function(results) {

  	  arr[className]=[]

	  _.each(results, function(item){ 
	  	arr[className].push(item.toJSON())
	  } );

	  promise.resolve(results);
	}, function(error) {
	  	console.log('Error: ' + error.code + ' ' + error.message);
        //return AV.Promise.error(error);
        promise.reject(error);
	});
	return promise;
}

backupModule.hello = function(callback) {

	// var links=["http://smallpdf.com/assets/img/ui/trophy.svg?h=1b05e9bc","http://smallpdf.com/assets/img/ui/trophy.svg?h=1b05e9bc2","www.abc.com2"];

	var links=[];

	var linkArr={};
	var promise2 =getObjectFromClass("Products",linkArr);
	var promise1 =getObjectFromClass("InteriorDesign",linkArr);

	AV.Promise.when(
	  getObjectFromClass("Products",linkArr),
	  getObjectFromClass("InteriorDesign",linkArr)
	).then(function (value) {

		var links1= _.pluck(linkArr.Products, 'ios_object_url');
		var links2= _.pluck(linkArr.Products, 'android_object_url');
		var links3= _.flatten(_.pluck(linkArr.Products, 'images'));
		var links4= _.pluck(linkArr.InteriorDesign, 'ios_object_url');
		var links5= _.pluck(linkArr.InteriorDesign, 'android_object_url');
		var links6= _.flatten(_.pluck(linkArr.InteriorDesign, 'images'));

		links=[].concat(links1,links2,links3,links4,links5,links6);
		// links=[].concat(links6);

		console.log("going to check "+links.length+" links: ");

	    checkbrokenlink1(links,function(brokenlinkarr){
	      	callback.success(JSON.stringify({result: brokenlinkarr}));
	 		 // res.render('brokenlink', { title: 'Express',result: brokenlinkarr });
	    });
	});

}


backupModule.sendemail = function(msg,callback) {
		// console.log(msg);
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day  = date.getDate();
		// console.log(year+"/"+month+"/"+day);

		var title = year+"/"+month+"/"+day+"   istagingHome report";

		msg="<h1>iStaging Home </h1><small>Leancloud Report "+year+"/"+month+"/"+day+"</small>"+msg;

		var params = { 
			"message": {
			    "from_email":"peter@staging.com.tw",
			    "from_name": "leancloud-istagingHome",
			    "to":[{"email":"peter@staging.com.tw", 
			    	"name": "Peter"
			    }],
			    "subject": title,
			    "html": msg
			}
		};

		mandrill_client.messages.send(params, function(res) {
		    console.log("email sent");
		    callback.success((res));
		    // console.log(res);
		    // callback.success(res);
		}, function(err) {
		    console.log(err);
		    callback.error(err);
		});
}


module.exports = backupModule;