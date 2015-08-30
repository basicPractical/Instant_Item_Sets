//NOTE TO ANYONE WHO READS THIS CODE
//YES IT'S SPAGHETTI, A HABIT I'M BREAKING AS WE SPEAK

/* FUNCTION LIST FOR NAV
  
  Match Functions: grabMatchedItemsByChampId, matchItems, 
    grabMatchesWithId, getMatches, checkAndSaveMatches, 

   getDataDragonVersion, getItemWithImage, 

  Champion Functions: getChampNames , setChampData, updateLocalFilePath 
    grabUniqueChampIds

  Misc Functions:  getSummonerId, grabStoredData, Build_JSON_File
  
  Events: checkItems_Click,  getData_Click 

  */

/* TODO
  SAVE USERNAME IN LOCAL STORAGE 

  REMOVE BASIC ITEMS FROM ITEM LIST?  
  IMPROVE FREQUENT ITEMS LOGIC
*/

/* LINKS

AJAX RETRY https://github.com/dcherman/jQuery.ajaxRetry
    ajax param --> shouldRetry: 3

FILESAVER.JS https://github.com/eligrey/FileSaver.js
  SYNTAX: FileSaver saveAs(in Blob data, in DOMString filename)
  var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-16"});
  saveAs(blob, "hello world.txt");

*/


var ALLCHAMPS ={}, MAXITEMSINGAME = 6,
  dataDragonVersion = 0,
  matchArray = [], theMatchedItems = {}, voidedItems = [],
  champsFound = [],   
  localFilePath = "C:\\Riot Games\\League of Legends\\Config\\Champions\\",
  userValues
;//tears

//JSON FILE STUFF JSON FILE STUFF JSON FILE STUFF JSON FILE STUFF 
//JSON FILE STUFF JSON FILE STUFF JSON FILE STUFF JSON FILE STUFF 
var Big_JSON_String,
  Big_JSON_Object = {
	"title": "Instant Item Set", //need a var for title
	"type": "custom",
	"map": "any",
	"mode": "any",
	"priority": false,
	"sortrank": 0
		//"blocks": bjsBlockArray //add bjsBlockArray to Big_JSON_Object 
};


var bjsBlockArray = [], 
  bjsBlock = {
		"type": "A block", //need a var for type
		"recMath": false,
		"minSummonerLevel": -1,
		"maxSummonerLevel": -1,
		"showIfSummonerSpell": "",
		"hideIfSummonerSpell": ""
		//"items": bjsItemArray //add bjsItemArray

  };

var bjsItemArray = [], bjsBlockType, bjsTitle, 
  bjsItemChunk = {
    "id": "1001", 
    "count": 1
  };

var startingItems = [{"count":1,"id":"3340"},{"count":1,"id":"3341"},{"count":1,"id":"2003"},{"count":1,"id":"2004"},{"count":1,"id":"2044"},{"count":1,"id":"2043"},{"count":1,"id":"3302"},{"count":1,"id":"3301"},{"count":1,"id":"3303"}],
 basicItems = [{"count":1,"id":"1001"},{"count":1,"id":"1028"},{"count":1,"id":"1011"},{"count":1,"id":"1033"},{"count":1,"id":"1029"}],
 basicUpgrades = [{"count":1,"id":"3364"},{"count":1,"id":"3161"},{"count":1,"id":"3162"},{"count":1,"id":"3067"},{"count":1,"id":"3097"}],
 consumables = [{"count":1,"id":"2137"},{"count":1,"id":"2138"},{"count":1,"id":"2139"},{"count":1,"id":"2140"}],
 itemArrayArray = [startingItems, basicItems, basicUpgrades, consumables],
 blockType = ["Starting Items", "Basic Items", "Basic Upgrades", "Consumables"]
 ;//tears


