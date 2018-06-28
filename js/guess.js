// Compensation Controls_450,2f,50 Violet Stained Control_018.fcs  Compensation Controls_695,2f,40 Blue Stained Control_013.fcs  CST_After_002.fcs       EV_Packet_1068_007.fcs
// Compensation Controls_525,2f,50 Violet Stained Control_019.fcs  Compensation Controls_712,2f,21 Red Stained Control_016.fcs   CST_Before_001.fcs      Size_Beads_003.fcs
// Compensation Controls_530,2f,30 Blue Stained Control_011.fcs    Compensation Controls_780,2f,60 Blue Stained Control_014.fcs  EV_Packet_1008_005.fcs  Size_SSC324_004.fcs
// Compensation Controls_575,2f,25 Blue Stained Control_012.fcs    Compensation Controls_780,2f,60 Red Stained Control_017.fcs   EV_Packet_1020_006.fcs  Triton_Packet_1020_009.fcs
// Compensation Controls_670,2f,30 Red Stained Control_015.fcs     Compensation Controls_Unstained Control_010.fcs               EV_Packet_1022_008.fcs

//Events Packets:
//Count_Packet
//EPC_Packet
//EV_Packet
//Tang_Packet (t-angiogenic)
//TANG_Packet
//Triton_Packet

//LVAD
//EV_Packet
//Triton_Packet

// major categories in events trial
//    1204 Compensation Controls_#,#f,# Blue Stained Control_#.fcs
//     969 Compensation Controls_#,#f,# Red Stained Control_#.fcs
//     646 Compensation Controls_#,#f,# Violet Stained Control_#.fcs
//     323 Compensation Controls_Unstained Control_#.fcs
//     316 CST_After_#.fcs
//     317 CST_Before_#.fcs
//     573 EV_Packet_#.fcs
//     317 Size_Beads_#.fcs
//     315 Size_SSC#.fcs
//     320 Triton_Packet_#.fcs

// size beads are used in the analysis (calibration controls)
// triton is a negative control
// cst are qc files

var trials=  {
     "Events":{
        types: ["Packet","EPC","TANG","Triton","Size_Beads","Size_SSC","CST_After","CST_Before","Blue Stained","Red Stained","Violet Stained","Unstained"],
     },
     "LVAD":{
        types: ["Packet","Triton"]
     },
     'Titrations':{
        types: ["EV Titration","Cell Titration","EV Titration Check"]
     }
  };
