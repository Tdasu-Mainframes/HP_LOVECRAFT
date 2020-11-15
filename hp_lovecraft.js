//////////////////////////////
//                          //
//    Constants and Info    //
//                          //
//////////////////////////////

// Target mainframe
TARGET_HOST = '127.0.0.1';

START_FIELD = 0x1D;

// Video Attributes
// Bit 	Mask 	Meaning
// 7 	0x80 	0
// 6 	0x40 	0
// 5 	0x20 	1
// 4 	0x10 	UNDERSCORE
// 3 	0x08 	INVISIBLE
// 2 	0x04 	REV.VIDEO
// 1 	0x02 	BLINKING
// 0 	0x01 	DIM
AND_VISIBLE = 0xF7;


// Data Type Summary
// Always set to 000 as free

//Data Attributes
// Bit 	Mask 	Meaning
// 7 	0x80 	0
// 6 	0x40 	1
// 5 	0x20 	PROTECT
// 4 	0x10 	TAB DISABLE
// 3 	0x08 	DATA TYPE
// 2 	0x04 	DATA TYPE
// 1 	0x02 	DATA TYPE
// 0 	0x01 	MDT

AND_PROTECT = 0xDF;
AND_FREE = 0xF1;

SOH = 0x01
B = 0x42;
C = 0x43;
ETX = 0x03


ESC = 0x1B;
W = 0x57;
X = 0x58;
SIX = 0x36;
SQUAREBRACKET = 0x5b;
LF = 0x0a;
CF = 0x0d;
MODE = "S"

current_log = ""
var currentdate;


function output(data) {
  console.log(data);
  current_log += data + "\n";
}

function onLoad() {
  current_log += "HP Non Stop at " + TARGET_HOST + "\n"
  currentdate  = "./logs/" + new Date() + ".log"; 
  writeFile(currentdate, current_log)
}


function onData(from, to, data) {
  log_debug('Received data from ' + from);
  if(from == TARGET_HOST){
    output('Data From Server: ' + data);
    output('PrettyData From Server: ' + prettyprint(data));
    modeSet(data);
    makeVisible(data);
    makeFree(data);
    if (MODE = "B"){
      unprotect(data);
    }

  }
  else {
    output('Data From Client: ' + data);
    output('PrettyData From Client: ' + prettyprint(data));
  }
  writeFile(currentdate, current_log)
}


function prettyprint(data) {
  var prettydata = "";
  for (i = 0; i < data.length; i++) {
    if(data[i] == ESC){
      prettydata += "[ ESC-"
      command = data[i + 1];
      i ++;
      prettydata += String.fromCharCode(command) ;
      if(command == SIX){
        video_attr = data[i + 1];
        i ++;
        prettydata += " " + video_attr.toString(2) + " ] ";
      }
      else if(command == SQUAREBRACKET){
        video_attr = data[i + 1];
        data_attr = data[i + 2];
        additional_attr = data[i + 3];
        i += 3;
        prettydata += " " + video_attr.toString(2) + " ";
        prettydata += data_attr.toString(2) + " ";
        prettydata += additional_attr.toString(2) + " ] ";
      }
      else {
        prettydata += " ] ";
      }
    }
    else if (data[i] == START_FIELD){
      prettydata += "[ GS "
      video_attr = data[i + 1];
      data_attr = data[i + 2];
      i += 2;
      prettydata += video_attr.toString(2) + " ";
      prettydata += data_attr.toString(2) + " ] ";
    }
    else if (data[i] == SOH){
      prettydata += " SOH "
    }
    else if (data[i] == CF){
      prettydata += String.fromCharCode(LF);
    }
    else{
      prettydata += String.fromCharCode(data[i]);
    }
  }
  return prettydata;
}

function unprotect(data) {
  var i;
  for (i = 0; i < data.length; i++) {
    if (data[i] == ESC) {
      if(data[i + 1] == SQUAREBRACKET) {
        data[i + 3] = data[i + 3] & AND_PROTECT
      }
    }
    else if (data[i] == START_FIELD) {
      data[i + 2] = data[i + 2] & AND_PROTECT
    }

  }
  return data;
}


function makeVisible(data) {
  var i;
  for (i = 0; i < data.length; i++) {
    if (data[i] == ESC) {
      if (data[i + 1] == SIX ) {
        data[i + 2] = data[i + 2] & AND_VISIBLE
      }
      else if(data[i + 1] == SQUAREBRACKET) {
        data[i + 2] = data[i + 2] & AND_VISIBLE
      }
    }
    else if (data[i] == START_FIELD) {
      data[i + 1] = data[i + 1] & AND_VISIBLE
    }

  }
  return data;

}

function makeFree(data) {
  var i;
  for (i = 0; i < data.length; i++) {
    if (data[i] == ESC) {
      if(data[i + 1] == SQUAREBRACKET) {
        data[i + 3] = data[i + 3] & AND_FREE
      }
    }
    else if (data[i] == START_FIELD) {
      data[i + 2] = data[i + 2] & AND_FREE
    }

  }
  return data;
}


function modeSet(data) {
  var i;
  for (i = 0; i < data.length; i++) {
    if (data[i] == SOH) {
      NEWMODE = data[i + 1]
      if (NEWMODE == B) {
        MODE = 'B';
        console.log('BLOCK MODE');
      }
      else if (NEWMODE == C) {
        MODE = 'C';
        console.log('CONVO MODE');
      }
    }
    if (MODE == 'B' || MODE == 'P') {
      if (data[i] == ESC) {
        COMMAND = data[i + 1]
        if (COMMAND == W) {
          MODE = 'P';
          console.log('PROTECT MODE');
        }
        else if (COMMAND == X) {
          MODE = 'B';
          console.log('BLOCK MODE (LEFT PROTECT)');
        }
      }
    }

  }

}
