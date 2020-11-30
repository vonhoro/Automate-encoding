# Automate encoding tools

This is a set of functions wirtten on javascript with the intention of automating the process of encoding using x264 and vspipe.

---
# How to use
You need to install vspipe portable and have it inside a folder named bin at the same level as Modules.

You can call any function on Modules in any order you want to make yur own script but you could also use the scripts like doEverything.js or createComparitions.js.

---
# Modules

## checkTrackType.js

### const { isAudioTrack } = require("./Modules/checkTrackType.js")
    function
    Input:Object
    return: Boolean
    This function receives as an argument an from mediainfo with the track information, 
    if it is an audio track it returns true, if it is not it returns false

### const { isVideoTrack } = require("./Modules/checkTrackType.js")
    function
    Input:Object
    return: Boolean
    This function receives as an argument an from mediainfo with the track information, if it is an video 
    track it returns true, if it is not it returns false
## createComparitionScreenshots.js
### const { createComparitionScreenshots }  =  require("./Modules/createComparitionScreenshot.js")
    async function
    Input:{ogVideo:String, encodedVideo:String, positions:[Integer], outputFolder:String, ogExtraOptions:String}
    return: void
    This functions creates screenshots of ogVideo with the format frameNumeberSourceMetadata.png and encodedVdeo
    with the format frameNumeberEncodedMetadata.png. The number of frames will be  equal to positions.length, 
    in the positions given by the same array.You can pass extra options to the ogVideo on ogExtraOptions, they must 
    follow vapoursynth rules. The screenshot will be in outputFolder/screenshots. The screenshots will have information 
    about the video like the frame it was taken and the type of picture.

## createScreenshots.js
### const { createScreenshots }  = require("./Modules/createScreenshots.js")
    async function
    Input:{video:String,name:String, positions:[Integer], outputFolder:String, ogExtraOptions:String}
    return: void
    This functions creates screenshots of the video with the format frameNumberName.png.
    The number of frames will be equal to positions.length, in the positions given by the same array.
    You can pass extra options to the ogVideo on ogExtraOptions, they must follow vapoursynth rules. 
    The screenshot will be in outputFolder/screenshots. 
## createScreenshotsMetadata.js    
### const { createScreenshotsMetadata }  = require("./Modules/createScreenshotsMetadata.js")
    async function
    Input:{video:String,name:String, positions:[Integer], outputFolder:String, ogExtraOptions:String}
    return: void
    This functions creates screenshots of video with the format frameNumberNameMetadata.png. 
    The number of frames will be  equal to positions.length, in the positions given by the same array.
    You can pass extra options to the ogVideo on ogExtraOptions, they must follow vapoursynth rules. 
    The screenshot will be in outputFolder/screenshots.
    The screenshots will have information about the video like the frame it was taken and the type of picture.
    
## cropFunction.js    
### const { cropVertically }  = require("./Modules/cropFunction.js")
    async function
    Input:folder:String, name:String
    return:{ removeTop:Integer, removeBottom:Integer }
    This functions analyses the screenshots with name on folder, then it will calculate how large
    are the black borders on top and bottom and returns thouse values that can be used for cropping.
### const { cropHorizontally }  = require("./Modules/cropFunction.js")
    async function
    Input:folder:String, name:String
    return:{ removeRight:Integer, removeLeft:Integer }
    This functions analyses the screenshots with name on folder, then it will calculate how large
    are the black borders on right and left and returns thouse values that can be used for cropping.
## dox264Tests.js
### const { dox264Tests }  = require("./Modules/dox264Tests.js")
```js 
async function
Input:{ video:String, extraOptions:String , fps:String, resolution:String,  isAnime:Boolean,  isPtp:Boolean}
return:void
This functions creates screenshots and small clips of the given video, if isPtp is true it uses the settings 
on p2px264Settings.js if not it will use the ones in settings.js. If isAnime is true and isPtp is true it will 
always use --aq-mode 2. The screenshots will be at jobrandomHex/testName/screenshots/frameNumberTestedSetting.png 
and jobrandomHex/testName/screenshots/frameNumberNameTestedSettingMetadata.png for each testname and 
TestedSetting. The clips will be on jobrandomHex/testName/TestedSetting.mkv and its log 
at jobrandomHex/testName/TestedSetting-log.txt.
```
