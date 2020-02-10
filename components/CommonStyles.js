import React, { Component } from "react";
import { StyleSheet } from "react-native";
import * as Constants from '../helpers/Constants';

const CommonStyles =  StyleSheet.create({
    circleIconText:{
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        fontSize: 12,
        fontFamily: Constants.APP_BODY_FONT,
        textAlign: 'center',
        paddingTop: 3 
      },
      popupContainer: {
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        zIndex: 1000,
        backgroundColor: "rgba(255,255,255,0.85)"
      },
      popup: {
        backgroundColor: Constants.BACKGROUND_WHITE_COLOR,
        padding: 25,
        borderTopRightRadius: 40,
        borderBottomLeftRadius: 40,
        borderRadius: 5,
        width: "85%",
        overflow: "hidden",
        shadowOpacity: 0.75,
        shadowRadius: 50,
        shadowColor: "black",
        shadowOffset: { height: 0, width: 0 },
        elevation: 10
      },
      popupLine: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 20
      },
      popupText:{
        fontFamily: Constants.APP_BODY_FONT, 
        fontSize: 15,
        textAlign: 'left',
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        textAlignVertical: 'center',
      },
      popupTitle:{
        fontFamily: Constants.APP_SUBTITLE_FONT, 
        fontSize: 18,
        textAlign: 'center',
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        textAlignVertical: 'center',
        marginBottom: 30
      },
      popupSubtitle:{
        fontFamily: Constants.APP_BODY_FONT, 
        fontSize: 12,
        textAlign: 'center',
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        textAlignVertical: 'center',
        marginTop: 8,
        marginBottom: 20
      }
});

export default CommonStyles;