function Build_JSON_File(){
  bjsTitle = "Riot JSON Contest"; 
  bjsBlockType = "Most Common Items";
  formatMatchedItems();
  bjsItemChunk = formatMatchedItems(); //Set Items
  itemArrayArray.push(bjsItemChunk);
  blockType.push('Automatic Item Block');

  for (var i = 0; i < itemArrayArray.length ; i++)
  {
    bjsBlock = {};
    bjsBlock['type'] = blockType[i]; //nope sorry no dot notation
    bjsBlock['items'] = itemArrayArray[i]; //nope sorry no dot notation 
    bjsBlockArray.push(bjsBlock);
      
  } //end loop  
  Big_JSON_Object['blocks'] = bjsBlockArray; //nope sorry no dot notation 
  Big_JSON_Object.title = document.getElementById('foundChampsList').value + " " + Big_JSON_Object.title;
  
  return JSON.stringify(Big_JSON_Object);  

}//end Build_JSON_File


// DOCUMENT READY DOCUMENT READY DOCUMENT READY DOCUMENT READY DOCUMENT READY DOCUMENT READY 
// DOCUMENT READY DOCUMENT READY DOCUMENT READY DOCUMENT READY DOCUMENT READY DOCUMENT READY 

$( document ).ready(function() {
  console.log( "document ready!" );   
  
	//EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS 
	//EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS 
 

  document.getElementById('saveFile').addEventListener('click', saveFile);  
  document.getElementById('getData').addEventListener('click', getData_Click);
  document.getElementById('checkItems').addEventListener('click', checkItems_Click);     
  document.getElementById('foundChampsList').addEventListener('change', updateLocalFilePath);  
    
  grabChampNames();
  dataDragonVersion = getDataDragonVersion(); //here for future, don't hate 

  document.getElementById("playerName").select();

});//end doc ready


function getData_Click(){
var playerName = document.getElementById('playerName').value,
  champName = document.getElementById('foundChampsList').value;     
    
  if(playerName){
    grabMatchesWithId(playerName, champName, function(result){    
      document.getElementById('checkItems').disabled = false;

      grabMatchedItemsByChampId(); //Creates matchedItems
      console.log('THE MATCHED ITEMS', theMatchedItems);
      var itemIdArray = Object.keys(theMatchedItems);           
      for (var i = 0; i < itemIdArray.length; i++)
      {
         (function (iCopy) { 
         //preserve i, not worried about the function in loop in this case
            "use strict";             
             testValidItem( itemIdArray[iCopy], function(data){               
               
               //remove voided items
               if(!data){
                 console.log('Void Item Found!:', itemIdArray[iCopy] );                
                 removeVoidItem(iCopy);
                
               }//end if                               
             });//end testValidItem callback            
        }(i));//end self executing function       
      }//end loop
    });//end grabMatchesWithId callback
  }//end if
  else{
    showStatusMessage('Input Summoner Name.');
  }

}// end getData_Click

function removeVoidItem(index){
  var itemIdArray = Object.keys(theMatchedItems);

  voidedItems.push(itemIdArray[index]);
  console.log( 'Item Removed:');
  delete theMatchedItems[ itemIdArray[index] ]; 
  
}//end removeVoidItem

function saveFile(){  /* DISALLOWED NAMES  {championKey}SR.json 
  {championKey}TT.json   {championKey}DM.json {championKey}ASC.json  
  {championKey}PG.json  */

  console.log('Saving File:'); 
  var theFilename = document.getElementById('foundChampsList').value + 'AutoSet.json',      
    filePath = "",  
    jsonBlob
  ;//tears  

  jsonBlob = new Blob([Big_JSON_String], {type: "text/plain;charset=utf-16"});
  saveAs(jsonBlob, theFilename);          

  showStatusMessage('Item Set Saved. Filepath Copied to Clipboard.');
}  //end save file  

function updateLocalFilePath(ev){
  //#foundChampsList's change event function
  document.getElementById('filePath').value = 
  localFilePath + document.getElementById('foundChampsList').value + "\\Recommended\\";  
           
} //end updateLocalFilePath  

function showStatusMessage(message){
 document.getElementById('copyFileStatus').innerHTML = message;
  setTimeout(function(){ 
    document.getElementById('copyFileStatus').innerHTML = "";
  }, 3000);    

} //end showStatusMessage

function copyLocalFilePath(ev){
  console.log('test');
    //#copyFilePath's click event function
   var copyTextArea =  document.getElementById('filePath');
   copyTextArea.style.display = 'inline';
     copyTextArea.select();
   var copiedText = document.execCommand('copy');
   copyTextArea.style.display = 'none';
   console.log(copiedText);
  
  showStatusMessage('Folder Location Copied.');

} //end copyLocalFilePath  

function checkItems_Click(){
  var playerName = document.getElementById('playerName').value,
    champName = document.getElementById('foundChampsList').value;    
    
    grabMatchedItemsByChampId(); //Creates matchedItems
    Big_JSON_String = Build_JSON_File();      
 
    //UI CHANGES      
    document.getElementById('saveFile').disabled = false;
    showStatusMessage('Save file or add another summoner name.');   

} //end checkItems.click

//JSON FILE JSON FILE JSON FILE JSON FILE JSON FILE JSON FILE JSON FILE JSON FILE 
//JSON FILE JSON FILE JSON FILE JSON FILE JSON FILE JSON FILE JSON FILE JSON FILE 

function formatMatchedItems(){ //for build_big_json_file
  console.log('Matched Items!!!!', theMatchedItems);

  var list = theMatchedItems;
  keysSorted = Object.keys(list).sort(function(a,b){return list[a]-list[b];});
  keysSorted = keysSorted.reverse();
  console.log(keysSorted);
	var newItemsArray = [], tempItemObject = {},
	  i;
	
	for (i = 0; i < keysSorted.length ; i++)
	{  tempItemObject = {};
	   tempItemObject.id = keysSorted[i];
	   tempItemObject.count = 1;
	   
	   newItemsArray.push( tempItemObject);

	} //end loop
	console.log(newItemsArray);
  
  return newItemsArray;

} //end formatMatchedItems


//CHAMPION LOGIC CHAMPION LOGIC CHAMPION LOGIC CHAMPION LOGIC CHAMPION LOGIC 
//CHAMPION LOGIC CHAMPION LOGIC CHAMPION LOGIC CHAMPION LOGIC CHAMPION LOGIC

function grabChampNames(){

  getChampNames( function(champs){
    console.log(champs);
    
    var x = Object.keys(champs.data);

    for (var i = 0; i < x.length ; i++)
    {
      var option = document.createElement("option");
      option.text = x[i];  
     
     var select = document.getElementById('foundChampsList');
     select.appendChild(option);


    } //end loop
      $('#foundChampsList').html($('#foundChampsList option').sort(function (a, b) {
        return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
      }));//end sorting 
    document.getElementById('foundChampsList').selectedIndex = 0;
  }); 

}//end grabChampNames

function getChampNames(callback){ 
  
  var theURL = "getChampions.php";   
  
  $.ajax({
    url: theURL,
    dataType: 'json',
    shouldRetry: 3
  })  
   .done(function(data){
     console.log('Champs Found:',data);
     ALLCHAMPS = data.data;
     return callback(data);
  })
   .fail(function(data){
     showStatusMessage('Error! Reload App');
     return 0;
  });//end ajax
    
} //end loadChampNames 

function grabUniqueChampIds(){  //returns array of uniqueChampIds
  var keyName, iValue, jValue, i, j,
    uniqueIds = []
  ;//tears

  for (i = 0; i < sessionStorage.length; i++)
  {
    keyName = sessionStorage.key( i );
    iValue = grabStoredData(keyName);
    
    if( uniqueIds.indexOf(iValue.champId) < 0 ){ //-1 = false
     
      uniqueIds.push ( iValue.champId);
    
    } //end if 
  } //end loop i
  console.log('Repeated Champs:', uniqueIds);

  return uniqueIds;  

} //grabUniqueChampIds 

function setChampData(theURL){
   $.ajax({
    url: theURL,
    shouldRetry: 3,
    dataType:"json"
  })
   .done(function(data){
     console.log('champId data:', data);
    
     var option = document.createElement("option"),
       select = document.getElementById("foundChampsList");
       
       option.text = data.key;     
       select.appendChild(option);
       updateLocalFilePath(); 

   })
     .fail(function(){
       console.log('ERROR setChampData');
   });//end ajax
  
}//end setChampData

//MATCH LOGIC MATCH LOGIC MATCH LOGIC MATCH LOGIC MATCH LOGIC MATCH LOGIC 
//MATCH LOGIC MATCH LOGIC MATCH LOGIC MATCH LOGIC MATCH LOGIC MATCH LOGIC 

function grabMatchedItemsByChampId(){ //creates theMatchedItems by champ id
 
  var keyName, iValue, jValue, i, j,  
    jCounter = 0
  ;//tears
  
  champsFound = grabUniqueChampIds(); //NO NEED TO SEARCH FOR NEW UNIQUE CHAMPS NOW

  for (i = 0; i < sessionStorage.length; i++)
  {
    keyName = sessionStorage.key( i );
    iValue = grabStoredData(keyName);
    
    if( champsFound.indexOf(iValue.champId) >= 0 ){ //put champId in array, do tests (-1 is false for indexOf)

      //champsFound.push ( iValue.champId);
      for (j = i+1; j < sessionStorage.length; j++)
      {  
        jValue = grabStoredData(sessionStorage.key( j ) );
        if(iValue.champId == jValue.champId)
        {           
          //CALL FUNCTION TO COMPARE ITEMS
          matchItems(iValue.items, jValue.items);
          jCounter++;
        }//end if
    } //end loop j
    } //end if else      
  } //end loop i
  console.log('count', jCounter, 'Repeated Champs:', champsFound);  

}//end grabMatchedItemsByChampId


function matchItems(list1, list2){ //list1, list2 description: 2 sets of item arrays
  //notes
 
  var i,j, theCountForThisItem;
  
    for (i = 0; i < list1.length; i++)
    {   
    	//SEARCH THE MATCHED ITEMS FOR list1[i] RETRIEVE COUNT AND SET VALUE
    	if(  list1[i] && (list1[i] in theMatchedItems) ) {
    	  theCountForThisItem = theMatchedItems[list1[i] ]; }
    	else{ 
    		theCountForThisItem = 0;      		
    	}// end if
      for (j = 0; j < list2.length; j++)
      {
        if( list1[i] && (list1[i] == list2[j]) ) {
          //push to counter
          theCountForThisItem++;        

        }//end if
      } //end inner loop j
      
       if(theCountForThisItem)        
       {
         theMatchedItems[ list1[i] ] = theCountForThisItem;
       } 
    } //end outer loop i
  
} //end matchItems

function grabMatchesWithId(aName, aChampName, callback){ // description: 
  //notes    
  var aChampId = ALLCHAMPS[aChampName].id;

  console.log( "getting Summonmer Id");  

  getSummonerId( aName, function(theId){
  	console.log('summoner id:', theId, 'CHAMP ID', aChampId);
    console.log('getting Matches:');

   
    getMatchesForChamp(theId, aChampId, function(result){    
  	  console.log('getMatchesForChamp result:', result);
      
      if (result.length !== 0){
        
        showStatusMessage('Matches Loaded.');
        checkAndSaveMatches(result);
        callback();  //TEST

      }//end if
      else{
        showStatusMessage('No Matches Found.');
      }// end if else	
	  }); //end getMatches assignment //RENAME TO MORE RELEVANT NAME?    
  }); //end getSummonerId  
} //end grabMatchesWithId

function getMatchesForChamp(summonerId, champId, callback) {
  var theURL = "getMatchHistoryForChamp.php?id=" + summonerId + '&champId=' + champId,
    formattedData = {}, championId = champId
    ;//tears
  
  $.ajax({
    url: theURL,
    shouldRetry: 3,
    dataType: 'json'
  })
    .done(function(data){
       console.log('Match Data Found');        
       
       //matches loops
       var gameStats, aChampId, gameId, combinedDataPiece = {};
       if (data.matches) for (var i = 0; i < data.matches.length; i++)
       { 
         combinedDataPiece = {};
         gameStats = data.matches[i].participants[0].stats;
         aChampId = data.matches[i].participants[0].championId;
         gameId = data.matches[i].matchId;
             
         var itemArray = [];
         for (var x = 0; x < MAXITEMSINGAME; x++) //6 = max number of items in game
         {  
           itemArray.push( gameStats['item' + x] ) ;
         }
         
         combinedDataPiece.champId = aChampId;
         combinedDataPiece.items = itemArray;
         combinedDataPiece.gameId = gameId;     
         matchArray.push(combinedDataPiece);  

       } //end loop
       
      return callback(matchArray);

    })
    .fail(function(){
      console.log('getMatchesForChamp Failed');      
      showStatusMessage('Error Getting Matches.');

    });
  
}//end getMatchesForChamp
  
function checkAndSaveMatches(matches){ //matches description: array of matches
  //notes  
  var i;
	for (i = 0; i < matches.length ; i++) {
	  //preppedKey = 'game' + i;	    
	  preppedKey = matches[i].gameId;	 

		//CHECK KEYS HERE 
    var y, keyName, dontSet = false;

    console.log('checking keys vs local storage');    
    for (y = 1; y < sessionStorage.length; y++)
    {    	
    	keyName = sessionStorage.key( i );
    	if (preppedKey == keyName){
    		//console.log('dont Set?', dontSet);    		
        dontSet = true;
        
    	} //end if
    	
    } //end loop y 		  
  
    if (!dontSet){    	
  	  sessionStorage.setItem(preppedKey, JSON.stringify(matches[i]));  
    }//end if
	} //end loop of matches array	i  	
} //end checkMatchResults


//BASIC DATA STUFF BASIC DATA STUFF BASIC DATA STUFF BASIC DATA STUFF BASIC DATA STUFF 
//BASIC DATA STUFF BASIC DATA STUFF BASIC DATA STUFF BASIC DATA STUFF BASIC DATA STUFF 

function grabStoredData(key){ 

	var retrievedObject;
   try{
     retrievedObject = JSON.parse( sessionStorage.getItem(key) );
	   return retrievedObject;  		     
    }
    catch (err) 
    {
      return 0;
    }//end try catch  
	 
} //end getData  

function getSummonerId(summonerName, callback){ //give name get number
  
  var getSummonerIdURL = "idFromName.php?name="  + summonerName;
  console.log('getting Summoner by name from url:', getSummonerIdURL); 
  
  $.ajax({
    url: getSummonerIdURL,
    dataType: 'json',
    shouldRetry: 3
  })     
    .done(function(data) {
    console.log( "Summoner Found", data );
    return callback(data);
  })
    .fail(function(data) {
    showStatusMessage('Summoner Name Invalid.');
    console.log( "ERROR SUMMONER NOT FOUND", data );
    return 0; 
  });//end ajax

}//getSummonerByName

function testValidItem(itemId, callback){
 //GET ITEM
  var getItemURL = "getItemWithImage.php?itemId=" + itemId;
   $.ajax({
    url: getItemURL,
    shouldRetry: 3,
    dataType:"json"
   })  
    .done( function(data) {
      console.log('Item Found With Image:',data);
      return callback(data.image);
    })
    .fail( function(data) {
      console.log('Error Item Not Found:', itemId);     
      return callback(0);

    }); //end ajax


}//end testValidItem


function getDataDragonVersion(callback) {
  var theURL = "realmData.php";
  $.ajax({
    url: theURL,
    shouldRetry: 3,
    dataType:"json"
  })
    .done(function(data){   
      console.log('realm data.dd:', data.dd);
      //return callback(data.dd);
      return data.dd;
    })
    .fail(function(){
      console.error('ERROR GETTING DATADRAGON VERSION');
      showStatusMessage('RELOAD APP, Server Issues');
      return '5.16.1';
    });
 
}//end getDataDragonVersion 


